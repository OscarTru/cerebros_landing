# Blog Rediseño + Likes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar la página principal del blog con layout editorial con imagen destacada, y agregar un sistema de likes anónimos por artículo usando Supabase.

**Architecture:** El sistema de likes usa una Vercel Edge Function (`api/likes.ts`) que accede a una tabla Supabase `post_likes`. El fingerprint del usuario se genera en el servidor (hash de User-Agent + IP) para evitar duplicados sin login. El frontend tiene un componente `LikeButton` que consulta el estado inicial via GET y envía likes via POST. La página del blog se rediseña en `Blog.tsx` con layout editorial: artículo destacado a ancho completo + grid de 2 columnas para el resto.

**Tech Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Framer Motion + Supabase (ya configurado) + Vercel Edge Functions

---

## File Map

| Acción | Archivo | Responsabilidad |
|--------|---------|-----------------|
| Crear | `api/likes.ts` | Edge Function GET/POST para contar y registrar likes |
| Crear | `src/components/LikeButton.tsx` | Botón de like con estados before/after |
| Modificar | `src/layouts/BlogLayout.tsx` | Agregar `<LikeButton>` antes de `<ShareButtons>` + pasar `slug` como prop |
| Modificar | `src/pages/BlogPost.tsx` | Pasar `slug` a `BlogLayout` |
| Modificar | `src/pages/Blog.tsx` | Rediseño completo con layout editorial + campo `image` |
| Modificar | `src/content/blog/tu-cerebro-no-descansa-cuando-duermes.mdx` | Agregar campo `image` al frontmatter |
| Modificar | `src/content/blog/por-que-el-cafe-protege-tu-cerebro.mdx` | Agregar campo `image` al frontmatter |
| Supabase | `post_likes` (tabla) | Almacenar likes con slug + fingerprint únicos |

---

## Task 1: Crear tabla `post_likes` en Supabase

**Files:**
- No hay archivo — se ejecuta en el dashboard SQL de Supabase

- [ ] **Step 1: Ejecutar SQL en Supabase**

Ve a tu proyecto en supabase.com → SQL Editor → New query. Pega y ejecuta:

```sql
create table post_likes (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null,
  fingerprint text not null,
  created_at  timestamptz default now(),
  unique(slug, fingerprint)
);

-- Permitir lectura pública del conteo (sin autenticación)
alter table post_likes enable row level security;

create policy "Anyone can read likes count"
  on post_likes for select
  using (true);

-- Solo el service role puede insertar (desde la Edge Function)
create policy "Service role can insert"
  on post_likes for insert
  to service_role
  with check (true);
```

- [ ] **Step 2: Verificar que la tabla existe**

En Supabase → Table Editor, confirma que `post_likes` aparece con las columnas `id`, `slug`, `fingerprint`, `created_at`.

---

## Task 2: Crear endpoint `api/likes.ts`

**Files:**
- Crear: `api/likes.ts`

- [ ] **Step 1: Crear el archivo**

```typescript
// api/likes.ts
// Vercel Edge Function — GET /api/likes?slug=xxx  |  POST /api/likes { slug }
//
// Env vars required (same as subscribe.ts):
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "@supabase/supabase-js"

export const config = { runtime: "edge" }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

function fingerprint(req: Request): string {
  const ua = req.headers.get("user-agent") ?? ""
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  // Simple hash: combine ua + ip into a stable string
  const raw = `${ip}|${ua}`
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    hash = (Math.imul(31, hash) + raw.charCodeAt(i)) | 0
  }
  return Math.abs(hash).toString(36)
}

export default async function handler(req: Request): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return json({ error: "Not configured" }, 500)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const fp = fingerprint(req)

  // ── GET /api/likes?slug=xxx ──────────────────────────────────────────────
  if (req.method === "GET") {
    const url = new URL(req.url)
    const slug = url.searchParams.get("slug")
    if (!slug) return json({ error: "Missing slug" }, 400)

    const { count } = await supabase
      .from("post_likes")
      .select("*", { count: "exact", head: true })
      .eq("slug", slug)

    const { data: existing } = await supabase
      .from("post_likes")
      .select("id")
      .eq("slug", slug)
      .eq("fingerprint", fp)
      .maybeSingle()

    return json({ count: count ?? 0, liked: existing !== null })
  }

  // ── POST /api/likes { slug } ─────────────────────────────────────────────
  if (req.method === "POST") {
    let body: { slug?: unknown }
    try {
      body = await req.json()
    } catch {
      return json({ error: "Invalid JSON" }, 400)
    }

    const slug = typeof body.slug === "string" ? body.slug.trim() : ""
    if (!slug) return json({ error: "Missing slug" }, 400)

    const { error: insertError } = await supabase
      .from("post_likes")
      .insert({ slug, fingerprint: fp })

    const already = insertError?.code === "23505"
    if (insertError && !already) {
      console.error("Supabase insert error:", insertError)
      return json({ error: "Could not save like" }, 500)
    }

    const { count } = await supabase
      .from("post_likes")
      .select("*", { count: "exact", head: true })
      .eq("slug", slug)

    return json({ ok: true, count: count ?? 0, already })
  }

  return json({ error: "Method not allowed" }, 405)
}
```

