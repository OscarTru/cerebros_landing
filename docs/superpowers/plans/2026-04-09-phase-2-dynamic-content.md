# Phase 2 — Dynamic Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar placeholders del Bento con datos reales de YouTube (RSS) + Instagram (Graph API), fetched en build-time, con refresh automático vía GitHub Actions cada 6h. Eliminar la card de Podcast.

**Architecture:** Script Node `scripts/fetch-content.ts` corre en `prebuild`, lee fallback cache desde `public/data/content.json`, fetch-ea cada fuente en try/catch independiente, escribe JSON tipado. `src/content/dynamic.ts` importa el JSON. `src/sections/Content.tsx` renderiza layout A usando esos datos con fallbacks visuales si vienen vacíos. GitHub Actions cron refresca el JSON y commitea.

**Tech Stack:** Node 20 + tsx + fast-xml-parser + Instagram Graph API v19.0 + GitHub Actions.

**Context:**
- Phase 1 already implemented. `src/sections/Content.tsx` exists and currently uses static `contentLinks` from `src/content/site.ts` with hardcoded Tv/Mic/Camera/BookOpen icons and placeholder gradient thumbnails.
- **YouTube Channel ID:** `UC_0iMtxeDkSRB3KjVKsonUA`
- **Instagram:** Graph API v19.0, Long-Lived Token. Secrets live in GitHub Actions as `IG_ACCESS_TOKEN` and `IG_BUSINESS_ACCOUNT_ID`.
- Repo is **not** a git repo locally. The plan creates a GitHub Actions workflow file but does not assume this directory is initialized as git yet — the workflow will activate once the user pushes to GitHub.
- Spec: `docs/superpowers/specs/2026-04-09-phase-2-dynamic-content-design.md`.

---

## File Structure

**Create:**
- `scripts/fetch-content.ts`
- `public/data/content.json` (initial empty cache)
- `src/content/dynamic.ts`
- `.github/workflows/refresh-content.yml`

**Modify:**
- `package.json` (add `fast-xml-parser`, `tsx` dev, scripts `fetch:content` + `prebuild`)
- `src/sections/Content.tsx` (new layout A, dynamic data)
- `src/content/site.ts` (remove podcast entry from `contentLinks`, or leave Blog-only; document intent)
- `tsconfig.json` / `tsconfig.app.json` (ensure `resolveJsonModule: true` if not already)

---

## Task 1: Add dependencies + scripts

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install**

Run:
```bash
npm install fast-xml-parser
npm install -D tsx
```

- [ ] **Step 2: Add scripts to `package.json`**

Read current `package.json`. In the `"scripts"` object, add:

```json
"fetch:content": "tsx scripts/fetch-content.ts",
"prebuild": "tsx scripts/fetch-content.ts || echo 'fetch failed, using cached content'"
```

Preserve existing scripts (`dev`, `build`, `lint`, `preview`).

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: build still passes. `prebuild` will run the fetch script; since secrets are not present locally, it will fail gracefully and the `|| echo` will continue. Build completes successfully using whatever cache exists (or empty JSON once Task 3 creates it).

Note: At this point, `scripts/fetch-content.ts` does not exist yet, so prebuild will fail with "file not found" — that is tolerated by the `||`, and the build itself should still succeed since Phase 1 Content.tsx does not depend on the JSON yet.

---

## Task 2: Enable `resolveJsonModule` in tsconfig

**Files:**
- Modify: `tsconfig.app.json` (or whichever file has `compilerOptions` for src)

- [ ] **Step 1: Read `tsconfig.app.json`**

Run: Read `tsconfig.app.json`.

- [ ] **Step 2: Ensure `"resolveJsonModule": true` and `"esModuleInterop": true` are present**

In `compilerOptions`, add `"resolveJsonModule": true` if missing. Leave everything else as-is.

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: passes (same as before).

---

## Task 3: Create initial `public/data/content.json` cache

**Files:**
- Create: `public/data/content.json`

- [ ] **Step 1: Create directory and file**

Content:

```json
{
  "latestVideo": null,
  "instagramPosts": [],
  "fetchedAt": null
}
```

- [ ] **Step 2: Verify**

File exists and is valid JSON.

---

## Task 4: Create `src/content/dynamic.ts`

**Files:**
- Create: `src/content/dynamic.ts`

- [ ] **Step 1: Create file**

