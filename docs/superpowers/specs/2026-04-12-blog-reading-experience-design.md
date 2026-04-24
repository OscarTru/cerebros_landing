# Blog Reading Experience — Design Spec
**Date:** 2026-04-12
**Scope:** Phase 1 of blog quality improvements — reading experience (tiempo de lectura, barra de progreso, índice lateral)

---

## Overview

Enhance the reading experience of individual blog posts with three tightly coupled features:

1. **Tiempo de lectura** — estimated reading time calculated at build time, shown in the post header and blog listing cards
2. **Barra de progreso** — thin fixed bar at the top of the viewport tracking scroll position through the article
3. **Índice lateral con heading activo** — sticky sidebar on desktop (≥1024px) showing `##` and `###` headings, with the currently-visible section highlighted via `IntersectionObserver`

These features are purely frontend — no new API routes, no database changes, no new dependencies.

---

## Feature 1: Tiempo de lectura

### Calculation
- New utility: `src/lib/readingTime.ts`
- Function: `calcReadingTime(content: string): number`
  - Strips frontmatter (everything between `---` delimiters)
  - Strips markdown syntax: `#`, `*`, `_`, `[`, `]`, `(`, `)`, backticks, HTML tags
  - Counts words by splitting on whitespace
  - Divides by 200 (average Spanish reading speed), rounds up with `Math.ceil`
  - Returns minutes as a number (minimum 1)

### Integration into blogMeta
- `PostMeta` interface gains `readingTime: number`
- `blogMeta.ts` imports each MDX file with `?raw` suffix (Vite raw import) to get the source string
- `calcReadingTime` is called per post and stored in the `ALL_POSTS` array at build time
- No runtime computation — value is baked in at import time

### Display
- **BlogLayout header:** Shown between author and the horizontal rule, format: `"5 min de lectura"` in `text-xs text-[var(--c-text-subtle)]` with a clock icon (Lucide `Clock`)
- **Blog listing cards:** Shown as a small secondary label on each card (featured card and grid cards), same style

---

## Feature 2: Barra de progreso de lectura

### Component
- New file: `src/components/ReadingProgressBar.tsx`
- `position: fixed`, `top: 0`, `left: 0`, `z-index: 50`, full viewport width
- Height: 2px
- Background track: transparent
- Fill: `var(--c-invert)` — matches the primary button color, works in both light and dark mode
- Width driven by a `progress` state (0–100)

### Scroll logic
```
progress = scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100
```
- Mounted in a `useEffect` with `window.addEventListener('scroll', handler)`
- Handler wrapped in `requestAnimationFrame` to avoid layout thrash
- Cleanup on unmount

### Integration
- Rendered inside `BlogLayout.tsx`, outside and above the `<nav>` so it overlaps the nav border cleanly
- Not rendered anywhere else in the app

---

## Feature 3: Índice lateral con heading activo

### Heading extraction
- New utility in `src/lib/readingTime.ts` (same file, exported separately):
  `extractHeadings(content: string): Heading[]`
- `Heading` type: `{ id: string; text: string; level: 2 | 3 }`
- Parses lines starting with `## ` or `### ` from the raw MDX (after stripping frontmatter)
- `id` = text lowercased, spaces → hyphens, non-alphanumeric characters removed
  - Example: `"## Por qué olvidamos"` → `id: "por-qué-olvidamos"` (keep accents for readability, they work as IDs)
- Stored in `PostMeta` as `headings: Heading[]`

### DOM anchors
- `BlogLayout` passes a `components` prop to the MDX `<Article>`:
  ```
  h2: ({ children }) => <h2 id={slugify(children)}>{children}</h2>
  h3: ({ children }) => <h3 id={slugify(children)}>{children}</h3>
  ```
- Uses the same slug logic so IDs match what `extractHeadings` produces
- A small `slugify` helper lives in `src/lib/readingTime.ts`

### TableOfContents component
- New file: `src/components/TableOfContents.tsx`
- Props: `headings: Heading[]`
- Internal state: `activeId: string` — updated by `IntersectionObserver`
- Observer setup:
  - Observes all `h2, h3` elements inside `article` (queried after mount)
  - `rootMargin: "-20% 0px -70% 0px"` — only the upper ~30% of the viewport counts as "active"
  - When a heading intersects, sets it as `activeId`
- Renders a `<nav>` with a list of links:
  - Each item: `<a href={`#${heading.id}`}>` with smooth scroll
  - `h3` items indented with `pl-3`
  - Active item: `text-[var(--c-text)] border-l-2 border-[var(--c-invert)] pl-2`
  - Inactive items: `text-[var(--c-text-faint)] hover:text-[var(--c-text-muted)]`
  - Label above list: `"En este artículo"` in `text-[10px] uppercase tracking-[0.2em] text-[var(--c-text-subtle)]`

### Layout integration
- `BlogLayout` main content area changes from a single centered column to a CSS grid on `lg+`:
  ```
  grid-cols-[1fr_220px] gap-16
  ```
  - Left column: existing `max-w-3xl` prose content
  - Right column: `<aside>` with `sticky top-24` containing `<TableOfContents>`
- The `aside` has `hidden lg:block` — invisible on mobile
- On mobile: only `ReadingProgressBar` exists, no TOC

### Only shown when useful
- `TableOfContents` only renders if `headings.length >= 2` — posts with 0 or 1 heading don't get a sidebar

---

## Files Changed

| File | Change |
|------|--------|
| `src/lib/readingTime.ts` | **New** — `calcReadingTime`, `extractHeadings`, `slugify` |
| `src/components/ReadingProgressBar.tsx` | **New** — fixed progress bar component |
| `src/components/TableOfContents.tsx` | **New** — sticky sidebar with IntersectionObserver |
| `src/content/blogMeta.ts` | **Modified** — add `readingTime` and `headings` to `PostMeta`, compute via `?raw` imports |
| `src/layouts/BlogLayout.tsx` | **Modified** — mount `ReadingProgressBar`, add 2-col grid layout, inject heading IDs via MDX components, show reading time |
| `src/pages/Blog.tsx` | **Modified** — display `readingTime` on listing cards |

**No changes to:** `BlogPost.tsx`, any API routes, analytics, MDX content files, CSS variables, or any other component.

---

## Non-goals (out of scope for this phase)

- Dynamic SEO meta tags / OG images per post (Phase 2)
- Categories, tags, or search (Phase B in the roadmap)
- Comments or community features
- CMS or headless content management
- Syntax highlighting for code blocks
- Newsletter CTA inline in posts (already covered by EbookCTA)

---

## Success criteria

1. Every blog post shows `"X min de lectura"` in the header
2. Every blog listing card shows reading time
3. A 2px progress bar fills from left to right as the user scrolls through a post
4. On desktop (≥1024px), a sticky sidebar shows the post's `##`/`###` headings
5. The currently-visible heading is highlighted in the sidebar
6. Clicking a sidebar item scrolls smoothly to that section
7. On mobile, the sidebar is not rendered — only the progress bar
8. Posts with fewer than 2 headings do not show a sidebar
9. No new npm dependencies introduced
10. Build passes with zero TypeScript errors