- [ ] **Step 2: Verificar que TypeScript no da errores**

```bash
npx tsc -b 2>&1 | grep -v "Blog 2\|Podcast 2"
```

Expected: sin output (cero errores en archivos nuevos/modificados).

- [ ] **Step 3: Commit**

```bash
git add api/likes.ts
git commit -m "feat: add likes edge function (GET/POST)"
```

---

## Task 3: Crear componente `LikeButton`

**Files:**
- Crear: `src/components/LikeButton.tsx`

- [ ] **Step 1: Crear el componente**

```typescript
// src/components/LikeButton.tsx
import { useState, useEffect } from "react"

interface LikeButtonProps {
  slug: string
}

export function LikeButton({ slug }: LikeButtonProps) {
  const [count, setCount] = useState<number | null>(null)
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/likes?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data: { count: number; liked: boolean }) => {
        setCount(data.count)
        setLiked(data.liked)
      })
      .catch(() => setCount(0))
  }, [slug])

  async function handleLike() {
    if (liked || loading) return
    setLoading(true)
    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      })
      const data = (await res.json()) as { ok: boolean; count: number }
      if (data.ok) {
        setCount(data.count)
        setLiked(true)
      }
    } finally {
      setLoading(false)
    }
  }

  // Loading skeleton
  if (count === null) {
    return (
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="h-3 w-32 rounded bg-[var(--c-surface-2)] animate-pulse" />
        <div className="h-9 w-28 rounded-full bg-[var(--c-surface-2)] animate-pulse" />
      </div>
    )
  }

  // Estado activo: ya dio like
  if (liked) {
    return (
      <div className="flex items-center gap-2">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="#ef4444"
          stroke="#ef4444"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span className="text-sm text-[var(--c-text-muted)]">{count}</span>
      </div>
    )
  }

  // Estado inicial: aún no ha dado like
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--c-text-subtle)]">
        ¿Te gustó este artículo?
      </p>
      <button
        onClick={handleLike}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-[var(--c-border)] bg-transparent text-sm text-[var(--c-text-muted)] hover:border-[var(--c-border-strong)] hover:text-[var(--c-text)] transition-all disabled:opacity-50 cursor-pointer"
        aria-label="Me gustó este artículo"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span className="text-[var(--c-text)]">Me gustó</span>
        <span className="text-[var(--c-text-subtle)] text-xs">· {count}</span>
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc -b 2>&1 | grep -v "Blog 2\|Podcast 2"
```

Expected: sin output.

- [ ] **Step 3: Commit**

```bash
git add src/components/LikeButton.tsx
git commit -m "feat: add LikeButton component"
```

---

## Task 4: Integrar `LikeButton` en `BlogLayout`

**Files:**
- Modificar: `src/layouts/BlogLayout.tsx`
- Modificar: `src/pages/BlogPost.tsx`

El `BlogLayout` necesita recibir `slug` como prop para pasárselo a `LikeButton`. Actualmente `BlogPost.tsx` pasa `title`, `date`, `author`, `description` — hay que agregar `slug`.

- [ ] **Step 1: Actualizar `BlogLayoutProps` y agregar `LikeButton`**

En `src/layouts/BlogLayout.tsx`, reemplaza la interfaz y el componente:

```typescript
// Agregar import al inicio del archivo junto a los demás imports
import { LikeButton } from "@/components/LikeButton"

// Actualizar la interfaz BlogLayoutProps (añadir slug):
interface BlogLayoutProps {
  title: string
  date: string
  author: string
  description: string
  slug: string          // ← nuevo
  children: ReactNode
}

// Actualizar la firma de la función:
export function BlogLayout({ title, date, author, description, slug, children }: BlogLayoutProps) {
```

Luego, en el JSX de `BlogLayout`, localiza la sección de ShareButtons (línea ~136-144) y añade `LikeButton` justo antes:

```tsx
{/* Like button — before share */}
<FadeIn delay={0.1}>
  <div className="mt-16 pt-10 border-t border-[var(--c-border)] flex flex-col items-center">
    <LikeButton slug={slug} />
  </div>
</FadeIn>

{/* Share buttons — after article */}
<FadeIn delay={0.1}>
  <div className="mt-10 pt-10 border-t border-[var(--c-border)]">
    <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-text-subtle)] mb-4">
      Compartir
    </p>
    <ShareButtons title={title} />
  </div>
</FadeIn>
```

