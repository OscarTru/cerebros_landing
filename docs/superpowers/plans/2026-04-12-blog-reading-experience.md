# Blog Reading Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add reading time estimates, a scroll progress bar, and a sticky desktop table of contents to all blog posts.

**Architecture:** A pure-frontend addition across 6 files. `src/lib/readingTime.ts` provides three utilities (`slugify`, `calcReadingTime`, `extractHeadings`) used at build time in `blogMeta.ts`. Two new components (`ReadingProgressBar`, `TableOfContents`) are mounted inside `BlogLayout`. No new dependencies, no API changes.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Vite raw imports (`?raw`), native `IntersectionObserver`, `requestAnimationFrame`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/lib/readingTime.ts` | Create | `slugify`, `calcReadingTime`, `extractHeadings`, `Heading` type |
| `src/components/ReadingProgressBar.tsx` | Create | Fixed 2px scroll-progress bar |
| `src/components/TableOfContents.tsx` | Create | Sticky sidebar, IntersectionObserver active-heading highlight |
| `src/content/blogMeta.ts` | Modify | Add `readingTime: number` + `headings: Heading[]` to `PostMeta`; compute via `?raw` imports |
| `src/layouts/BlogLayout.tsx` | Modify | Mount `ReadingProgressBar`; 2-col grid on lg+; inject heading IDs via MDX components; show reading time |
| `src/pages/Blog.tsx` | Modify | Display `readingTime` on featured card and grid cards |

---

## Task 1: Create `src/lib/readingTime.ts`

**Files:**
- Create: `src/lib/readingTime.ts`

- [ ] **Step 1: Create the file with all three exports**

```typescript
// src/lib/readingTime.ts

export interface Heading {
  id: string
  text: string
  level: 2 | 3
}

/**
 * Converts a heading string into a URL-safe anchor ID.
 * Keeps accented characters (they work fine as HTML IDs).
 * Lowercases, replaces spaces with hyphens, strips punctuation.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u00C0-\u024F-]/g, "")
}

/**
 * Strips MDX/Markdown syntax and frontmatter, then estimates
 * reading time at 200 words per minute (Spanish average).
 * Returns at least 1 minute.
 */
