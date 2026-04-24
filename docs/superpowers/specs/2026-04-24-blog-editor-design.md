# Spec — Blog editor desde Dashboard

Fecha: 2026-04-24
Rama: `feature/dashboard`

## Objetivo

Permitir escribir y publicar posts del blog desde el dashboard, con editor markdown por bloques, preview en vivo idéntico al landing, y publicación instantánea (sin rebuild) hacia el site público. DB-backed para publicación inmediata. Editor con toolbar extendida (h1-h3, listas, quote, separator, imagen, code block, tabla, links, bold/italic) y subida directa de imágenes a Cloudinary.

## Decisiones de producto

| Tema | Decisión |
|------|----------|
| Almacenamiento | Supabase `blog_posts` (migración 3A: los 5 MDX actuales se inyectan a DB) |
| Editor | Textarea markdown enriquecido con toolbar extendida (2B) |
| Imágenes | Subida directa Cloudinary via unsigned upload preset (4B) |
| Permisos | owner publica, editor crea/edita drafts, viewer lee |
| Landing render | `next-mdx-remote/rsc` en runtime, ISR 60s |
| Publicación instantánea | Endpoint `/api/revalidate` en apps/web llamado desde dashboard al publicar |
| Stats | Views counter incrementado por el landing cuando alguien visita el post |

## Scope

**Afecta:**

- Nueva migración Supabase: tabla `blog_posts`.
- `apps/web/content/blog-utils.ts` — reescribe para leer DB, no filesystem.
- `apps/web/app/blog/[slug]/page.tsx` — renderiza MDX con `MDXRemote`.
- `apps/web/app/blog/page.tsx` — lista desde DB.
- `apps/web/app/api/revalidate/route.ts` — nuevo, triggerable desde dashboard.
- `apps/web/app/api/blog/[slug]/view/route.ts` — nuevo, incrementa views.
- `apps/dashboard/app/(dashboard)/blog/page.tsx` — lista + stats.
- `apps/dashboard/app/(dashboard)/blog/editor/[id]/page.tsx` + `EditorClient.tsx`.
- `apps/dashboard/app/api/blog/` — 6 endpoints.
- `apps/dashboard/components/blog/` — nuevos componentes.
- `apps/dashboard/components/Sidebar.tsx` — añadir link "Blog".
- `apps/dashboard/scripts/migrate-blog-to-db.ts` — one-off.

**No afecta:** newsletter, analytics, contenido, colaboraciones.

## Arquitectura

### Data model

```sql
create type blog_status as enum ('draft', 'published', 'archived');

create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  author text,
  image text,
  content text not null default '',
  reading_time int,
  headings jsonb,
  tags text[] default '{}',
  status blog_status not null default 'draft',
  views int not null default 0,
  created_by text not null,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_blog_posts_status_published on blog_posts (status, published_at desc);
create unique index idx_blog_posts_slug on blog_posts (slug);

create trigger blog_posts_updated_at
  before update on blog_posts
  for each row execute function set_updated_at();
```

`headings` es el mismo shape que ya usa el landing: `[{id, text, level}]`. Se recalcula en el server al guardar (parseando `## Heading` del markdown).

### API Dashboard

- `GET /api/blog/posts` — lista todos con stats agregados (count by status + views total). Params: `?filter=all|draft|published|archived`.
- `POST /api/blog/posts` — crea draft vacío. Owner + editor. Body: `{ title? }`. Auto-genera slug del título.
- `GET /api/blog/posts/[id]` — lee uno completo.
- `PATCH /api/blog/posts/[id]` — actualiza title, description, slug, content, image, tags. Auto-recalcula `reading_time` (palabras / 200) y `headings` (parse markdown). Solo permitido si `status ∈ {draft, published}` (puedes editar publicados; al guardar un published, se re-revalida el landing).
- `DELETE /api/blog/posts/[id]` — solo owner. Si status published, también revalida paths en landing para que desaparezca.
- `POST /api/blog/posts/[id]/preview-render` — devuelve HTML renderizado del MDX (para iframe preview estilo newsletter editor).
- `POST /api/blog/posts/[id]/publish` — **solo owner**. Valida: slug único, title no vacío, content no vacío. Cambia status a `published`, set `published_at=now()`. Llama a `revalidatePath` del landing para `/blog` y `/blog/[slug]`.
- `POST /api/blog/posts/[id]/unpublish` — solo owner. Status a `draft`. Revalida landing.
- `POST /api/blog/upload-signature` — solo owner/editor. Devuelve `{ cloudName, apiKey, uploadPreset, folder }` para que el cliente suba directo a Cloudinary sin pasar por nuestro backend. Uses unsigned preset.