- [ ] **Step 2: Pasar `slug` desde `BlogPost.tsx`**

En `src/pages/BlogPost.tsx`, el `BlogLayout` se usa en el return. Busca:

```tsx
return (
  <BlogLayout
    title={frontmatter.title}
    date={frontmatter.date}
    author={frontmatter.author}
    description={frontmatter.description}
  >
```

Cámbialo a:

```tsx
return (
  <BlogLayout
    title={frontmatter.title}
    date={frontmatter.date}
    author={frontmatter.author}
    description={frontmatter.description}
    slug={frontmatter.slug}
  >
```

- [ ] **Step 3: Verificar tipos**

```bash
npx tsc -b 2>&1 | grep -v "Blog 2\|Podcast 2"
```

Expected: sin output.

- [ ] **Step 4: Smoke test manual**

```bash
npm run dev
```

Abre `http://localhost:5173/blog/tu-cerebro-no-descansa-cuando-duermes`. Verifica:
- Aparece la sección con `¿Te gustó este artículo?` y el botón pill
- El botón muestra un número (puede ser 0 si la tabla está vacía)
- Al hacer click el botón cambia a ♥ rojo + número
- Al recargar la página, el botón ya aparece en estado "liked"

- [ ] **Step 5: Commit**

```bash
git add src/layouts/BlogLayout.tsx src/pages/BlogPost.tsx
git commit -m "feat: integrate LikeButton into BlogLayout"
```

---

## Task 5: Rediseñar `Blog.tsx` con layout editorial

**Files:**
- Modificar: `src/pages/Blog.tsx`

- [ ] **Step 1: Reemplazar `Blog.tsx` completo**

```typescript
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"

interface PostMeta {
  slug: string
  title: string
  date: string
  description: string
  author: string
  image?: string
}

const modules = import.meta.glob("../content/blog/*.mdx", { eager: true })

function getAllPosts(): PostMeta[] {
  return Object.entries(modules)
    .map(([, mod]) => {
      const m = mod as { frontmatter?: PostMeta }
      if (!m.frontmatter) return null
      return m.frontmatter
    })
    .filter(Boolean)
    .sort((a, b) => (a!.date < b!.date ? 1 : -1)) as PostMeta[]
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const PLACEHOLDER_GRADIENTS = [
  "linear-gradient(135deg, #1e1b2e, #2d1f3d)",
  "linear-gradient(135deg, #0f1a12, #1a2e1f)",
  "linear-gradient(135deg, #1a1200, #2e2200)",
  "linear-gradient(135deg, #001a1a, #002e2e)",
  "linear-gradient(135deg, #1a000f, #2e0018)",
]

function PostImage({
  image,
  title,
  index,
  className,
}: {
  image?: string
  title: string
  index: number
  className?: string
}) {
  const gradient = PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length]
  if (image) {
    return (
      <img
        src={image}
        alt={title}
        className={className}
        style={{ objectFit: "cover" }}
      />
    )
  }
  return (
    <div
      className={className}
      style={{ background: gradient }}
      aria-hidden="true"
    />
  )
}

export function Blog() {
  const [posts, setPosts] = useState<PostMeta[]>([])

  useEffect(() => {
    setPosts(getAllPosts())
  }, [])

  if (posts.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)]">
        <p className="text-[var(--c-text-subtle)] pt-40 text-center">Cargando artículos...</p>
      </div>
    )
  }

  const [featured, ...rest] = posts

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)]">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-[var(--c-bg)]/70 border-b border-[var(--c-border)]">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-16">
          <Link
            to="/"
            className="font-serif text-xl text-[var(--c-text)] tracking-tight hover:text-[var(--c-text-muted)] transition-colors"
          >
            Cerebros Esponjosos
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="pt-32 pb-24 px-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <div className="inline-block px-4 py-1 border border-[var(--c-border)] rounded-full text-[11px] font-mono tracking-[0.25em] uppercase text-[var(--c-text-subtle)] mb-8">
            · Blog ·
          </div>
          <h1
            className="font-serif leading-[1.05] tracking-[-0.02em] mb-6"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
          >
            <span className="block text-[var(--c-text)]">Neurociencia</span>
            <span className="block italic text-[var(--c-text-faint)]">en palabras claras.</span>
          </h1>
          <p className="text-base text-[var(--c-text-muted)] max-w-xl leading-relaxed">
            Artículos sobre cómo funciona tu cerebro. Sin jerga innecesaria, con las referencias que importan.
          </p>
        </div>

        {/* Featured post */}
        <Link
          to={`/blog/${featured.slug}`}
          className="group block mb-16 border border-[var(--c-border)] rounded-xl overflow-hidden hover:border-[var(--c-border-strong)] transition-colors"
        >
          <PostImage
            image={featured.image}
            title={featured.title}
            index={0}
            className="w-full h-64 sm:h-80 md:h-96"
          />
          <div className="p-6 sm:p-8">
            <time className="text-xs font-mono text-[var(--c-text-subtle)] uppercase tracking-[0.15em] block mb-3">
              {formatDate(featured.date)}
            </time>
            <h2
              className="font-serif text-[var(--c-text)] leading-[1.1] tracking-[-0.02em] mb-3 group-hover:text-[var(--c-text)] transition-colors"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
            >
              {featured.title}
            </h2>
            <p className="text-sm text-[var(--c-text-muted)] leading-relaxed mb-4 max-w-2xl">
              {featured.description}
            </p>
            <div className="flex items-center gap-2 text-xs text-[var(--c-text-subtle)]">
              <span>por {featured.author}</span>
              <span>·</span>
              <span className="flex items-center gap-1 group-hover:text-[var(--c-text)] transition-colors">
                Leer artículo
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>
        </Link>

        {/* Secondary posts grid */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {rest.map((post, i) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group border border-[var(--c-border)] rounded-xl overflow-hidden hover:border-[var(--c-border-strong)] transition-colors"
              >
                <PostImage
                  image={post.image}
                  title={post.title}
                  index={i + 1}
                  className="w-full h-40"
                />
                <div className="p-5">
                  <time className="text-xs font-mono text-[var(--c-text-subtle)] uppercase tracking-[0.15em] block mb-2">
                    {formatDate(post.date)}
                  </time>
                  <h2 className="font-serif text-base text-[var(--c-text)] leading-snug mb-2 group-hover:text-[var(--c-text)] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-xs text-[var(--c-text-muted)] leading-relaxed line-clamp-2 mb-3">
                    {post.description}
                  </p>
                  <span className="text-xs text-[var(--c-text-subtle)]">por {post.author}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc -b 2>&1 | grep -v "Blog 2\|Podcast 2"
```

