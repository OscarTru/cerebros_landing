# Blog Editor Implementation Plan

**Goal:** Dashboard blog editor con DB storage, editor markdown extendido (toolbar 12 acciones + upload Cloudinary), publicación instantánea al landing, migración de 5 MDX existentes.

**Architecture:** DB-backed (Supabase `blog_posts`), landing renderiza con `MDXRemote` + ISR, revalidation instantánea via API signed con secret compartido. Dashboard paralelo a newsletter editor.

**Tech Stack:** Next.js 15, Supabase, `next-mdx-remote/rsc`, Cloudinary unsigned upload, Resend (no). Toast existente del dashboard.

---

## File structure

**Create:**
- `supabase/migrations/20260424_blog_posts.sql`
- `apps/dashboard/app/api/blog/posts/route.ts`
- `apps/dashboard/app/api/blog/posts/[id]/route.ts`
- `apps/dashboard/app/api/blog/posts/[id]/preview-render/route.ts`
- `apps/dashboard/app/api/blog/posts/[id]/publish/route.ts`
- `apps/dashboard/app/api/blog/posts/[id]/unpublish/route.ts`
- `apps/dashboard/app/(dashboard)/blog/page.tsx`
- `apps/dashboard/app/(dashboard)/blog/editor/[id]/page.tsx`
- `apps/dashboard/app/(dashboard)/blog/editor/[id]/BlogEditorClient.tsx`
- `apps/dashboard/components/blog/BlogPostList.tsx`
- `apps/dashboard/components/blog/BlogMarkdownEditor.tsx`
- `apps/dashboard/components/blog/BlogPreview.tsx`
- `apps/dashboard/components/blog/ImageUploadButton.tsx`
- `apps/dashboard/components/blog/BlogStats.tsx`
- `apps/dashboard/lib/blog/parse-markdown.ts` — helpers: parseHeadings, readingTime, slugify
- `apps/dashboard/scripts/migrate-blog-to-db.ts`
- `apps/web/app/api/revalidate/route.ts`
- `apps/web/app/api/blog/[slug]/view/route.ts`

**Modify:**
- `apps/web/content/blog-utils.ts` → reescribe para leer DB
- `apps/web/app/blog/[slug]/page.tsx` → usa `MDXRemote`
- `apps/web/app/blog/page.tsx` → lee de DB
- `apps/web/package.json` → añade `next-mdx-remote`
- `apps/dashboard/components/Sidebar.tsx` → link "Blog"

**Delete (al final, después de verificar migración):**
- `apps/web/content/blog/*.mdx`

---

## Task 1: Migración SQL

**Files:**
- Create: `supabase/migrations/20260424_blog_posts.sql`

- [ ] Crear SQL con tabla + enum + índices + trigger
- [ ] Aplicar manualmente en Supabase SQL editor
- [ ] Commit

```sql
create type blog_status as enum ('draft', 'published', 'archived');

create table if not exists blog_posts (
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

create index if not exists idx_blog_posts_status_published
  on blog_posts (status, published_at desc);
create unique index if not exists idx_blog_posts_slug on blog_posts (slug);

drop trigger if exists blog_posts_updated_at on blog_posts;
create trigger blog_posts_updated_at
  before update on blog_posts
  for each row execute function set_updated_at();
```

---

## Task 2: Helpers de parsing en dashboard

**Files:**
- Create: `apps/dashboard/lib/blog/parse-markdown.ts`

Funciones:
- `slugify(title: string): string` — lowercase, espacios → `-`, sin tildes, sin caracteres especiales
- `readingTimeMinutes(content: string): number` — `Math.max(1, Math.round(wordCount / 200))`
- `parseHeadings(content: string): Array<{id, text, level}>` — regex `^(#{1,3})\s+(.+)$` línea por línea
- `buildHeadingId(text: string): string` — slugify del text

- [ ] Escribir funciones
- [ ] Type check
- [ ] Commit

---

## Task 3: API dashboard — list + create

**Files:**
- Create: `apps/dashboard/app/api/blog/posts/route.ts`

- `GET`: `requireRole(['owner','editor','viewer'])`. Lista con `id, slug, title, status, views, updated_at, published_at, author`.
- `POST`: `requireRole(['owner','editor'])`. Body `{ title? }`. Si no hay título, default "Sin título". Genera slug único (si existe, añade `-2`, `-3`). Insert minimal.

- [ ] Escribir endpoints con validación
- [ ] Type check
- [ ] Commit