### API Landing (apps/web)

- `POST /api/revalidate` — body `{ path, secret }`. Valida `secret === REVALIDATE_SECRET`. Llama `revalidatePath(path)`.
- `POST /api/blog/[slug]/view` — incrementa `views` del post. Rate-limited por IP via `@upstash/ratelimit` (ya está en el stack).

### Landing render

**`blog-utils.ts` cambia completo:**

```ts
import { createClient } from "@supabase/supabase-js"

const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function getAllPosts(): Promise<PostMeta[]> {
  const { data } = await sb
    .from("blog_posts")
    .select("slug, title, description, author, image, reading_time, headings, published_at, tags")
    .eq("status", "published")
    .order("published_at", { ascending: false })
  return (data ?? []).map(toPostMeta)
}

export async function getPostBySlug(slug: string) {
  const { data } = await sb
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle()
  return data
}
```

**`app/blog/[slug]/page.tsx` cambia:**

```tsx
import { MDXRemote } from "next-mdx-remote/rsc"
// ...
const post = await getPostBySlug(slug)
if (!post) return notFound()

return (
  <BlogLayout post={post}>
    <MDXRemote source={post.content} components={mdxComponents} />
  </BlogLayout>
)

export const revalidate = 60 // ISR
```

**`generateStaticParams`** seguirá existiendo, pero ahora lee de DB. Los posts se generan en build con los datos del momento, y luego revalidate=60 + path revalidation mantiene la vista fresca.

### Editor — componentes

- `BlogEditor.tsx` (client, full-screen) — layout 2-col: editor markdown | preview.
- `BlogMarkdownEditor.tsx` — textarea + toolbar extendida (12 acciones) + keyboard shortcuts.
- `BlogPreview.tsx` — iframe que muestra el post rendered con el mismo layout del landing.
- `ImageUploadButton.tsx` — click → file picker → sube a Cloudinary via unsigned preset → inserta `![](cloudinary-id)` en el cursor.
- `BlogStats.tsx` — cards con totales (total posts, publicados, drafts, views totales).

### Editor — bloques de markdown

Toolbar tiene 12 botones. Acciones sobre el textarea:

| Acción | Efecto | Shortcut |
|--------|--------|----------|
| Bold | wrap selección con `**` | ⌘B |
| Italic | wrap con `*` | ⌘I |
| Link | wrap con `[$sel](https://)` | ⌘K |
| H1 | prefijo `# ` al inicio de línea | ⌘1 |
| H2 | prefijo `## ` | ⌘2 |
| H3 | prefijo `### ` | ⌘3 |
| List | prefijo `- ` | ⌘L |
| Quote | prefijo `> ` | ⌘⇧Q |
| Divider | inserta `\n\n---\n\n` | — |
| Image | click → file picker → upload Cloudinary → inserta `![](cloudinary-id)` | — |
| Code | wrap con bloque ` ``` ` | ⌘E |
| Table | inserta template `| col | col |\n|---|---|\n` | — |

El cursor se respeta. Shortcuts con `preventDefault` en keydown del textarea.

### Imágenes — Cloudinary unsigned upload

**Setup manual (usuario):**
1. Cloudinary Dashboard → Settings → Upload → Add upload preset
2. Nombre: `cerebros_blog_unsigned`
3. Signing mode: **Unsigned**
4. Folder: `blog`
5. Allowed formats: `jpg, png, webp, avif`
6. Save. Copiar el nombre del preset.

**Env vars nuevas en `apps/dashboard/.env.local`:**
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=cerebros (o el real)
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=cerebros_blog_unsigned
```