```ts
import contentData from "../../public/data/content.json"

export interface LatestVideo {
  id: string
  title: string
  thumbnail: string
  url: string
  publishedAt: string
}

export type IgMediaType = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM"

export interface IgPost {
  id: string
  caption: string
  mediaUrl: string
  thumbnailUrl: string | null
  permalink: string
  mediaType: IgMediaType
  timestamp: string
}

export interface DynamicContent {
  latestVideo: LatestVideo | null
  instagramPosts: IgPost[]
  fetchedAt: string | null
}

export const dynamicContent = contentData as DynamicContent
```

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: passes.

---

## Task 5: Write `scripts/fetch-content.ts`

**Files:**
- Create: `scripts/fetch-content.ts`

- [ ] **Step 1: Create file**

```ts
/* eslint-disable no-console */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { XMLParser } from "fast-xml-parser"

const OUTPUT = resolve(process.cwd(), "public/data/content.json")
const YT_CHANNEL_ID = "UC_0iMtxeDkSRB3KjVKsonUA"
const YT_RSS = `https://www.youtube.com/feeds/videos.xml?channel_id=${YT_CHANNEL_ID}`

const IG_TOKEN = process.env.IG_ACCESS_TOKEN
const IG_BUSINESS_ID = process.env.IG_BUSINESS_ACCOUNT_ID

interface LatestVideo {
  id: string
  title: string
  thumbnail: string
  url: string
  publishedAt: string
}

interface IgPost {
  id: string
  caption: string
  mediaUrl: string
  thumbnailUrl: string | null
  permalink: string
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM"
  timestamp: string
}

interface ContentCache {
  latestVideo: LatestVideo | null
  instagramPosts: IgPost[]
  fetchedAt: string | null
}

function readCache(): ContentCache {
  if (!existsSync(OUTPUT)) {
    return { latestVideo: null, instagramPosts: [], fetchedAt: null }
  }
  try {
    return JSON.parse(readFileSync(OUTPUT, "utf8")) as ContentCache
  } catch {
    return { latestVideo: null, instagramPosts: [], fetchedAt: null }
  }
}

async function fetchYouTube(): Promise<LatestVideo | null> {
  console.log("→ Fetching YouTube RSS…")
  const res = await fetch(YT_RSS)
  if (!res.ok) throw new Error(`YouTube RSS ${res.status}`)
  const xml = await res.text()
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  })
  const parsed = parser.parse(xml)
  const entries = parsed?.feed?.entry
  const first = Array.isArray(entries) ? entries[0] : entries
  if (!first) throw new Error("YouTube RSS: no entries")
  const id = String(first["yt:videoId"])
  const title = String(first.title)
  const published = String(first.published)
  const thumbHigh = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`
  // maxresdefault may 404 for some videos — fall back to hqdefault at render time via onError
  return {
    id,
    title,
    thumbnail: thumbHigh,
    url: `https://www.youtube.com/watch?v=${id}`,
    publishedAt: published,
  }
}

async function fetchInstagram(): Promise<IgPost[]> {
  console.log("→ Fetching Instagram Graph API…")
  if (!IG_TOKEN || !IG_BUSINESS_ID) {
    throw new Error("Missing IG_ACCESS_TOKEN or IG_BUSINESS_ACCOUNT_ID env vars")
  }
  const fields =
    "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp"
  const url = `https://graph.facebook.com/v19.0/${IG_BUSINESS_ID}/media?fields=${fields}&limit=3&access_token=${IG_TOKEN}`
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`IG Graph API ${res.status}: ${body.slice(0, 200)}`)
  }
  const json = (await res.json()) as {
    data?: Array<{
      id: string
      caption?: string
      media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM"
      media_url: string
      permalink: string
      thumbnail_url?: string
      timestamp: string
    }>
  }
  const data = json.data ?? []
  return data.slice(0, 3).map((p) => ({
    id: p.id,
    caption: p.caption ?? "",
    mediaUrl: p.media_url,
    thumbnailUrl: p.thumbnail_url ?? null,
    permalink: p.permalink,
    mediaType: p.media_type,
    timestamp: p.timestamp,
  }))
}

async function main() {
  const cache = readCache()
  const next: ContentCache = { ...cache, fetchedAt: new Date().toISOString() }

  try {
    next.latestVideo = await fetchYouTube()
    console.log(`  ✓ YouTube: ${next.latestVideo?.title}`)
  } catch (err) {
    console.warn(`  ⚠ YouTube failed, keeping cache: ${(err as Error).message}`)
    next.latestVideo = cache.latestVideo
  }

  try {
    next.instagramPosts = await fetchInstagram()
    console.log(`  ✓ Instagram: ${next.instagramPosts.length} posts`)
  } catch (err) {
    console.warn(`  ⚠ Instagram failed, keeping cache: ${(err as Error).message}`)
    next.instagramPosts = cache.instagramPosts
  }

  mkdirSync(dirname(OUTPUT), { recursive: true })
  writeFileSync(OUTPUT, JSON.stringify(next, null, 2) + "\n", "utf8")
  console.log(`✓ Wrote ${OUTPUT}`)
}

