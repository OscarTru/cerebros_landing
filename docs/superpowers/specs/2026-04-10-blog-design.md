# Blog — Design Spec
**Date:** 2026-04-10
**Project:** Cerebros Esponjosos — Landing

---

## Goal

Add a blog system that allows Oscar & Steph to publish one article per week without touching React code. Each article is a `.mdx` file with frontmatter metadata. Articles are accessible at `/blog/:slug`.

---

## Scope

- Individual article pages only (no index/listing page for now)
- Rich content support: headings, paragraphs, lists, blockquotes, images with captions, inline code
- Consistent with existing design system (tokens, typography, theme toggle)

Out of scope: search, tags, RSS feed, listing page, comments.

---

## Content Format

Each article lives at `src/content/blog/<slug>.mdx`.

### Frontmatter schema

```md
---
title: "Título del artículo"
date: "2026-04-10"
slug: "nombre-del-articulo"
description: "Resumen corto para SEO y vista previa"
author: "Oscar" | "Steph" | "Oscar & Steph"
---
```

All fields are required. `slug` must match the filename (e.g., `nombre-del-articulo.mdx` → `/blog/nombre-del-articulo`).

---

## Routing

- Route: `/blog/:slug`
- Implemented in `src/main.tsx` via a dedicated `<Route>`
- A `BlogPost` page component (`src/pages/BlogPost.tsx`) receives the slug from params and dynamically imports the corresponding `.mdx` file
- If the slug doesn't match any file, render a simple 404 message

### Dynamic import pattern

```ts
const modules = import.meta.glob('../content/blog/*.mdx')
// keyed by path, e.g. '../content/blog/mi-articulo.mdx'
```

---

## Components

### `src/layouts/BlogLayout.tsx`
Reusable layout wrapping all blog articles. Mirrors `LegalLayout` structure:

- **Nav:** Logo link back to `/`, theme toggle
- **Header:**
  - Eyebrow: `Blog · <date formatted as "DD MMM YYYY">`
  - Title: large serif `h1`, `clamp(2.25rem, 5vw, 4rem)`
  - Author + date line: small muted sans
  - Description: lead paragraph in `--c-text-muted`
- **Body:** MDX content rendered inside a `.prose-blog` container
- **Footer:** shared `<Footer />` component

Props:
```ts
interface BlogLayoutProps {
  title: string
  date: string
  author: string
  description: string
  children: ReactNode
}
```

### `src/pages/BlogPost.tsx`
Page component that:
1. Reads `:slug` from `useParams()`
2. Looks up the module in the glob map
3. Dynamically imports it with `React.lazy` / `Suspense`
4. Passes frontmatter to `BlogLayout`, renders MDX body as children

### `src/content/blog/*.mdx`
One file per article. Authors write pure Markdown after the frontmatter block.

---

## Styling — Prose

Add `.prose-blog` styles to `src/index.css` using `--c-*` tokens. No Tailwind Typography plugin needed.

Elements to style:
- `h2`, `h3` — font-serif, `--c-text`, tracked tight
- `p` — `--c-text-muted`, `leading-relaxed`, max-width ~65ch
- `ul`, `ol` — indented, `--c-text-muted`
- `blockquote` — left border `--c-border-strong`, italic, `--c-text-subtle`
- `img` — rounded, full width, with optional `figcaption` in small muted text
- `code` (inline) — monospace, `--c-surface`, small padding, rounded
- `strong` — `--c-text`
- `a` — underline, `--c-text`, hover `--c-text-muted`

---

## Vite Configuration

Add `@mdx-js/rollup` plugin with:
- `remark-frontmatter` — parses YAML frontmatter blocks
- `remark-mdx-frontmatter` — exposes frontmatter as named exports (`export const frontmatter = {...}`)

```ts
// vite.config.ts addition
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'

plugins: [
  { enforce: 'pre', ...mdx({ remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter] }) },
  react(),
]
```

---

## File Structure After Implementation

```
src/
  content/
    blog/
      primer-articulo.mdx       ← first article
  layouts/
    BlogLayout.tsx              ← reusable blog layout
  pages/
    BlogPost.tsx                ← dynamic route handler
  main.tsx                      ← add /blog/:slug route
  index.css                     ← add .prose-blog styles
docs/
  superpowers/
    specs/
      2026-04-10-blog-design.md ← this file
```

---

## Dependencies to Install

```bash
npm install @mdx-js/rollup @mdx-js/react remark-frontmatter remark-mdx-frontmatter
```

TypeScript types (if needed):
```bash
npm install -D @types/mdx
```