Expected: sin output.

- [ ] **Step 3: Smoke test manual**

```bash
npm run dev
```

Abre `http://localhost:5173/blog`. Verifica:
- El primer artículo aparece como destacado a ancho completo con placeholder de gradiente
- Los demás artículos aparecen en grid de 2 columnas
- Los cards tienen bordes redondeados y hover funciona

- [ ] **Step 4: Commit**

```bash
git add src/pages/Blog.tsx
git commit -m "feat: redesign blog page with editorial layout"
```

---

## Task 6: Agregar campo `image` a los MDX existentes

**Files:**
- Modificar: `src/content/blog/tu-cerebro-no-descansa-cuando-duermes.mdx`
- Modificar: `src/content/blog/por-que-el-cafe-protege-tu-cerebro.mdx`

El campo `image` es opcional — si no hay imagen disponible, dejar el frontmatter sin el campo (el placeholder de gradiente se usará). Este task es para cuando tengas imágenes reales; por ahora se confirma que el frontmatter es correcto sin él.

- [ ] **Step 1: Verificar que los artículos se ven bien sin `image`**

```bash
npm run dev
```

Abre `http://localhost:5173/blog` y confirma que ambos artículos muestran el placeholder de gradiente correctamente.

- [ ] **Step 2: (Cuando tengas imágenes) agregar `image` al frontmatter**

Cuando tengas las imágenes de portada (colócalas en `/public/assets/blog/`), agrega el campo así:

```mdx
---
title: "Tu cerebro no descansa cuando duermes. Hace algo mucho más importante."
date: "2026-04-10"
slug: "tu-cerebro-no-descansa-cuando-duermes"
description: "..."
author: "Oscar Trujillo"
image: "/assets/blog/sueno-cerebro.jpg"
---
```

- [ ] **Step 3: Commit final**

```bash
git add -A
git commit -m "feat: blog redesign + likes system complete"
git push
```

---

## Notas de implementación

**Fingerprint y privacidad:** El hash de IP+User-Agent es una aproximación — no es infalible (múltiples personas detrás de un NAT comparten IP). Es suficiente para evitar doble-click accidental, no para seguridad fuerte. Esto está dentro del alcance del spec.

**Variables de entorno:** No se necesitan nuevas. `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` ya están configuradas en Vercel.

**El campo `image` en `PostImage`:** Si se pasa una URL externa (ej. de Unsplash), funcionará igual. Si es ruta local, debe estar en `/public/` para que Vite la sirva.