---

## Task 4: API — GET/PATCH/DELETE single post

**Files:**
- Create: `apps/dashboard/app/api/blog/posts/[id]/route.ts`

- `GET` — todos los roles. Devuelve post completo.
- `PATCH` — owner+editor. Body puede tener: `title, description, slug, content, image, tags, author`. Al recibir `content`, recalcula `reading_time` y `headings`. Si slug cambia, validar unicidad (409 si duplicado).
- `DELETE` — solo owner. Si post estaba published, llamar revalidate de landing (`/blog` y `/blog/[slug]`). Después, delete.

- [ ] Escribir endpoints
- [ ] Type check
- [ ] Commit

---

## Task 5: API — preview-render

**Files:**
- Create: `apps/dashboard/app/api/blog/posts/[id]/preview-render/route.ts`

Devuelve HTML con el post renderizado dentro de un layout similar al del landing (reusable). Simple: devolver HTML con CSS embebido que imita el blog.

- [ ] Implementar endpoint
- [ ] Type check
- [ ] Commit

---

## Task 6: API — publish + unpublish

**Files:**
- Create: `apps/dashboard/app/api/blog/posts/[id]/publish/route.ts`
- Create: `apps/dashboard/app/api/blog/posts/[id]/unpublish/route.ts`

`publish`:
- `requireRole(['owner'])`
- Valida: title, content, slug (unique)
- Update status='published', published_at=now()
- Llama revalidate(`/blog/${slug}`) y revalidate(`/blog`)
- Si revalidate falla, devuelve 200 con warning (no bloquea)

`unpublish`:
- `requireRole(['owner'])`
- Update status='draft'
- Revalidate mismos paths

Helper `revalidateLanding(paths: string[])` compartido en `apps/dashboard/lib/revalidate.ts`.

- [ ] Crear helper
- [ ] Crear 2 endpoints
- [ ] Type check
- [ ] Commit

---

## Task 7: Landing — API revalidate + blog view counter

**Files:**
- Create: `apps/web/app/api/revalidate/route.ts`
- Create: `apps/web/app/api/blog/[slug]/view/route.ts`

`revalidate`:
- Valida secret
- Llama `revalidatePath(path)` y `revalidateTag("blog")` (por si acaso)
- Devuelve `{ revalidated: true }`

`view`:
- Rate limit 1/60s por IP+slug via Upstash
- `UPDATE blog_posts SET views = views + 1 WHERE slug = $1 AND status = 'published'`
- Silent fail si error

- [ ] Escribir ambos endpoints
- [ ] Type check
- [ ] Commit

---

## Task 8: Landing — blog-utils reescribe + MDXRemote

**Files:**
- Modify: `apps/web/content/blog-utils.ts`
- Modify: `apps/web/app/blog/[slug]/page.tsx`
- Modify: `apps/web/app/blog/page.tsx`
- Modify: `apps/web/package.json` — añade `next-mdx-remote`

- [ ] `npm install next-mdx-remote` en apps/web (o symlink manual si npm install falla)
- [ ] Reescribir `blog-utils.ts` para leer de Supabase. Mantener la exportación de tipos.
- [ ] Modificar `[slug]/page.tsx` para usar `MDXRemote` en lugar de `import()`. Mantener BlogLayout + EbookCTA.
- [ ] Modificar `/blog/page.tsx` si necesita ajustes (ya consume `getAllPosts`).
- [ ] Añadir `export const revalidate = 60` en `[slug]/page.tsx`
- [ ] Type check apps/web
- [ ] Commit

---

## Task 9: Script migración MDX → DB

**Files:**
- Create: `apps/dashboard/scripts/migrate-blog-to-db.ts`

Script standalone que:
1. Lee `apps/web/content/blog/*.mdx`
2. Parsea frontmatter (implementa parseFrontmatter local, no depende de blog-utils)
3. Por cada post, hace `INSERT ... ON CONFLICT (slug) DO NOTHING` con datos del frontmatter.
4. Output: "X migrados, Y skipped (ya existían)"

Env vars usadas: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (lee de `.env.local` como el otro script).

- [ ] Escribir script
- [ ] Correr `npx tsx` — si tsx falla por entorno, usar shell+curl como hicimos con migración de Resend
- [ ] Verificar 5 filas en DB con SELECT
- [ ] Commit script

**⚠️ NO borrar los MDX en este task.** Eso es un task separado (12) al final, tras verificar todo.