main().catch((err) => {
  console.error("fetch-content failed:", err)
  process.exit(1)
})
```

- [ ] **Step 2: Verify script runs locally (without secrets)**

Run: `npm run fetch:content`
Expected: YouTube succeeds (`✓ YouTube: …`), Instagram warns about missing env vars (`⚠ Instagram failed, keeping cache: Missing IG_ACCESS_TOKEN…`), script exits 0, `public/data/content.json` now has a real `latestVideo` object and `instagramPosts: []`.

- [ ] **Step 3: Verify build still works**

Run: `npm run build`
Expected: passes.

---

## Task 6: Rewrite `src/sections/Content.tsx` for Layout A with dynamic data

**Files:**
- Modify: `src/sections/Content.tsx`

- [ ] **Step 1: Replace entire file**

```tsx
import { ArrowUpRight, Play, Camera, BookOpen, Instagram } from "lucide-react"
import { FadeIn } from "@/components/FadeIn"
import { dynamicContent, type IgPost } from "@/content/dynamic"

const INSTAGRAM_PROFILE = "https://instagram.com/cerebrosesponjosos"

export function Content() {
  const { latestVideo, instagramPosts } = dynamicContent

  return (
    <section
      id="contenido"
      className="relative py-32 px-6 border-t border-white/[0.06] z-10"
    >
      <div className="max-w-6xl mx-auto">
        <FadeIn className="mb-16 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-4">
            Contenido
          </p>
          <h2
            className="font-serif text-white leading-[1.05] tracking-[-0.02em]"
            style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}
          >
            El universo <span className="italic text-zinc-400">Cerebros Esponjosos.</span>
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* YouTube — 8 cols, row-span-2 */}
          <FadeIn className="md:col-span-8 md:row-span-2">
            <YouTubeCard video={latestVideo} />
          </FadeIn>

          {/* Instagram — 4 cols, row-span-2 */}
          <FadeIn delay={0.1} className="md:col-span-4 md:row-span-2">
            <InstagramCard posts={instagramPosts} />
          </FadeIn>

          {/* Blog — full width */}
          <FadeIn delay={0.15} className="md:col-span-12">
            <BlogCard />
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