export function calcReadingTime(raw: string): number {
  // Remove frontmatter block (--- ... ---)
  const withoutFrontmatter = raw.replace(/^---[\s\S]*?---/, "")
  // Remove markdown/MDX syntax
  const plainText = withoutFrontmatter
    .replace(/```[\s\S]*?```/g, "")   // fenced code blocks
    .replace(/`[^`]*`/g, "")          // inline code
    .replace(/!\[.*?\]\(.*?\)/g, "")  // images
    .replace(/\[.*?\]\(.*?\)/g, "")   // links (keep text)
    .replace(/#{1,6}\s/g, "")         // headings
    .replace(/[*_~>]/g, "")           // emphasis, blockquote
    .replace(/<[^>]+>/g, "")          // HTML tags
  const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(wordCount / 200))
}

/**
 * Parses ## and ### headings from raw MDX content (after frontmatter).
 * Returns them in document order with slugified IDs.
 */
export function extractHeadings(raw: string): Heading[] {
  const withoutFrontmatter = raw.replace(/^---[\s\S]*?---/, "")
  const lines = withoutFrontmatter.split("\n")
  const headings: Heading[] = []
  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)$/)
    const h3 = line.match(/^###\s+(.+)$/)
    if (h3) {
      headings.push({ id: slugify(h3[1]), text: h3[1].trim(), level: 3 })
    } else if (h2) {
      headings.push({ id: slugify(h2[1]), text: h2[1].trim(), level: 2 })
    }
  }
  return headings
}
```

- [ ] **Step 2: Verify the build still passes**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Landing" && npm run build 2>&1 | tail -5
```
Expected: `✓ built in` with no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Landing"
git add src/lib/readingTime.ts
git commit -m "feat: add readingTime utilities (slugify, calcReadingTime, extractHeadings)"
```

---

## Task 2: Extend `PostMeta` and populate in `blogMeta.ts`

**Files:**
- Modify: `src/content/blogMeta.ts`

- [ ] **Step 1: Replace the full file content**

```typescript
// src/content/blogMeta.ts
// Shared blog post metadata — imported eagerly once, used by Blog listing and BlogPost navigation.
// Separating this from the MDX content glob avoids Vite warning about dual static+dynamic imports.

import { calcReadingTime, extractHeadings, type Heading } from "@/lib/readingTime"

export interface PostMeta {
  slug: string
  title: string
  date: string
  description: string
  author: string
  image?: string
  readingTime: number
  headings: Heading[]
}

// Vite eager glob for frontmatter (typed objects)
const metaModules = import.meta.glob<{ frontmatter: Omit<PostMeta, "readingTime" | "headings"> }>(
  "./blog/*.mdx",
  { eager: true }
)

// Vite raw glob for full source text (to compute readingTime + headings)
const rawModules = import.meta.glob<string>("./blog/*.mdx", { eager: true, query: "?raw", import: "default" })

export const ALL_POSTS: PostMeta[] = Object.entries(metaModules)
  .map(([path, m]) => {
    const frontmatter = m.frontmatter
    if (!frontmatter?.slug) return null
    const raw: string = rawModules[path] ?? ""
    return {
      ...frontmatter,
      readingTime: calcReadingTime(raw),
      headings: extractHeadings(raw),
    } satisfies PostMeta
  })
  .filter((f): f is PostMeta => f !== null)
  .sort((a, b) => (a.date < b.date ? 1 : -1))

export const ALL_SLUGS: string[] = ALL_POSTS.map((p) => p.slug)

export function getAdjacentPosts(slug: string): {
  prevPost?: { slug: string; title: string }
  nextPost?: { slug: string; title: string }
} {
  const idx = ALL_SLUGS.indexOf(slug)
  return {
    prevPost: idx > 0 ? { slug: ALL_SLUGS[idx - 1], title: ALL_POSTS[idx - 1].title } : undefined,
    nextPost:
      idx >= 0 && idx < ALL_SLUGS.length - 1
        ? { slug: ALL_SLUGS[idx + 1], title: ALL_POSTS[idx + 1].title }
        : undefined,
  }
}
```

- [ ] **Step 2: Verify the build passes**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Landing" && npm run build 2>&1 | tail -8
```
Expected: `✓ built in` with no TypeScript errors. If you see a Vite warning about the `?raw` query format, the correct Vite v5+ syntax is `{ query: "?raw", import: "default" }` — already used above.

- [ ] **Step 3: Commit**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Landing"
git add src/content/blogMeta.ts
git commit -m "feat: add readingTime and headings to PostMeta, compute from raw MDX at build time"
```

---

## Task 3: Create `ReadingProgressBar` component

**Files:**
- Create: `src/components/ReadingProgressBar.tsx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/ReadingProgressBar.tsx
import { useState, useEffect } from "react"

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let rafId: number

    function update() {
      const scrollY = window.scrollY
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight
      const pct = totalHeight > 0 ? (scrollY / totalHeight) * 100 : 0
      setProgress(Math.min(100, Math.max(0, pct)))
    }

    function onScroll() {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(update)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    update() // set initial value

    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 z-50 h-[2px] w-full"
      style={{ backgroundColor: "transparent" }}
    >
      <div
        className="h-full transition-none"
        style={{
          width: `${progress}%`,
          backgroundColor: "var(--c-invert)",
        }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify the build passes**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Landing" && npm run build 2>&1 | tail -5
```
Expected: `✓ built in` with no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Landing"
git add src/components/ReadingProgressBar.tsx
git commit -m "feat: add ReadingProgressBar component"
```

---

## Task 4: Create `TableOfContents` component

**Files:**
- Create: `src/components/TableOfContents.tsx`

- [ ] **Step 1: Create the component**

```typescript
// src/components/TableOfContents.tsx
import { useState, useEffect, useRef } from "react"
import type { Heading } from "@/lib/readingTime"

interface TableOfContentsProps {
  headings: Heading[]
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("")
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (headings.length < 2) return

    const elements = headings
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Pick the topmost intersecting heading
        const intersecting = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (intersecting.length > 0) {
          setActiveId(intersecting[0].target.id)
        }
      },
      {
        rootMargin: "-20% 0px -70% 0px",
      }
    )

    elements.forEach((el) => observerRef.current!.observe(el))

    return () => {
      observerRef.current?.disconnect()
    }
  }, [headings])

  if (headings.length < 2) return null

  return (
    <nav aria-label="Tabla de contenidos">
      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--c-text-subtle)] mb-4">
        En este artículo
      </p>
      <ul className="flex flex-col gap-2">
        {headings.map((h) => {
          const isActive = activeId === h.id
          return (
            <li key={h.id} className={h.level === 3 ? "pl-3" : ""}>
              <a
                href={`#${h.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" })
                  setActiveId(h.id)
                }}
                className={[
                  "block text-xs leading-snug transition-colors py-0.5",
                  isActive
                    ? "text-[var(--c-text)] border-l-2 border-[var(--c-invert)] pl-2"
                    : "text-[var(--c-text-faint)] hover:text-[var(--c-text-muted)]",
                ].join(" ")}
              >
                {h.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
```

- [ ] **Step 2: Verify the build passes**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Landing" && npm run build 2>&1 | tail -5
```
Expected: `✓ built in` with no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Landing"
git add src/components/TableOfContents.tsx
git commit -m "feat: add TableOfContents component with IntersectionObserver active heading"
```

---

## Task 5: Update `BlogLayout` — progress bar, reading time, 2-col grid, heading IDs

**Files:**
- Modify: `src/layouts/BlogLayout.tsx`

This is the largest change. The full file is provided to avoid partial edits.

- [ ] **Step 1: Replace the full `BlogLayout.tsx`**

```typescript
import { LazyMotion, domAnimation } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowLeft, ArrowRight, Clock, Link2 } from "lucide-react"
import { useState, type ReactNode } from "react"
import { NoiseOverlay } from "@/components/NoiseOverlay"
import { Footer } from "@/sections/Footer"
import { FadeIn } from "@/components/FadeIn"
import { ThemeToggle } from "@/components/ThemeToggle"
import { LikeButton } from "@/components/LikeButton"
import { ReadingProgressBar } from "@/components/ReadingProgressBar"
import { TableOfContents } from "@/components/TableOfContents"
import { isCloudinaryId, cloudinaryUrl, cloudinarySrcSet } from "@/lib/cloudinary"
import { slugify, type Heading } from "@/lib/readingTime"

interface PostNav {
  slug: string
  title: string
}

interface BlogLayoutProps {
  title: string
  date: string
  author: string
  description: string
  slug: string
  image?: string
  readingTime?: number
  headings?: Heading[]
  prevPost?: PostNav
  nextPost?: PostNav
  children: ReactNode
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

const iconClass =
  "h-9 w-9 flex items-center justify-center rounded-full border border-[var(--c-border)] text-[var(--c-text-muted)] hover:border-[var(--c-border-strong)] hover:text-[var(--c-text)] hover:scale-110 active:scale-95 transition-all duration-150 cursor-pointer"

function ShareBar({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== "undefined" ? window.location.href : ""
  const text = `"${title}" — vía @cerebros.esponjosos`

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`
  const threadsUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(`${text}\n${url}`)}`
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {/* WhatsApp */}
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Compartir por WhatsApp" className={iconClass}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
        {/* Threads */}
        <a href={threadsUrl} target="_blank" rel="noopener noreferrer" aria-label="Compartir en Threads" className={iconClass}>
          <svg width="16" height="16" viewBox="0 0 192 192" fill="currentColor" aria-hidden="true">
            <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.861 14.05-7.327-1.244-15.224-1.626-23.68-1.141-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 9.998 15.83 12.787 26.117l16.231-4.333c-3.413-12.567-8.878-23.459-16.337-32.542C147.144 9.672 125.27.195 97.07 0h-.113C68.882.195 47.292 9.715 32.788 28.283 19.882 44.768 13.224 67.162 13.001 95.983v.034c.223 28.822 6.88 51.216 19.787 67.7C47.292 182.286 68.882 191.806 96.957 192h.113c24.96-.173 42.554-6.708 57.048-21.189 18.963-18.945 18.392-42.692 12.142-57.27-4.484-10.454-13.033-18.945-24.723-24.553Z"/>
          </svg>
        </a>
        {/* Facebook */}
        <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Compartir en Facebook" className={iconClass}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>
        {/* Copy link */}
        <div className="relative">
          <button onClick={copyLink} aria-label={copied ? "Enlace copiado" : "Copiar enlace"} className={iconClass}>
            <Link2 className="h-4 w-4" aria-hidden="true" />
          </button>
          {copied && (
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-mono tracking-wide text-[var(--c-text)] bg-[var(--c-surface-2)] border border-[var(--c-border)] px-2 py-0.5 rounded-full whitespace-nowrap pointer-events-none">
              copiado
            </span>
          )}
        </div>
      </div>
      <LikeButton slug={slug} />
    </div>
  )
}

// MDX heading components that inject slugified IDs for TOC anchor links
function makeHeadingComponents() {
  const H2 = ({ children }: { children?: ReactNode }) => {
    const text = typeof children === "string" ? children : ""
    return <h2 id={slugify(text)}>{children}</h2>
  }
  const H3 = ({ children }: { children?: ReactNode }) => {
    const text = typeof children === "string" ? children : ""
    return <h3 id={slugify(text)}>{children}</h3>
  }
  return { h2: H2, h3: H3 }
}

const headingComponents = makeHeadingComponents()

export function BlogLayout({
  title,
  date,
  author,
  description,
  slug,
  image,
  readingTime,
  headings = [],
  prevPost,
  nextPost,
  children,
}: BlogLayoutProps) {
  const showTOC = headings.length >= 2

  return (
    <LazyMotion features={domAnimation}>
      <div className="relative min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] overflow-x-hidden font-sans">
        <ReadingProgressBar />
        <NoiseOverlay />

        <nav className="relative z-20 px-6 py-6 border-b border-[var(--c-border)]">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link
              to="/blog"
              className="flex items-center gap-2 text-sm text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="font-serif text-base text-[var(--c-text)]">Blog</span>
            </Link>
            <ThemeToggle />
          </div>
        </nav>

        <main className="relative z-10 px-6 pt-20 pb-32">
          {/* Outer container: wider to accommodate sidebar */}
          <div className="max-w-5xl mx-auto">
            <div className={showTOC ? "lg:grid lg:grid-cols-[1fr_220px] lg:gap-16 lg:items-start" : ""}>
              {/* ── Main prose column ── */}
              <article className="min-w-0">
                <FadeIn>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-text-subtle)] mb-4">
                    Blog · {formatDate(date)}
                  </p>
                </FadeIn>
                <FadeIn delay={0.05}>
                  <h1
                    className="font-serif text-[var(--c-text)] leading-[1.05] tracking-[-0.02em] mb-6"
                    style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}
                  >
                    {title}
                  </h1>
                </FadeIn>
                <FadeIn delay={0.08}>
                  <p className="text-base text-[var(--c-text-muted)] leading-relaxed mb-3 max-w-2xl">
                    {description}
                  </p>
                  <div className="flex items-center gap-3 mb-16 text-xs text-[var(--c-text-faint)]">
                    <span>Por {author}</span>
                    {readingTime && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          {readingTime} min de lectura
                        </span>
                      </>
                    )}
                  </div>
                </FadeIn>
                {image && (
                  <FadeIn delay={0.09}>
                    <div className="mb-12 rounded-xl overflow-hidden">
                      {isCloudinaryId(image) ? (
                        <img
                          src={cloudinaryUrl(image, 800)}
                          srcSet={cloudinarySrcSet(image)}
                          sizes="(max-width: 640px) 100vw, 800px"
                          alt={title}
                          className="w-full max-h-[480px] object-cover"
                          loading="eager"
                          decoding="sync"
                        />
                      ) : (
                        <img
                          src={image}
                          alt={title}
                          className="w-full max-h-[480px] object-cover"
                          loading="eager"
                          decoding="sync"
                        />
                      )}
                    </div>
                  </FadeIn>
                )}

                <FadeIn delay={0.1}>
                  <div className="prose-blog">
                    {children}
                  </div>
                </FadeIn>

                {/* Share + Like bar */}
                <FadeIn delay={0.1}>
                  <div className="mt-16 pt-6 border-t border-[var(--c-border)]">
                    <ShareBar title={title} slug={slug} />
                  </div>
                </FadeIn>

                {/* Blog navigation */}
                <FadeIn delay={0.12}>
                  <div className="mt-10 flex flex-col gap-6">
                    <Link
                      to="/blog"
                      className="inline-flex items-center gap-2 text-sm text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                      Todos los artículos
                    </Link>

                    {(prevPost || nextPost) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[var(--c-border)]">
                        {prevPost ? (
                          <Link
                            to={`/blog/${prevPost.slug}`}
                            className="group flex flex-col gap-1 p-4 rounded-xl border border-[var(--c-border)] hover:border-[var(--c-border-strong)] transition-colors"
                          >
                            <span className="flex items-center gap-1 text-xs text-[var(--c-text-subtle)] uppercase tracking-[0.15em]">
                              <ArrowLeft className="h-3 w-3" aria-hidden="true" />
                              Anterior
                            </span>
                            <span className="font-serif text-sm text-[var(--c-text)] leading-snug group-hover:text-[var(--c-text)] line-clamp-2">
                              {prevPost.title}
                            </span>
                          </Link>
                        ) : (
                          <div />
                        )}
                        {nextPost ? (
                          <Link
                            to={`/blog/${nextPost.slug}`}
                            className="group flex flex-col gap-1 p-4 rounded-xl border border-[var(--c-border)] hover:border-[var(--c-border-strong)] transition-colors sm:items-end sm:text-right"
                          >
                            <span className="flex items-center gap-1 text-xs text-[var(--c-text-subtle)] uppercase tracking-[0.15em]">
                              Siguiente
                              <ArrowRight className="h-3 w-3" aria-hidden="true" />
                            </span>
                            <span className="font-serif text-sm text-[var(--c-text)] leading-snug group-hover:text-[var(--c-text)] line-clamp-2">
                              {nextPost.title}
                            </span>
                          </Link>
                        ) : (
                          <div />
                        )}
                      </div>
                    )}
                  </div>
                </FadeIn>
              </article>

              {/* ── Sidebar (desktop only) ── */}
              {showTOC && (
                <aside className="hidden lg:block">
                  <div className="sticky top-24">
                    <TableOfContents headings={headings} />
                  </div>
                </aside>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </LazyMotion>
  )
}

// Re-export heading components so BlogPost can pass them to MDX Article
export { headingComponents }
```

- [ ] **Step 2: Verify the build passes**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Landing" && npm run build 2>&1 | tail -8
```
Expected: `✓ built in` with no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Landing"
git add src/layouts/BlogLayout.tsx
git commit -m "feat: add progress bar, reading time, and TOC sidebar to BlogLayout"
```

---

## Task 6: Update `BlogPost.tsx` to pass `readingTime`, `headings`, and heading components

**Files:**
- Modify: `src/pages/BlogPost.tsx`

- [ ] **Step 1: Replace the full `BlogPost.tsx`**

```typescript
import { Suspense, lazy, useState, useEffect, useMemo } from "react"
import { useParams, Navigate } from "react-router-dom"
import { BlogLayout, headingComponents } from "@/layouts/BlogLayout"
import { EbookCTA } from "@/components/EbookCTA"
import { getAdjacentPosts, type PostMeta } from "@/content/blogMeta"
import { analytics } from "@/lib/analytics"

type MDXComponents = Record<string, React.ComponentType>

type MDXModule = {
  default: React.ComponentType<{ components?: MDXComponents }>
  frontmatter: PostMeta
}

const modules = import.meta.glob<MDXModule>("../content/blog/*.mdx")

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [frontmatter, setFrontmatter] = useState<PostMeta | null>(null)
  const [notFound, setNotFound] = useState(false)

  const path = slug ? `../content/blog/${slug}.mdx` : null
  const loader = path ? modules[path] : undefined

  useEffect(() => {
    if (!loader) {
      setNotFound(true)
      return
    }
    loader().then((mod) => {
      setFrontmatter(mod.frontmatter)
      analytics.blogPostView(mod.frontmatter.slug)
    })
  }, [loader])

  const Article = useMemo(
    () => (loader ? lazy(loader) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [path]
  )

  const { prevPost, nextPost } = slug ? getAdjacentPosts(slug) : {}

  if (notFound) return <Navigate to="/" replace />
  if (!frontmatter || !Article) return <div className="min-h-screen bg-[var(--c-bg)]" />

  return (
    <BlogLayout
      title={frontmatter.title}
      date={frontmatter.date}
      author={frontmatter.author}
      description={frontmatter.description}
      slug={frontmatter.slug}
      image={frontmatter.image}
      readingTime={frontmatter.readingTime}
      headings={frontmatter.headings}
      prevPost={prevPost}
      nextPost={nextPost}
    >
      <Suspense fallback={<div className="min-h-[40vh]" />}>
        <Article
          components={{
            ...headingComponents,
            EbookCTA: (props: Record<string, unknown>) => (
              <EbookCTA slug={slug ?? "unknown"} {...props} />
            ),
          }}
        />
      </Suspense>
    </BlogLayout>
  )
}
```

- [ ] **Step 2: Verify the build passes**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Landing" && npm run build 2>&1 | tail -8
```
Expected: `✓ built in` with no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Landing"
git add src/pages/BlogPost.tsx
git commit -m "feat: pass readingTime, headings, and heading components to BlogLayout"
```

---

## Task 7: Update `Blog.tsx` listing to show reading time on cards

**Files:**
- Modify: `src/pages/Blog.tsx`

- [ ] **Step 1: Add Clock import and reading time display**

In the imports section, add `Clock` from lucide-react:

```typescript
import { Link } from "react-router-dom"
import { ArrowRight, Clock } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { isCloudinaryId, cloudinaryUrl, cloudinarySrcSet } from "@/lib/cloudinary"
import { ALL_POSTS } from "@/content/blogMeta"
```

- [ ] **Step 2: Update the featured post meta row**

Find this block in the featured post section (around line 146–153):
```typescript
            <div className="flex items-center gap-2 text-xs text-[var(--c-text-subtle)]">
              <span>por {featured.author}</span>
              <span>·</span>
              <span className="flex items-center gap-1 group-hover:text-[var(--c-text)] transition-colors">
                Leer artículo
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
```

Replace with:
```typescript
            <div className="flex items-center gap-2 text-xs text-[var(--c-text-subtle)]">
              <span>por {featured.author}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {featured.readingTime} min
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 group-hover:text-[var(--c-text)] transition-colors">
                Leer artículo
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
```

- [ ] **Step 3: Update the grid card author line**

Find this line in the grid card section (around line 182):
```typescript
                  <span className="text-xs text-[var(--c-text-subtle)]">por {post.author}</span>
```

Replace with:
```typescript
                  <div className="flex items-center gap-2 text-xs text-[var(--c-text-subtle)]">
                    <span>por {post.author}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {post.readingTime} min
                    </span>
                  </div>
```

- [ ] **Step 4: Verify the build passes**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Landing" && npm run build 2>&1 | tail -8
```
Expected: `✓ built in` with no TypeScript errors.

- [ ] **Step 5: Commit and push**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Landing"
git add src/pages/Blog.tsx
git commit -m "feat: show reading time on blog listing cards"
git fetch origin dev && git checkout --theirs public/data/content.json && git add public/data/content.json && git rebase origin/dev && git push origin dev
```
If rebase has no conflict on `content.json`, skip the `--theirs` step and just `git rebase origin/dev`.

---

## Self-Review

**Spec coverage check:**
- ✅ Tiempo de lectura in post header → Task 5 (`readingTime` in BlogLayout header)
- ✅ Tiempo de lectura on listing cards → Task 7
- ✅ Reading time calculation utility → Task 1 (`calcReadingTime`)
- ✅ Barra de progreso 2px fixed top → Task 3 (`ReadingProgressBar`)
- ✅ Heading extraction utility → Task 1 (`extractHeadings`)
- ✅ Heading IDs injected via MDX components → Task 5 (`headingComponents`, `makeHeadingComponents`)
- ✅ TOC with IntersectionObserver → Task 4 (`TableOfContents`)
- ✅ `PostMeta` extended with `readingTime` + `headings` → Task 2
- ✅ `?raw` imports for build-time computation → Task 2
- ✅ 2-col grid layout lg+ → Task 5
- ✅ Sidebar hidden on mobile → Task 5 (`hidden lg:block`)
- ✅ TOC only when headings ≥ 2 → Tasks 4 & 5
- ✅ `readingTime` + `headings` passed to BlogLayout → Task 6
- ✅ No new npm dependencies → all tasks use native APIs

**Placeholder scan:** No TBDs or incomplete steps found.

**Type consistency:**
- `Heading` type defined in Task 1, imported in Tasks 2, 4, 5 — consistent.
- `headingComponents` exported from `BlogLayout` in Task 5, imported in Task 6 — consistent.
- `PostMeta.readingTime: number` and `PostMeta.headings: Heading[]` added in Task 2, consumed in Tasks 5 & 6 — consistent.
- `BlogLayoutProps.readingTime?: number` and `BlogLayoutProps.headings?: Heading[]` — optional so existing callers (if any) don't break.