---

## Task 10: Blog stats + lista page

**Files:**
- Create: `apps/dashboard/app/(dashboard)/blog/page.tsx`
- Create: `apps/dashboard/components/blog/BlogPostList.tsx`
- Create: `apps/dashboard/components/blog/BlogStats.tsx`

`BlogStats`: 4 cards (Total posts / Publicados / Drafts / Views totales).

`BlogPostList`: grid de cards con título, status chip, views, updated_at. Click → `/blog/editor/[id]`.

`page.tsx`: server component. Carga stats + lista. Header "Blog" con botón "Nuevo post" (POST crea + redirect).

- [ ] Escribir 3 archivos
- [ ] Type check
- [ ] Commit

---

## Task 11: Blog editor (2-col)

**Files:**
- Create: `apps/dashboard/app/(dashboard)/blog/editor/[id]/page.tsx`
- Create: `apps/dashboard/app/(dashboard)/blog/editor/[id]/BlogEditorClient.tsx`
- Create: `apps/dashboard/components/blog/BlogMarkdownEditor.tsx`
- Create: `apps/dashboard/components/blog/BlogPreview.tsx`
- Create: `apps/dashboard/components/blog/ImageUploadButton.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ ← Título editable   [Guardado ✓]   [Prueba] [Publicar] │
├─────────────────────────────────────────────────────┤
│ Slug: cerebros-...    Desc: ...    Autor: Oscar   │
├─────────────────────────────┬───────────────────────┤
│                             │                       │
│ [B I Link] [H1 H2 H3] [...] │  preview iframe       │
│                             │                       │
│  textarea markdown          │                       │
│                             │                       │
└─────────────────────────────┴───────────────────────┘
```

**BlogMarkdownEditor**: toolbar con 12 botones + keyboard shortcuts. Maneja selection/cursor.

**BlogPreview**: iframe que carga `/api/blog/posts/[id]/preview-render`. Revalidación cuando cambia `previewRev`.

**ImageUploadButton**: file picker → sube a Cloudinary → inserta `![](public_id)` en cursor.

**BlogEditorClient**: wire todo. Autosave 900ms debounce (patron newsletter). Botón "Publicar" solo para owner.

- [ ] Escribir 5 archivos
- [ ] Type check
- [ ] Commit

---

## Task 12: Wire view counter en landing

**Files:**
- Modify: `apps/web/layouts/BlogLayout.tsx` (o donde tenga sentido)

- [ ] Añadir effect que llama `POST /api/blog/${slug}/view` al montar
- [ ] Commit

---

## Task 13: Sidebar link

**Files:**
- Modify: `apps/dashboard/components/Sidebar.tsx`

- [ ] Añadir link "Blog" con ícono `Newspaper` o `FileText` en grupo "Operación"
- [ ] Type check
- [ ] Commit

---

## Task 14: Verificación manual end-to-end

Checklist que usuario corre:
1. [ ] `/blog` del landing muestra los 5 MDX migrados
2. [ ] `/blog/tu-cerebro-no-descansa...` del landing renderiza igual que antes
3. [ ] `/blog` del dashboard lista los 5
4. [ ] Botón "Nuevo post" crea y redirige al editor
5. [ ] Escribes título, slug, content. Autosave funciona.
6. [ ] Click cada botón de la toolbar inserta el markdown correcto.
7. [ ] Upload imagen Cloudinary → URL aparece en content.
8. [ ] Preview iframe actualiza.
9. [ ] "Publicar" → aparece en landing en ≤3s.
10. [ ] Edit del post published → cambios visibles en landing tras revalidate.
11. [ ] View del post → counter incrementa (verificar en DB).
12. [ ] "Unpublish" → desaparece del landing.

---

## Task 15: Borrar MDX viejos (OPCIONAL — solo después de Task 14)

**Files:**
- Delete: `apps/web/content/blog/*.mdx`

- [ ] Confirmar en DB que los 5 posts existen con status published
- [ ] `rm apps/web/content/blog/*.mdx`
- [ ] Verificar landing sigue funcionando
- [ ] Commit

---

## Self-review

**Spec coverage:** cada sección del spec tiene task. ✓

**Placeholders:** no encontrados en este plan.

**Consistency:**
- Env vars: `REVALIDATE_SECRET`, `WEB_URL`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
- Status enum: draft/published/archived consistente en SQL, API, UI
- `blog_posts` tabla + columnas usadas en todas partes iguales