(Prefijo `NEXT_PUBLIC_` porque el upload se hace desde el cliente.)

**Flujo cliente:**
```ts
const formData = new FormData()
formData.append("file", file)
formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)

const res = await fetch(
  `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
  { method: "POST", body: formData }
)
const { public_id } = await res.json()
// insertar `![alt](${public_id})` en el textarea
```

Sin tocar nuestro backend.

### Stats del post

En el dashboard:
- Lista `/blog`: cada card muestra `{ status chip, views, updated_at }`.
- Arriba: 4 cards agregados: Total posts, Publicados, Drafts, Views totales.

En landing:
- `POST /api/blog/[slug]/view` incrementa counter. Rate limit: 1 req por IP cada 60s por slug (evita spam).
- El client del blog post llama esto al montar.

### Publicación → Revalidation

**Dashboard (al publicar):**
```ts
await fetch(`${process.env.WEB_URL}/api/revalidate`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    path: `/blog/${slug}`,
    secret: process.env.REVALIDATE_SECRET,
  }),
})
await fetch(`${process.env.WEB_URL}/api/revalidate`, {
  method: "POST",
  body: JSON.stringify({ path: "/blog", secret }),
})
```

**Landing (`apps/web/app/api/revalidate/route.ts`):**
```ts
import { revalidatePath } from "next/cache"
export async function POST(req: Request) {
  const { path, secret } = await req.json()
  if (secret !== process.env.REVALIDATE_SECRET) {
    return new Response("unauthorized", { status: 401 })
  }
  revalidatePath(path)
  return Response.json({ revalidated: true, path })
}
```

Env nuevas:
- `apps/dashboard/.env.local`: `WEB_URL=http://localhost:3001` (o lo que sea) + `REVALIDATE_SECRET=...`
- `apps/web/.env.local`: `REVALIDATE_SECRET=...` (mismo valor)

### Migración de MDX existentes

Script `apps/dashboard/scripts/migrate-blog-to-db.ts`:
1. Lee `apps/web/content/blog/*.mdx`
2. Parsea frontmatter (reutiliza helper de `blog-utils.ts`)
3. Por cada post: `INSERT ... ON CONFLICT (slug) DO NOTHING`
4. `created_by = 'system-migration'`, `status = 'published'`, `published_at = fecha del frontmatter`

Después de correrlo exitosamente: borrar `apps/web/content/blog/*.mdx` (queda commit aparte).

### Sidebar

Añadir link "Blog" en sidebar dashboard con ícono `FileText` (distinto al de contenido). Grupo: "Operación".

### Error handling

- Slug duplicado al publicar → 409 "Ya existe un post con ese slug".
- Delete de published sin owner → 403.
- Revalidate falla → no bloquea publish (post queda published en DB; user ve toast warning "No se pudo revalidar, el cambio aparecerá en ≤60s").
- Cloudinary upload falla → toast error con mensaje de Cloudinary.
- View counter falla → silent (no bloquea lectura).

### Testing manual

1. Aplicar SQL. Migrar 5 MDX. Verificar `/blog` del landing muestra los 5.
2. Crear post nuevo en dashboard. Guardar. No aparece en landing (draft).
3. Publicar. Landing muestra el post 6 en ≤60s.
4. Editar post publicado. Revalidation instantánea.
5. Subir imagen desde editor → aparece en preview.
6. Visitar post como anónimo → views +1. Doble visita en <60s → sigue 1.
7. Unpublish → desaparece de lista pública.
8. Delete de published → desaparece.

## Out of scope (siguiente iteración)

- WYSIWYG a lo Notion (BlockNote/Tiptap). Hoy es textarea enriquecido.
- Versiones/historial del post.
- Programar publicación (schedule). Hoy es publish inmediato.
- Auto-save cada X segundos. Hoy hay un botón "Guardar" manual + autosave con debounce igual que newsletter.
- Colaboración multi-usuario en tiempo real.
- Tags como entidad separada con su propia vista.
- RSS feed.
- Sitemap auto.
- Signed Cloudinary uploads (con backend approval) — puedes escalar a esto si el preset unsigned da problemas.