function YouTubeCard({ video }: { video: typeof dynamicContent.latestVideo }) {
  const href = video?.url ?? "#"
  const title = video?.title ?? "Próximamente"
  const thumb = video?.thumbnail

  return (
    <a
      href={href}
      target={video ? "_blank" : undefined}
      rel={video ? "noopener noreferrer" : undefined}
      className="group block h-full rounded-2xl border border-white/[0.08] bg-[#111113] overflow-hidden hover:border-white/[0.2] transition-all"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {thumb ? (
          <img
            src={thumb}
            alt={title}
            loading="eager"
            className="absolute inset-0 h-full w-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-[1.02] transition-all duration-700"
            onError={(e) => {
              const img = e.currentTarget
              if (video && img.src.includes("maxresdefault")) {
                img.src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`
              }
            }}
          />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black"
            aria-hidden="true"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="absolute top-6 right-6 w-14 h-14 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform">
          <Play className="h-5 w-5 fill-black" aria-hidden="true" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 mb-3">
            Último episodio
          </p>
          <h3
            className="font-serif text-white leading-tight"
            style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)" }}
          >
            {title}
          </h3>
        </div>
      </div>
    </a>
  )
}

function InstagramCard({ posts }: { posts: IgPost[] }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/[0.08] bg-[#111113] overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10">
            <Instagram className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-white leading-none">Instagram</p>
            <p className="text-xs text-zinc-500 mt-1">@cerebrosesponjosos</p>
          </div>
        </div>
      </div>

      {posts.length > 0 ? (
        <div className="flex-1 flex flex-col gap-1 px-1 pb-1">
          {posts.map((p) => (
            <a
              key={p.id}
              href={p.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block flex-1 overflow-hidden rounded-xl"
            >
              <img
                src={p.thumbnailUrl ?? p.mediaUrl}
                alt={p.caption ? p.caption.slice(0, 100) : "Instagram post"}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              {p.mediaType !== "IMAGE" && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-[10px] text-white uppercase tracking-wider">
                  {p.mediaType === "VIDEO" ? "Video" : "Carrusel"}
                </div>
              )}
            </a>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center px-6 pb-6">
          <div className="text-center">
            <Camera className="h-8 w-8 text-zinc-600 mx-auto mb-3" aria-hidden="true" />
            <p className="text-sm text-zinc-500">Próximamente</p>
          </div>
        </div>
      )}

      <a
        href={INSTAGRAM_PROFILE}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06] text-sm text-zinc-300 hover:text-white transition-colors"
      >
        <span>Ver comunidad</span>
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </a>
    </div>
  )
}

function BlogCard() {
  return (
    <a
      href="#"
      className="group flex items-center justify-between gap-6 rounded-2xl border border-white/[0.08] bg-[#111113] p-7 hover:border-white/[0.2] hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-center gap-6">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white group-hover:text-black transition-colors">
          <BookOpen className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-white mb-1">Artículos y Blog</h3>
          <p className="text-sm text-zinc-500">
            Literatura digerida para leer en 5 minutos.
          </p>
        </div>
      </div>
      <ArrowUpRight
        className="h-5 w-5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
        aria-hidden="true"
      />
    </a>
  )
}
```

- [ ] **Step 2: Verify build and lint**

Run: `npm run build && npm run lint`
Expected: both pass. Content.tsx now renders with the real YouTube thumbnail (from the run of Task 5) and Instagram fallback "Próximamente".

---

## Task 7: Clean `src/content/site.ts`

**Files:**
- Modify: `src/content/site.ts`

- [ ] **Step 1: Remove `contentLinks` export (now unused by Content.tsx)**

Read the file. Delete the `contentLinks` array and its `ContentLink` interface. Remove the `Tv`, `Mic`, `Camera`, `BookOpen` imports from lucide-react if they become unused (keep any still referenced elsewhere). Preserve everything else (`navLinks`, `hero`, `manifestoText`, `founders`, `newsletter`, `footer`).

- [ ] **Step 2: Verify**

Run: `npm run lint && npm run build`
Expected: both pass. No unused-import errors.

---

## Task 8: Create GitHub Actions workflow

**Files:**
- Create: `.github/workflows/refresh-content.yml`

- [ ] **Step 1: Create file**

```yaml
name: Refresh dynamic content

on:
  schedule:
    - cron: "0 */6 * * *"
  workflow_dispatch:

permissions:
  contents: write

jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Fetch content
        env:
          IG_ACCESS_TOKEN: ${{ secrets.IG_ACCESS_TOKEN }}
          IG_BUSINESS_ACCOUNT_ID: ${{ secrets.IG_BUSINESS_ACCOUNT_ID }}
        run: npm run fetch:content

      - name: Commit changes if any
        run: |
          if git diff --quiet public/data/content.json; then
            echo "No content changes."
            exit 0
          fi
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add public/data/content.json
          git commit -m "chore: refresh dynamic content"
          git push
```

- [ ] **Step 2: Verify file is valid YAML**

Inspect visually. No command to run — CI only activates when the repo is on GitHub.

---

## Task 9: Final verification

**Files:** none

- [ ] **Step 1: Run fetch once more**

Run: `npm run fetch:content`
Expected: YouTube succeeds with real title, Instagram logs a warning about missing env vars, file is written.

- [ ] **Step 2: Full build**

Run: `npm run build`
Expected: passes. Note the bundle size.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: passes.

- [ ] **Step 4: Manual visual check**

Run: `npm run dev`
Verify in browser:
- Content section: YouTube card shows real thumbnail + real episode title.
- Instagram card: shows "Próximamente" fallback (since no token locally).
- Blog card: renders below, full width.
- Layout A correct on desktop (12-col grid): YouTube 8 cols tall, Instagram 4 cols tall, Blog below full width.
- Mobile stack: YouTube → Instagram → Blog.
- Links: YouTube card opens `https://www.youtube.com/watch?v=...` in new tab.

- [ ] **Step 5: Report**

Summarize: bundle size, YouTube video picked up, any lint/build warnings, any TODO comments remaining.

---

## Self-review

- Spec coverage: YouTube RSS ✓(T5), IG Graph API ✓(T5), fallback B ✓(T5 try/catch), layout A ✓(T6), podcast removed ✓(T6+T7), GitHub Actions cron ✓(T8), dynamic.ts types ✓(T4), dep additions ✓(T1), resolveJsonModule ✓(T2), initial cache ✓(T3).
- Placeholder scan: no "TODO" / "TBD" in code. The script has a real maxres→hq fallback via onError.
- Type consistency: `LatestVideo`, `IgPost`, `ContentCache` interfaces match between `scripts/fetch-content.ts` and `src/content/dynamic.ts`.
