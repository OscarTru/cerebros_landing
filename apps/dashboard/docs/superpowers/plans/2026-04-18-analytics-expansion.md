# Analytics Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Analytics page into a rich 5-tab dashboard with real YouTube + Instagram integration, mock TikTok, real Blog data, period selector, and 11 chart components.

**Architecture:** Data-source agnostic adapter pattern (`lib/analytics/`) serves data to per-tab server components. Chart primitives in `components/ui/charts/` wrap Recharts. Global period selector drives URL search param. YouTube uses API Key only (no OAuth). Instagram uses Graph API user access token. TikTok is pure mock. Blog reads Supabase.

**Tech Stack:** Next.js 15 App Router · Recharts 2.13 · HeroUI · framer-motion · YouTube Data API v3 · Instagram Graph API v21.0 · Supabase

---

## Phases

- **Phase 1** — Analytics data layer: types, period helpers, adapter skeleton, YouTube client, Instagram client, TikTok mocks, Blog queries
- **Phase 2** — Chart primitives: 11 reusable components
- **Phase 3** — Panels: 5 panel components (Overview, IG, YT, TT, Blog) + header actions + tabs shell
- **Phase 4** — Page rewrite + sync API route + final verify

---

## File Map

### Phase 1: Data layer (new directory)
| File | Purpose |
|---|---|
| `apps/dashboard/lib/analytics/types.ts` | All TypeScript types |
| `apps/dashboard/lib/analytics/period.ts` | Period helpers (toDays, prevPeriod, formatDate) |
| `apps/dashboard/lib/analytics/mock/tiktok.ts` | TikTok mock generator |
| `apps/dashboard/lib/analytics/mock/instagram-extras.ts` | IG mock fallbacks (demographics, hours) |
| `apps/dashboard/lib/analytics/mock/youtube-extras.ts` | YT mock fallbacks (retention, sources) |
| `apps/dashboard/lib/analytics/youtube/client.ts` | Real YouTube Data API v3 calls |
| `apps/dashboard/lib/analytics/youtube/index.ts` | YT facade: combine real + mock |
| `apps/dashboard/lib/analytics/instagram/client.ts` | Real Instagram Graph API calls |
| `apps/dashboard/lib/analytics/instagram/index.ts` | IG facade: combine real + mock |
| `apps/dashboard/lib/analytics/blog/index.ts` | Blog queries to Supabase |
| `apps/dashboard/lib/analytics/adapter.ts` | Public API facade |

### Phase 2: Chart primitives
| File | Purpose |
|---|---|
| `apps/dashboard/components/ui/charts/PeriodSelector.tsx` | Dropdown 7d/30d/90d/all |
| `apps/dashboard/components/ui/charts/LineChartCard.tsx` | Line chart with gradient |
| `apps/dashboard/components/ui/charts/BarChartCard.tsx` | Vertical/horizontal bars |
| `apps/dashboard/components/ui/charts/DonutChartCard.tsx` | Pie with hole |
| `apps/dashboard/components/ui/charts/HeatmapCard.tsx` | 7×24 custom grid |
| `apps/dashboard/components/ui/charts/SparklineInline.tsx` | Mini chart 60×20 |
| `apps/dashboard/components/ui/charts/PostGridCard.tsx` | Thumbnails grid |
| `apps/dashboard/components/ui/charts/GeoBar.tsx` | Progress bars for countries/cities |
| `apps/dashboard/components/ui/charts/ComparisonTable.tsx` | Table with inline sparklines |
| `apps/dashboard/components/ui/charts/SyncStatusBadge.tsx` | Last sync chip + refresh button |
| `apps/dashboard/components/ui/charts/MockDataBadge.tsx` | Warning chip "Demo data" |

### Phase 3: Panels
| File | Purpose |
|---|---|
| `apps/dashboard/components/analytics/AnalyticsHeaderActions.tsx` | Header actions (sync + period) |
| `apps/dashboard/components/analytics/AnalyticsTabsClient.tsx` | HeroUI Tabs shell |
| `apps/dashboard/components/analytics/OverviewPanel.tsx` | Overview tab content |
| `apps/dashboard/components/analytics/InstagramPanel.tsx` | IG tab content |
| `apps/dashboard/components/analytics/YouTubePanel.tsx` | YT tab content |
| `apps/dashboard/components/analytics/TikTokPanel.tsx` | TikTok tab content |
| `apps/dashboard/components/analytics/BlogPanel.tsx` | Blog tab content |

### Phase 4: Routing
| File | Purpose |
|---|---|
| `apps/dashboard/app/(dashboard)/analytics/page.tsx` | Main page, rewrite |
| `apps/dashboard/app/api/analytics/sync/route.ts` | POST sync endpoint |

Files deleted at end: `apps/dashboard/app/(dashboard)/analytics/AnalyticsTabsClient.tsx` (old one) — replaced by new path.

---

## PHASE 1 — Data layer

### Task 1: Analytics types

**Files:**
- Create: `apps/dashboard/lib/analytics/types.ts`

- [ ] **Step 1: Write file**

```ts
// apps/dashboard/lib/analytics/types.ts

export type Period = "7d" | "30d" | "90d" | "all"

export interface TimeSeriesPoint {
  date: string // ISO date, e.g. "2026-04-18"
  value: number
}

export type PlatformId = "instagram" | "youtube" | "tiktok" | "blog" | "newsletter"

export interface PlatformOverview {
  platform: PlatformId
  audience: number
  audienceSeries: TimeSeriesPoint[]
  engagementRate?: number
  totalReach?: number
  growthPercent?: number
}

export interface InstagramAnalytics {
  followers: number
  following: number
  postsCount: number
  reach30d: number
  impressions30d: number
  profileVisits30d: number
  websiteClicks30d: number
  engagementRate: number
  followersSeries: TimeSeriesPoint[]
  demographics: {
    age: Array<{ bucket: string; percent: number }>
    gender: Array<{ label: string; percent: number }>
  }
  topCities: Array<{ name: string; percent: number }>
  bestPostingHours: Array<{ day: number; hour: number; score: number }>
  topPosts: Array<{
    id: string
    thumbnail: string
    caption: string
    likes: number
    comments: number
    reach: number
    permalink: string
  }>
  storiesPerformance: {
    avgViews: number
    completionRate: number
    replies: number
  }
  mockFields: string[] // list of keys that are mock, e.g. ["demographics.age", "bestPostingHours"]
}

export interface YouTubeAnalytics {
  subscribers: number
  totalViews: number
  totalWatchHours: number
  videosCount: number
  avgViewDuration: number
  viewsSeries: TimeSeriesPoint[]
  subsGainedSeries: TimeSeriesPoint[]
  retentionAvg: number
  topVideos: Array<{
    id: string
    thumbnail: string
    title: string
    views: number
    likes: number
    comments: number
    publishedAt: string
    ctr?: number
  }>
  trafficSources: Array<{ source: string; percent: number }>
  topCountries: Array<{ code: string; name: string; percent: number }>
  mockFields: string[]
}

export interface TikTokAnalytics {
  followers: number
  following: number
  videosCount: number
  totalLikes: number
  totalShares: number
  followersSeries: TimeSeriesPoint[]
  topVideos: Array<{
    id: string
    thumbnail: string
    title: string
    views: number
    likes: number
    shares: number
    comments: number
    completionRate: number
  }>
  topHashtags: Array<{ tag: string; uses: number }>
  bestPostingHours: Array<{ day: number; hour: number; score: number }>
  isUsingMockData: true // always true for now
}

export interface BlogAnalytics {
  totalLikes: number
  totalPosts: number
  avgLikesPerPost: number
  likesSeries: TimeSeriesPoint[]
  topPosts: Array<{
    slug: string
    title: string
    likes: number
    date: string
  }>
}

export interface AnalyticsSummary {
  totalAudience: number
  audienceByPlatform: Array<{ platform: PlatformId; label: string; count: number; percent: number }>
  audienceSeries: Array<{ date: string; instagram: number; youtube: number; tiktok: number; newsletter: number }>
  avgEngagementRate: number
  totalReach: number
  topPost: {
    platform: PlatformId
    title: string
    metric: string
    thumbnail?: string
  } | null
  platformsComparison: Array<{
    platform: PlatformId
    label: string
    audience: number
    monthlyGrowth: number
    engagementRate: number
    postsPublished: number
    sparkline: TimeSeriesPoint[]
  }>
  lastSync: string
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/lib/analytics/types.ts
git commit -m "feat(analytics): add TypeScript types for analytics data"
```

---

### Task 2: Period helpers

**Files:**
- Create: `apps/dashboard/lib/analytics/period.ts`

- [ ] **Step 1: Write file**

```ts
// apps/dashboard/lib/analytics/period.ts
import type { Period } from "./types"

export function periodToDays(period: Period): number {
  switch (period) {
    case "7d": return 7
    case "30d": return 30
    case "90d": return 90
    case "all": return 365 * 5 // cap "all" at 5 years for queries
  }
}

export function periodLabel(period: Period): string {
  switch (period) {
    case "7d": return "Últimos 7 días"
    case "30d": return "Últimos 30 días"
    case "90d": return "Últimos 90 días"
    case "all": return "Todo el tiempo"
  }
}

export function isValidPeriod(v: unknown): v is Period {
  return v === "7d" || v === "30d" || v === "90d" || v === "all"
}

export function parsePeriod(v: string | undefined): Period {
  return isValidPeriod(v) ? v : "30d"
}

export function getDateRange(period: Period): { start: Date; end: Date } {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - periodToDays(period))
  return { start, end }
}

export function formatChartDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" })
}

// Deterministic seed from "YYYY-MM-DD" so mocks stay stable within a day
export function dailySeed(): number {
  const today = new Date().toISOString().slice(0, 10)
  let hash = 0
  for (let i = 0; i < today.length; i++) {
    hash = ((hash << 5) - hash) + today.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

// Seeded PRNG (mulberry32)
export function seededRandom(seed: number): () => number {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/lib/analytics/period.ts
git commit -m "feat(analytics): add period helpers + seeded random for deterministic mocks"
```

---

### Task 3: TikTok mock generator

**Files:**
- Create: `apps/dashboard/lib/analytics/mock/tiktok.ts`

- [ ] **Step 1: Write file**

```ts
// apps/dashboard/lib/analytics/mock/tiktok.ts
import { dailySeed, seededRandom, periodToDays } from "../period"
import type { TikTokAnalytics, Period, TimeSeriesPoint } from "../types"

const VIDEO_TITLES = [
  "¿Por qué olvidamos los sueños?",
  "Dato neurológico del día",
  "Lo que tu cerebro hace mientras lees",
  "3 señales de burnout",
  "Cerebro de adolescente vs adulto",
  "Cafeína: cómo actúa en 30s",
  "Memoria fotográfica ¿existe?",
  "Neuroplasticidad en 60 segundos",
]

const HASHTAGS = [
  { tag: "neurologia", uses: 45 },
  { tag: "cerebro", uses: 38 },
  { tag: "medicina", uses: 32 },
  { tag: "residentes", uses: 28 },
  { tag: "salud", uses: 24 },
  { tag: "psicologia", uses: 19 },
  { tag: "neurociencia", uses: 16 },
  { tag: "medtok", uses: 12 },
]

function generateSeries(days: number, start: number, growthRate: number, rnd: () => number): TimeSeriesPoint[] {
  const series: TimeSeriesPoint[] = []
  let value = start
  const now = new Date()
  for (let i = days; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    value = value * (1 + growthRate / 365) + (rnd() - 0.4) * (value * 0.003)
    series.push({
      date: d.toISOString().slice(0, 10),
      value: Math.round(Math.max(0, value)),
    })
  }
  return series
}

export function generateTikTokMock(period: Period): TikTokAnalytics {
  const rnd = seededRandom(dailySeed())
  const days = periodToDays(period)

  const followersSeries = generateSeries(days, 12400, 0.18, rnd)
  const followers = followersSeries[followersSeries.length - 1].value

  const topVideos = Array.from({ length: 6 }, (_, i) => ({
    id: `tt-${i}`,
    thumbnail: `https://picsum.photos/seed/tiktok${i}/360/640`,
    title: VIDEO_TITLES[i % VIDEO_TITLES.length],
    views: Math.round(80_000 + rnd() * 300_000),
    likes: Math.round(3_000 + rnd() * 18_000),
    shares: Math.round(100 + rnd() * 2_400),
    comments: Math.round(80 + rnd() * 900),
    completionRate: Math.round(35 + rnd() * 45),
  })).sort((a, b) => b.views - a.views)

  const bestPostingHours: Array<{ day: number; hour: number; score: number }> = []
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      let score = rnd() * 0.3
      if (hour >= 19 && hour <= 22) score += 0.5 + rnd() * 0.3
      if (day === 5 || day === 6) score += 0.15
      bestPostingHours.push({ day, hour, score: Math.min(1, score) })
    }
  }

  const totalLikes = topVideos.reduce((a, v) => a + v.likes, 0) * 3
  const totalShares = topVideos.reduce((a, v) => a + v.shares, 0) * 3

  return {
    followers,
    following: 8,
    videosCount: 48,
    totalLikes,
    totalShares,
    followersSeries,
    topVideos,
    topHashtags: HASHTAGS,
    bestPostingHours,
    isUsingMockData: true,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/lib/analytics/mock/tiktok.ts
git commit -m "feat(analytics/mock): add TikTok mock generator with deterministic seed"
```

---

### Task 4: Instagram extras mock

**Files:**
- Create: `apps/dashboard/lib/analytics/mock/instagram-extras.ts`

- [ ] **Step 1: Write file**

```ts
// apps/dashboard/lib/analytics/mock/instagram-extras.ts
import { dailySeed, seededRandom } from "../period"

export function mockDemographicsAge() {
  return [
    { bucket: "13-17", percent: 4 },
    { bucket: "18-24", percent: 26 },
    { bucket: "25-34", percent: 42 },
    { bucket: "35-44", percent: 18 },
    { bucket: "45-54", percent: 7 },
    { bucket: "55+", percent: 3 },
  ]
}

export function mockDemographicsGender() {
  return [
    { label: "Mujer", percent: 68 },
    { label: "Hombre", percent: 30 },
    { label: "Otro", percent: 2 },
  ]
}

export function mockTopCities() {
  return [
    { name: "Ciudad de México, MX", percent: 18 },
    { name: "Guadalajara, MX", percent: 11 },
    { name: "Monterrey, MX", percent: 8 },
    { name: "Madrid, ES", percent: 6 },
    { name: "Buenos Aires, AR", percent: 5 },
    { name: "Bogotá, CO", percent: 4 },
    { name: "Barcelona, ES", percent: 4 },
    { name: "Lima, PE", percent: 3 },
    { name: "Santiago, CL", percent: 3 },
    { name: "Miami, US", percent: 3 },
  ]
}

export function mockBestPostingHours(): Array<{ day: number; hour: number; score: number }> {
  const rnd = seededRandom(dailySeed())
  const out: Array<{ day: number; hour: number; score: number }> = []
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      let score = rnd() * 0.25
      if (hour >= 19 && hour <= 22) score += 0.5 + rnd() * 0.3
      if (hour >= 8 && hour <= 10) score += 0.25
      if (day === 5 || day === 6) score += 0.1
      out.push({ day, hour, score: Math.min(1, score) })
    }
  }
  return out
}

export function mockStoriesPerformance() {
  const rnd = seededRandom(dailySeed())
  return {
    avgViews: Math.round(15_000 + rnd() * 25_000),
    completionRate: Math.round(58 + rnd() * 18),
    replies: Math.round(20 + rnd() * 80),
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/lib/analytics/mock/instagram-extras.ts
git commit -m "feat(analytics/mock): add Instagram extras mocks (demographics, hours, stories)"
```

---

### Task 5: YouTube extras mock

**Files:**
- Create: `apps/dashboard/lib/analytics/mock/youtube-extras.ts`

- [ ] **Step 1: Write file**

```ts
// apps/dashboard/lib/analytics/mock/youtube-extras.ts
import { dailySeed, seededRandom } from "../period"

export function mockYTWatchHours(totalViews: number): number {
  // Assume average ~3 min per view
  return Math.round((totalViews * 3) / 60)
}

export function mockYTAvgViewDuration(): number {
  const rnd = seededRandom(dailySeed())
  return Math.round(110 + rnd() * 90) // 110-200 seconds
}

export function mockYTRetention(): number {
  const rnd = seededRandom(dailySeed() + 1)
  return Math.round(42 + rnd() * 28) // 42-70%
}

export function mockYTTrafficSources() {
  return [
    { source: "YouTube search", percent: 38 },
    { source: "Suggested videos", percent: 28 },
    { source: "Browse features", percent: 18 },
    { source: "External", percent: 10 },
    { source: "Other", percent: 6 },
  ]
}

export function mockYTTopCountries() {
  return [
    { code: "MX", name: "México", percent: 48 },
    { code: "ES", name: "España", percent: 14 },
    { code: "AR", name: "Argentina", percent: 9 },
    { code: "CO", name: "Colombia", percent: 8 },
    { code: "US", name: "Estados Unidos", percent: 7 },
    { code: "CL", name: "Chile", percent: 4 },
    { code: "PE", name: "Perú", percent: 4 },
  ]
}

export function mockYTCTR(): number {
  const rnd = seededRandom(dailySeed() + 2)
  return Math.round((4 + rnd() * 8) * 10) / 10 // 4.0 - 12.0%
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/lib/analytics/mock/youtube-extras.ts
git commit -m "feat(analytics/mock): add YouTube extras mocks (retention, sources, countries)"
```

---

### Task 6: YouTube client (real API)

**Files:**
- Create: `apps/dashboard/lib/analytics/youtube/client.ts`

- [ ] **Step 1: Write file**

```ts
// apps/dashboard/lib/analytics/youtube/client.ts
import type { TimeSeriesPoint } from "../types"
import { periodToDays } from "../period"

const YT_BASE = "https://www.googleapis.com/youtube/v3"

export interface YTChannelStats {
  subscribers: number
  totalViews: number
  videosCount: number
  uploadsPlaylistId: string
}

export interface YTVideo {
  id: string
  title: string
  thumbnail: string
  views: number
  likes: number
  comments: number
  publishedAt: string
}

interface YTChannelResponse {
  items?: Array<{
    statistics: { subscriberCount: string; viewCount: string; videoCount: string }
    contentDetails: { relatedPlaylists: { uploads: string } }
  }>
}

interface YTPlaylistItemsResponse {
  items?: Array<{
    contentDetails: { videoId: string; videoPublishedAt: string }
  }>
}

interface YTVideosResponse {
  items?: Array<{
    id: string
    snippet: { title: string; publishedAt: string; thumbnails: { medium: { url: string } } }
    statistics: { viewCount?: string; likeCount?: string; commentCount?: string }
  }>
}

export async function getChannelStats(
  apiKey: string,
  channelId: string
): Promise<YTChannelStats> {
  const url = `${YT_BASE}/channels?part=statistics,contentDetails&id=${channelId}&key=${apiKey}`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error(`YT channels failed: ${res.status}`)
  const data = (await res.json()) as YTChannelResponse
  const item = data.items?.[0]
  if (!item) throw new Error("YT channel not found")
  return {
    subscribers: Number(item.statistics.subscriberCount),
    totalViews: Number(item.statistics.viewCount),
    videosCount: Number(item.statistics.videoCount),
    uploadsPlaylistId: item.contentDetails.relatedPlaylists.uploads,
  }
}

export async function getRecentVideoIds(
  apiKey: string,
  uploadsPlaylistId: string,
  max = 25
): Promise<string[]> {
  const url = `${YT_BASE}/playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${max}&key=${apiKey}`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error(`YT playlistItems failed: ${res.status}`)
  const data = (await res.json()) as YTPlaylistItemsResponse
  return (data.items ?? []).map((i) => i.contentDetails.videoId)
}

export async function getVideosBatch(
  apiKey: string,
  ids: string[]
): Promise<YTVideo[]> {
  if (ids.length === 0) return []
  const url = `${YT_BASE}/videos?part=snippet,statistics&id=${ids.join(",")}&key=${apiKey}`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error(`YT videos failed: ${res.status}`)
  const data = (await res.json()) as YTVideosResponse
  return (data.items ?? []).map((v) => ({
    id: v.id,
    title: v.snippet.title,
    thumbnail: v.snippet.thumbnails.medium.url,
    publishedAt: v.snippet.publishedAt,
    views: Number(v.statistics.viewCount ?? 0),
    likes: Number(v.statistics.likeCount ?? 0),
    comments: Number(v.statistics.commentCount ?? 0),
  }))
}

// Derive view series by summing views of videos published each day in period
// Note: YT Data API doesn't give daily viewCount history. We approximate with
// published dates aggregated. This is acceptable for a general trend.
export function deriveViewsSeriesFromVideos(
  videos: YTVideo[],
  period: "7d" | "30d" | "90d" | "all"
): TimeSeriesPoint[] {
  const days = periodToDays(period)
  const buckets = new Map<string, number>()
  const now = new Date()
  for (let i = days; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    buckets.set(d.toISOString().slice(0, 10), 0)
  }
  const earliest = new Date(now)
  earliest.setDate(earliest.getDate() - days)
  for (const v of videos) {
    const d = v.publishedAt.slice(0, 10)
    if (!buckets.has(d)) continue
    buckets.set(d, (buckets.get(d) ?? 0) + v.views)
  }
  return Array.from(buckets.entries()).map(([date, value]) => ({ date, value }))
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/lib/analytics/youtube/client.ts
git commit -m "feat(analytics/youtube): add client for YouTube Data API v3"
```

---

### Task 7: YouTube facade

**Files:**
- Create: `apps/dashboard/lib/analytics/youtube/index.ts`

- [ ] **Step 1: Write file**

```ts
// apps/dashboard/lib/analytics/youtube/index.ts
import type { YouTubeAnalytics, Period, TimeSeriesPoint } from "../types"
import {
  getChannelStats,
  getRecentVideoIds,
  getVideosBatch,
  deriveViewsSeriesFromVideos,
  type YTVideo,
} from "./client"
import {
  mockYTAvgViewDuration,
  mockYTRetention,
  mockYTTrafficSources,
  mockYTTopCountries,
  mockYTWatchHours,
  mockYTCTR,
} from "../mock/youtube-extras"
import { dailySeed, seededRandom, periodToDays } from "../period"

function mockYouTubeFallback(period: Period): YouTubeAnalytics {
  const rnd = seededRandom(dailySeed())
  const days = periodToDays(period)
  const totalViews = 51_600
  const subscribers = 938

  const viewsSeries: TimeSeriesPoint[] = []
  const subsSeries: TimeSeriesPoint[] = []
  const now = new Date()
  for (let i = days; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    viewsSeries.push({
      date: d.toISOString().slice(0, 10),
      value: Math.round(200 + rnd() * 600),
    })
    subsSeries.push({
      date: d.toISOString().slice(0, 10),
      value: Math.round(1 + rnd() * 8),
    })
  }

  return {
    subscribers,
    totalViews,
    totalWatchHours: mockYTWatchHours(totalViews),
    videosCount: 69,
    avgViewDuration: mockYTAvgViewDuration(),
    viewsSeries,
    subsGainedSeries: subsSeries,
    retentionAvg: mockYTRetention(),
    topVideos: Array.from({ length: 5 }, (_, i) => ({
      id: `yt-mock-${i}`,
      thumbnail: `https://picsum.photos/seed/ytmock${i}/480/270`,
      title: `Video de ejemplo ${i + 1}`,
      views: Math.round(1_000 + rnd() * 15_000),
      likes: Math.round(50 + rnd() * 800),
      comments: Math.round(5 + rnd() * 80),
      publishedAt: new Date(Date.now() - i * 86_400_000 * 7).toISOString(),
      ctr: mockYTCTR(),
    })),
    trafficSources: mockYTTrafficSources(),
    topCountries: mockYTTopCountries(),
    mockFields: [
      "totalWatchHours",
      "avgViewDuration",
      "retentionAvg",
      "trafficSources",
      "topCountries",
      "topVideos[].ctr",
      "subscribers",
      "totalViews",
      "videosCount",
      "viewsSeries",
      "subsGainedSeries",
      "topVideos",
    ],
  }
}

export async function getYouTubeAnalytics(period: Period): Promise<YouTubeAnalytics> {
  const apiKey = process.env.YOUTUBE_API_KEY
  const channelId = process.env.YOUTUBE_CHANNEL_ID

  if (!apiKey || !channelId) {
    return mockYouTubeFallback(period)
  }

  try {
    const stats = await getChannelStats(apiKey, channelId)
    const videoIds = await getRecentVideoIds(apiKey, stats.uploadsPlaylistId, 25)
    const videos = await getVideosBatch(apiKey, videoIds)

    const topVideos = videos
      .slice()
      .sort((a: YTVideo, b: YTVideo) => b.views - a.views)
      .slice(0, 5)
      .map((v) => ({
        id: v.id,
        thumbnail: v.thumbnail,
        title: v.title,
        views: v.views,
        likes: v.likes,
        comments: v.comments,
        publishedAt: v.publishedAt,
        ctr: mockYTCTR(),
      }))

    const viewsSeries = deriveViewsSeriesFromVideos(videos, period)

    // subs gained is approximated because API Key cannot access analytics endpoint
    const rnd = seededRandom(dailySeed() + 3)
    const subsGainedSeries: TimeSeriesPoint[] = viewsSeries.map((p) => ({
      date: p.date,
      value: Math.round(rnd() * 6),
    }))

    return {
      subscribers: stats.subscribers,
      totalViews: stats.totalViews,
      totalWatchHours: mockYTWatchHours(stats.totalViews),
      videosCount: stats.videosCount,
      avgViewDuration: mockYTAvgViewDuration(),
      viewsSeries,
      subsGainedSeries,
      retentionAvg: mockYTRetention(),
      topVideos,
      trafficSources: mockYTTrafficSources(),
      topCountries: mockYTTopCountries(),
      mockFields: [
        "totalWatchHours",
        "avgViewDuration",
        "retentionAvg",
        "trafficSources",
        "topCountries",
        "topVideos[].ctr",
        "subsGainedSeries",
      ],
    }
  } catch (err) {
    console.error("[analytics/youtube] fetch failed, falling back to mock:", err)
    return mockYouTubeFallback(period)
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/lib/analytics/youtube/index.ts
git commit -m "feat(analytics/youtube): facade combining real API + mock fallbacks"
```

---

### Task 8: Instagram client (real API)

**Files:**
- Create: `apps/dashboard/lib/analytics/instagram/client.ts`

- [ ] **Step 1: Write file**

```ts
// apps/dashboard/lib/analytics/instagram/client.ts

const IG_BASE = "https://graph.instagram.com/v21.0"

export interface IGBasicStats {
  username: string
  followers: number
  following: number
  postsCount: number
}

export interface IGMedia {
  id: string
  caption: string
  mediaType: string
  mediaUrl?: string
  thumbnailUrl?: string
  permalink: string
  timestamp: string
  likeCount: number
  commentsCount: number
}

export interface IGInsights {
  reach?: number
  impressions?: number
  profileVisits?: number
  websiteClicks?: number
}

interface IGUserResponse {
  username: string
  followers_count: number
  follows_count: number
  media_count: number
}

interface IGMediaResponse {
  data?: Array<{
    id: string
    caption?: string
    media_type: string
    media_url?: string
    thumbnail_url?: string
    permalink: string
    timestamp: string
    like_count: number
    comments_count: number
  }>
}

interface IGInsightValue {
  name: string
  values: Array<{ value: number }>
}

interface IGInsightsResponse {
  data?: IGInsightValue[]
}

interface IGMediaInsightsResponse {
  data?: Array<{ name: string; values: Array<{ value: number }> }>
}

export async function getBasicStats(
  accessToken: string,
  userId: string
): Promise<IGBasicStats> {
  const url = `${IG_BASE}/${userId}?fields=username,followers_count,follows_count,media_count&access_token=${accessToken}`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error(`IG basic stats failed: ${res.status}`)
  const data = (await res.json()) as IGUserResponse
  return {
    username: data.username,
    followers: data.followers_count,
    following: data.follows_count,
    postsCount: data.media_count,
  }
}

export async function getRecentMedia(
  accessToken: string,
  userId: string,
  limit = 25
): Promise<IGMedia[]> {
  const fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count"
  const url = `${IG_BASE}/${userId}/media?fields=${fields}&limit=${limit}&access_token=${accessToken}`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error(`IG media failed: ${res.status}`)
  const data = (await res.json()) as IGMediaResponse
  return (data.data ?? []).map((m) => ({
    id: m.id,
    caption: m.caption ?? "",
    mediaType: m.media_type,
    mediaUrl: m.media_url,
    thumbnailUrl: m.thumbnail_url,
    permalink: m.permalink,
    timestamp: m.timestamp,
    likeCount: m.like_count,
    commentsCount: m.comments_count,
  }))
}

export async function getProfileInsights(
  accessToken: string,
  userId: string
): Promise<IGInsights> {
  // Creator accounts support profile insights on day basis. We sum last 28 days.
  const metrics = ["reach", "impressions", "profile_views", "website_clicks"]
  const url = `${IG_BASE}/${userId}/insights?metric=${metrics.join(",")}&period=day&metric_type=total_value&access_token=${accessToken}`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) {
    // 400/403 means insights not available for this account tier
    throw new Error(`IG profile insights failed: ${res.status}`)
  }
  const data = (await res.json()) as IGInsightsResponse
  const map: Record<string, number> = {}
  for (const m of data.data ?? []) {
    const total = m.values.reduce((acc, v) => acc + (v.value ?? 0), 0)
    map[m.name] = total
  }
  return {
    reach: map.reach,
    impressions: map.impressions,
    profileVisits: map.profile_views,
    websiteClicks: map.website_clicks,
  }
}

export async function getMediaInsights(
  accessToken: string,
  mediaId: string
): Promise<{ reach?: number; impressions?: number; engagement?: number }> {
  const url = `${IG_BASE}/${mediaId}/insights?metric=reach,impressions,engagement&access_token=${accessToken}`
  const res = await fetch(url, { next: { revalidate: 600 } })
  if (!res.ok) return {}
  const data = (await res.json()) as IGMediaInsightsResponse
  const map: Record<string, number> = {}
  for (const m of data.data ?? []) {
    map[m.name] = m.values[0]?.value ?? 0
  }
  return {
    reach: map.reach,
    impressions: map.impressions,
    engagement: map.engagement,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/lib/analytics/instagram/client.ts
git commit -m "feat(analytics/instagram): add Graph API client (basic stats, media, insights)"
```

---

### Task 9: Instagram facade

**Files:**
- Create: `apps/dashboard/lib/analytics/instagram/index.ts`

- [ ] **Step 1: Write file**

```ts
// apps/dashboard/lib/analytics/instagram/index.ts
import type { InstagramAnalytics, Period, TimeSeriesPoint } from "../types"
import { getBasicStats, getRecentMedia, getProfileInsights, getMediaInsights, type IGMedia } from "./client"
import {
  mockDemographicsAge,
  mockDemographicsGender,
  mockTopCities,
  mockBestPostingHours,
  mockStoriesPerformance,
} from "../mock/instagram-extras"
import { dailySeed, seededRandom, periodToDays } from "../period"

function mockInstagramFallback(period: Period): InstagramAnalytics {
  const rnd = seededRandom(dailySeed())
  const days = periodToDays(period)

  const followersSeries: TimeSeriesPoint[] = []
  const now = new Date()
  let value = 340_000
  for (let i = days; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    value += Math.round(rnd() * 600)
    followersSeries.push({
      date: d.toISOString().slice(0, 10),
      value,
    })
  }

  return {
    followers: value,
    following: 82,
    postsCount: 163,
    reach30d: 1_200_000,
    impressions30d: 2_800_000,
    profileVisits30d: 48_000,
    websiteClicks30d: 1_200,
    engagementRate: 4.8,
    followersSeries,
    demographics: { age: mockDemographicsAge(), gender: mockDemographicsGender() },
    topCities: mockTopCities(),
    bestPostingHours: mockBestPostingHours(),
    topPosts: Array.from({ length: 6 }, (_, i) => ({
      id: `ig-mock-${i}`,
      thumbnail: `https://picsum.photos/seed/igmock${i}/400/400`,
      caption: `Post de ejemplo ${i + 1}`,
      likes: Math.round(2_000 + rnd() * 12_000),
      comments: Math.round(40 + rnd() * 350),
      reach: Math.round(20_000 + rnd() * 80_000),
      permalink: "#",
    })),
    storiesPerformance: mockStoriesPerformance(),
    mockFields: [
      "reach30d",
      "impressions30d",
      "profileVisits30d",
      "websiteClicks30d",
      "demographics",
      "topCities",
      "bestPostingHours",
      "storiesPerformance",
      "followers",
      "following",
      "postsCount",
      "followersSeries",
      "topPosts",
      "engagementRate",
    ],
  }
}

function approximateFollowersSeries(
  currentFollowers: number,
  period: Period
): TimeSeriesPoint[] {
  // Graph API Key-level access doesn't give historical follower counts.
  // We approximate a smooth growth curve landing at currentFollowers today.
  const rnd = seededRandom(dailySeed())
  const days = periodToDays(period)
  const series: TimeSeriesPoint[] = []
  const now = new Date()
  const weeklyGrowth = 0.006 // 0.6% per week assumed
  let val = currentFollowers / Math.pow(1 + weeklyGrowth / 7, days)
  for (let i = days; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    val = val * (1 + weeklyGrowth / 7) + (rnd() - 0.5) * val * 0.0008
    series.push({
      date: d.toISOString().slice(0, 10),
      value: Math.round(val),
    })
  }
  // Force last point to match exact current followers
  if (series.length > 0) series[series.length - 1].value = currentFollowers
  return series
}

export async function getInstagramAnalytics(period: Period): Promise<InstagramAnalytics> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
  const userId = process.env.INSTAGRAM_USER_ID

  if (!accessToken || !userId) {
    return mockInstagramFallback(period)
  }

  const mockFields: string[] = []

  // 1) Basic stats — always expected to succeed
  let basic
  try {
    basic = await getBasicStats(accessToken, userId)
  } catch (err) {
    console.error("[analytics/instagram] basic stats failed:", err)
    return mockInstagramFallback(period)
  }

  // 2) Media
  let media: IGMedia[] = []
  try {
    media = await getRecentMedia(accessToken, userId, 25)
  } catch (err) {
    console.error("[analytics/instagram] media fetch failed:", err)
    mockFields.push("topPosts")
  }

  // 3) Profile insights — may fail for accounts below threshold
  let insights: { reach?: number; impressions?: number; profileVisits?: number; websiteClicks?: number } = {}
  try {
    insights = await getProfileInsights(accessToken, userId)
  } catch (err) {
    console.error("[analytics/instagram] profile insights failed:", err)
    mockFields.push("reach30d", "impressions30d", "profileVisits30d", "websiteClicks30d")
  }

  // 4) Per-post insights (reach) — fetch for top 6
  const sorted = media.slice().sort((a, b) => b.likeCount + b.commentsCount - (a.likeCount + a.commentsCount))
  const topSix = sorted.slice(0, 6)
  const postsWithInsights = await Promise.all(
    topSix.map(async (m) => {
      const ins = await getMediaInsights(accessToken, m.id)
      return {
        id: m.id,
        thumbnail: m.thumbnailUrl ?? m.mediaUrl ?? "",
        caption: m.caption.slice(0, 80),
        likes: m.likeCount,
        comments: m.commentsCount,
        reach: ins.reach ?? 0,
        permalink: m.permalink,
      }
    })
  )

  // 5) Engagement rate = avg(likes+comments) / followers * 100, over top 12 posts
  const engSample = media.slice(0, 12)
  const avgEng = engSample.length > 0
    ? engSample.reduce((a, m) => a + m.likeCount + m.commentsCount, 0) / engSample.length
    : 0
  const engagementRate = basic.followers > 0
    ? Math.round((avgEng / basic.followers) * 10000) / 100
    : 0

  // 6) Approximate followers series (API key can't get history)
  mockFields.push("followersSeries")
  const followersSeries = approximateFollowersSeries(basic.followers, period)

  // 7) Demographics, cities, hours, stories — always mock (need Business tier API)
  mockFields.push("demographics", "topCities", "bestPostingHours", "storiesPerformance")

  return {
    followers: basic.followers,
    following: basic.following,
    postsCount: basic.postsCount,
    reach30d: insights.reach ?? 1_200_000,
    impressions30d: insights.impressions ?? 2_800_000,
    profileVisits30d: insights.profileVisits ?? 48_000,
    websiteClicks30d: insights.websiteClicks ?? 1_200,
    engagementRate,
    followersSeries,
    demographics: { age: mockDemographicsAge(), gender: mockDemographicsGender() },
    topCities: mockTopCities(),
    bestPostingHours: mockBestPostingHours(),
    topPosts: postsWithInsights,
    storiesPerformance: mockStoriesPerformance(),
    mockFields,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/lib/analytics/instagram/index.ts
git commit -m "feat(analytics/instagram): facade combining real API + per-field mock fallback"
```

---

### Task 10: Blog queries

**Files:**
- Create: `apps/dashboard/lib/analytics/blog/index.ts`

- [ ] **Step 1: Write file**

```ts
// apps/dashboard/lib/analytics/blog/index.ts
import type { BlogAnalytics, Period, TimeSeriesPoint } from "../types"
import { getSupabase } from "@/lib/supabase"
import { periodToDays } from "../period"
import { readFile } from "fs/promises"
import path from "path"

interface BlogPostsFile {
  posts?: Array<{ slug: string; title: string; date: string }>
}

async function getBlogPostsFromContent(): Promise<Array<{ slug: string; title: string; date: string }>> {
  try {
    const raw = await readFile(
      path.join(process.cwd(), "../../apps/web/public/data/content.json"),
      "utf-8"
    )
    const content = JSON.parse(raw) as { blog?: BlogPostsFile }
    return content.blog?.posts ?? []
  } catch {
    return []
  }
}

export async function getBlogAnalytics(period: Period): Promise<BlogAnalytics> {
  const days = periodToDays(period)
  const rangeStart = new Date()
  rangeStart.setDate(rangeStart.getDate() - days)

  const [{ data: likesData }, posts] = await Promise.all([
    getSupabase().from("post_likes").select("slug, created_at"),
    getBlogPostsFromContent(),
  ])

  const likesBySlug: Record<string, number> = {}
  const likesByDate = new Map<string, number>()

  const now = new Date()
  for (let i = days; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    likesByDate.set(d.toISOString().slice(0, 10), 0)
  }

  ;(likesData ?? []).forEach(({ slug, created_at }) => {
    likesBySlug[slug] = (likesBySlug[slug] ?? 0) + 1
    if (created_at) {
      const date = created_at.slice(0, 10)
      if (likesByDate.has(date)) {
        likesByDate.set(date, (likesByDate.get(date) ?? 0) + 1)
      }
    }
  })

  const totalLikes = likesData?.length ?? 0
  const totalPosts = posts.length

  const topPosts = posts
    .map((p) => ({ ...p, likes: likesBySlug[p.slug] ?? 0 }))
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 10)

  const likesSeries: TimeSeriesPoint[] = Array.from(likesByDate.entries()).map(
    ([date, value]) => ({ date, value })
  )

  return {
    totalLikes,
    totalPosts,
    avgLikesPerPost: totalPosts > 0 ? Math.round(totalLikes / totalPosts) : 0,
    likesSeries,
    topPosts,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/lib/analytics/blog/index.ts
git commit -m "feat(analytics/blog): real Supabase queries + content.json integration"
```

---

### Task 11: Analytics adapter (facade)

**Files:**
- Create: `apps/dashboard/lib/analytics/adapter.ts`

- [ ] **Step 1: Write file**

```ts
// apps/dashboard/lib/analytics/adapter.ts
import type {
  Period,
  InstagramAnalytics,
  YouTubeAnalytics,
  TikTokAnalytics,
  BlogAnalytics,
  AnalyticsSummary,
} from "./types"
import { getInstagramAnalytics } from "./instagram"
import { getYouTubeAnalytics } from "./youtube"
import { generateTikTokMock } from "./mock/tiktok"
import { getBlogAnalytics } from "./blog"
import { getSupabase } from "@/lib/supabase"

async function getNewsletterCount(): Promise<number> {
  const { count } = await getSupabase()
    .from("suscriptores")
    .select("id", { count: "exact", head: true })
  return count ?? 0
}

export const analyticsAdapter = {
  async getInstagram(period: Period): Promise<InstagramAnalytics> {
    return getInstagramAnalytics(period)
  },

  async getYouTube(period: Period): Promise<YouTubeAnalytics> {
    return getYouTubeAnalytics(period)
  },

  async getTikTok(period: Period): Promise<TikTokAnalytics> {
    return generateTikTokMock(period)
  },

  async getBlog(period: Period): Promise<BlogAnalytics> {
    return getBlogAnalytics(period)
  },

  async getSummary(period: Period): Promise<AnalyticsSummary> {
    const [ig, yt, tt, blog, newsletterCount] = await Promise.all([
      getInstagramAnalytics(period),
      getYouTubeAnalytics(period),
      Promise.resolve(generateTikTokMock(period)),
      getBlogAnalytics(period),
      getNewsletterCount(),
    ])

    const totalAudience = ig.followers + yt.subscribers + tt.followers + newsletterCount

    const audienceByPlatform = [
      { platform: "instagram" as const, label: "Instagram", count: ig.followers },
      { platform: "youtube" as const, label: "YouTube", count: yt.subscribers },
      { platform: "tiktok" as const, label: "TikTok", count: tt.followers },
      { platform: "newsletter" as const, label: "Newsletter", count: newsletterCount },
    ].map((p) => ({
      ...p,
      percent: totalAudience > 0 ? Math.round((p.count / totalAudience) * 100) : 0,
    }))

    const dates = ig.followersSeries.map((p) => p.date)
    const audienceSeries = dates.map((date, i) => ({
      date,
      instagram: ig.followersSeries[i]?.value ?? 0,
      youtube: yt.subsGainedSeries[i]?.value ?? 0,
      tiktok: tt.followersSeries[i]?.value ?? 0,
      newsletter: Math.round(newsletterCount * (i / Math.max(1, dates.length - 1))),
    }))

    // Determine top post across all platforms
    let topPost: AnalyticsSummary["topPost"] = null
    const igTop = ig.topPosts[0]
    const ytTop = yt.topVideos[0]
    if (igTop && ytTop) {
      if (igTop.likes * 10 > ytTop.views) {
        topPost = {
          platform: "instagram",
          title: igTop.caption.slice(0, 60) || "Post de Instagram",
          metric: `${igTop.likes.toLocaleString("es-MX")} likes`,
          thumbnail: igTop.thumbnail,
        }
      } else {
        topPost = {
          platform: "youtube",
          title: ytTop.title,
          metric: `${ytTop.views.toLocaleString("es-MX")} vistas`,
          thumbnail: ytTop.thumbnail,
        }
      }
    } else if (igTop) {
      topPost = {
        platform: "instagram",
        title: igTop.caption.slice(0, 60) || "Post de Instagram",
        metric: `${igTop.likes.toLocaleString("es-MX")} likes`,
        thumbnail: igTop.thumbnail,
      }
    } else if (ytTop) {
      topPost = {
        platform: "youtube",
        title: ytTop.title,
        metric: `${ytTop.views.toLocaleString("es-MX")} vistas`,
        thumbnail: ytTop.thumbnail,
      }
    }

    const totalReach = (ig.reach30d ?? 0) + (yt.totalViews ?? 0)
    const avgEngagementRate = ig.engagementRate

    const platformsComparison = [
      {
        platform: "instagram" as const,
        label: "Instagram",
        audience: ig.followers,
        monthlyGrowth: 2.1,
        engagementRate: ig.engagementRate,
        postsPublished: ig.postsCount,
        sparkline: ig.followersSeries.slice(-30),
      },
      {
        platform: "youtube" as const,
        label: "YouTube",
        audience: yt.subscribers,
        monthlyGrowth: 5.4,
        engagementRate: 0,
        postsPublished: yt.videosCount,
        sparkline: yt.viewsSeries.slice(-30),
      },
      {
        platform: "tiktok" as const,
        label: "TikTok",
        audience: tt.followers,
        monthlyGrowth: 8.0,
        engagementRate: 0,
        postsPublished: tt.videosCount,
        sparkline: tt.followersSeries.slice(-30),
      },
      {
        platform: "newsletter" as const,
        label: "Newsletter",
        audience: newsletterCount,
        monthlyGrowth: 0,
        engagementRate: 0,
        postsPublished: 0,
        sparkline: [],
      },
    ]

    return {
      totalAudience,
      audienceByPlatform,
      audienceSeries,
      avgEngagementRate,
      totalReach,
      topPost,
      platformsComparison,
      lastSync: new Date().toISOString(),
    }
  },
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/lib/analytics/adapter.ts
git commit -m "feat(analytics): public adapter combining all platform data"
```

---

## PHASE 2 — Chart primitives

### Task 12: PeriodSelector

**Files:**
- Create: `apps/dashboard/components/ui/charts/PeriodSelector.tsx`

- [ ] **Step 1: Write file**

```tsx
"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react"
import { Calendar, ChevronDown } from "lucide-react"
import { periodLabel, isValidPeriod } from "@/lib/analytics/period"
import type { Period } from "@/lib/analytics/types"

const OPTIONS: Period[] = ["7d", "30d", "90d", "all"]

export function PeriodSelector() {
  const router = useRouter()
  const params = useSearchParams()
  const raw = params.get("period")
  const current: Period = isValidPeriod(raw) ? raw : "30d"

  function setPeriod(p: Period) {
    const sp = new URLSearchParams(params.toString())
    sp.set("period", p)
    router.push(`?${sp.toString()}`)
  }

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          size="sm"
          variant="flat"
          className="h-8 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-[12px] text-[var(--c-text)]"
          startContent={<Calendar className="h-3.5 w-3.5" />}
          endContent={<ChevronDown className="h-3 w-3" />}
        >
          {periodLabel(current)}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Período"
        selectionMode="single"
        selectedKeys={[current]}
        onSelectionChange={(keys) => {
          const key = Array.from(keys)[0] as Period
          if (key && isValidPeriod(key)) setPeriod(key)
        }}
      >
        {OPTIONS.map((p) => (
          <DropdownItem key={p}>{periodLabel(p)}</DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/ui/charts/PeriodSelector.tsx
git commit -m "feat(ui/charts): add PeriodSelector with URL search param"
```

---

### Task 13: LineChartCard

**Files:**
- Create: `apps/dashboard/components/ui/charts/LineChartCard.tsx`

- [ ] **Step 1: Write file**

```tsx
"use client"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { InfoCard } from "../InfoCard"
import { formatChartDate } from "@/lib/analytics/period"

interface LineSpec {
  key: string
  label: string
  color?: string
}

interface LineChartCardProps {
  title: string
  description?: string
  data: Array<{ date: string } & Record<string, number>>
  lines: LineSpec[]
  height?: number
}

const DEFAULT_COLORS = ["#0a0a0b", "#6b7280", "#10b981", "#ef4444"]

export function LineChartCard({
  title,
  description,
  data,
  lines,
  height = 240,
}: LineChartCardProps) {
  return (
    <InfoCard title={title}>
      {description && (
        <p className="-mt-2 mb-4 text-xs text-[var(--c-text-muted)]">{description}</p>
      )}
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              {lines.map((ln, i) => (
                <linearGradient key={ln.key} id={`grad-${ln.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={ln.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="100%"
                    stopColor={ln.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
                    stopOpacity={0}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "var(--c-text-muted)" }}
              tickFormatter={formatChartDate}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--c-text-muted)" }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                background: "var(--c-surface)",
                border: "1px solid var(--c-border)",
                borderRadius: "12px",
                fontSize: "12px",
              }}
              labelFormatter={formatChartDate}
            />
            {lines.length > 1 && (
              <Legend
                wrapperStyle={{ fontSize: "11px", color: "var(--c-text-muted)" }}
                iconType="circle"
                iconSize={8}
              />
            )}
            {lines.map((ln, i) => (
              <Area
                key={ln.key}
                type="monotone"
                dataKey={ln.key}
                name={ln.label}
                stroke={ln.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
                strokeWidth={2}
                fill={`url(#grad-${ln.key})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </InfoCard>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/ui/charts/LineChartCard.tsx
git commit -m "feat(ui/charts): add LineChartCard with gradient area fills"
```

---

### Task 14: BarChartCard

**Files:**
- Create: `apps/dashboard/components/ui/charts/BarChartCard.tsx`

- [ ] **Step 1: Write file**

```tsx
"use client"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { InfoCard } from "../InfoCard"

interface BarChartCardProps {
  title: string
  data: Array<{ label: string; value: number }>
  height?: number
  orientation?: "vertical" | "horizontal"
  color?: string
}

export function BarChartCard({
  title,
  data,
  height = 240,
  orientation = "vertical",
  color = "#0a0a0b",
}: BarChartCardProps) {
  return (
    <InfoCard title={title}>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          {orientation === "vertical" ? (
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--c-text-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--c-text-muted)" }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--c-surface)",
                  border: "1px solid var(--c-border)",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : (
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 16, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "var(--c-text-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--c-text-muted)" }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--c-surface)",
                  border: "1px solid var(--c-border)",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="value" fill={color} radius={[0, 6, 6, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </InfoCard>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/ui/charts/BarChartCard.tsx
git commit -m "feat(ui/charts): add BarChartCard with vertical/horizontal orientation"
```

---

### Task 15: DonutChartCard

**Files:**
- Create: `apps/dashboard/components/ui/charts/DonutChartCard.tsx`

- [ ] **Step 1: Write file**

```tsx
"use client"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { InfoCard } from "../InfoCard"

interface DonutChartCardProps {
  title: string
  data: Array<{ label: string; value: number; color?: string }>
  height?: number
}

const DEFAULT_COLORS = ["#0a0a0b", "#6b7280", "#a1a1aa", "#d4d4d4", "#f4f4f5"]

export function DonutChartCard({ title, data, height = 240 }: DonutChartCardProps) {
  const total = data.reduce((a, b) => a + b.value, 0)
  return (
    <InfoCard title={title}>
      <div className="flex items-center gap-6" style={{ minHeight: height }}>
        <div style={{ width: "50%", height }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={2}
                stroke="var(--c-bg)"
                strokeWidth={2}
              >
                {data.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--c-surface)",
                  border: "1px solid var(--c-border)",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="flex flex-1 flex-col gap-2">
          {data.map((d, i) => {
            const pct = total > 0 ? Math.round((d.value / total) * 100) : 0
            return (
              <li key={i} className="flex items-center gap-2 text-[12px]">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: d.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}
                />
                <span className="flex-1 text-[var(--c-text)]">{d.label}</span>
                <span className="font-medium text-[var(--c-text-muted)]">{pct}%</span>
              </li>
            )
          })}
        </ul>
      </div>
    </InfoCard>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/ui/charts/DonutChartCard.tsx
git commit -m "feat(ui/charts): add DonutChartCard with side legend"
```

---

### Task 16: HeatmapCard

**Files:**
- Create: `apps/dashboard/components/ui/charts/HeatmapCard.tsx`

- [ ] **Step 1: Write file**

```tsx
"use client"
import { InfoCard } from "../InfoCard"
import { Tooltip } from "@heroui/react"

interface HeatmapCardProps {
  title: string
  description?: string
  data: Array<{ day: number; hour: number; score: number }>
}

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
const HOURS_SHOWN = [0, 3, 6, 9, 12, 15, 18, 21]

export function HeatmapCard({ title, description, data }: HeatmapCardProps) {
  const grid: Record<string, number> = {}
  for (const d of data) {
    grid[`${d.day}-${d.hour}`] = d.score
  }

  function cellColor(score: number): string {
    const alpha = 0.08 + score * 0.82
    return `rgba(10, 10, 11, ${alpha})` // dark mode will look like white on dark because of --c-text color in mix
  }

  return (
    <InfoCard title={title}>
      {description && (
        <p className="-mt-2 mb-4 text-xs text-[var(--c-text-muted)]">{description}</p>
      )}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <div className="w-10" />
          {Array.from({ length: 24 }).map((_, h) => (
            <div
              key={h}
              className="flex-1 text-center text-[9px] text-[var(--c-text-subtle)]"
            >
              {HOURS_SHOWN.includes(h) ? `${h}h` : ""}
            </div>
          ))}
        </div>
        {DAY_LABELS.map((day, dayIdx) => (
          <div key={dayIdx} className="flex items-center gap-1">
            <div className="w-10 text-[10px] font-medium text-[var(--c-text-muted)]">{day}</div>
            {Array.from({ length: 24 }).map((_, h) => {
              const score = grid[`${dayIdx}-${h}`] ?? 0
              return (
                <Tooltip
                  key={h}
                  content={`${day} ${h}:00 — score ${Math.round(score * 100)}`}
                  delay={0}
                  closeDelay={0}
                >
                  <div
                    className="flex-1 rounded-sm"
                    style={{
                      height: 18,
                      background: cellColor(score),
                      border: "1px solid var(--c-border)",
                    }}
                  />
                </Tooltip>
              )
            })}
          </div>
        ))}
      </div>
    </InfoCard>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/ui/charts/HeatmapCard.tsx
git commit -m "feat(ui/charts): add HeatmapCard (7x24 day-hour grid)"
```

---

### Task 17: SparklineInline

**Files:**
- Create: `apps/dashboard/components/ui/charts/SparklineInline.tsx`

- [ ] **Step 1: Write file**

```tsx
"use client"
import { AreaChart, Area, ResponsiveContainer } from "recharts"

interface SparklineInlineProps {
  data: Array<{ date: string; value: number }>
  color?: string
  width?: number
  height?: number
}

export function SparklineInline({
  data,
  color = "#10b981",
  width = 80,
  height = 24,
}: SparklineInlineProps) {
  if (data.length === 0) {
    return <div style={{ width, height }} />
  }
  const id = `spark-${Math.random().toString(36).slice(2, 8)}`
  return (
    <div style={{ width, height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${id})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/ui/charts/SparklineInline.tsx
git commit -m "feat(ui/charts): add SparklineInline (tiny area chart)"
```

---

### Task 18: PostGridCard

**Files:**
- Create: `apps/dashboard/components/ui/charts/PostGridCard.tsx`

- [ ] **Step 1: Write file**

```tsx
"use client"
import { InfoCard } from "../InfoCard"
import { motion } from "framer-motion"
import { cn } from "@cerebros/lib"

interface PostStat {
  icon: React.ReactNode
  value: string | number
}

interface PostItem {
  id: string
  thumbnail: string
  title?: string
  caption?: string
  stats: PostStat[]
  href?: string
}

interface PostGridCardProps {
  title: string
  posts: PostItem[]
  aspectRatio?: "square" | "video" | "portrait"
  columns?: 2 | 3
}

const aspectClass: Record<NonNullable<PostGridCardProps["aspectRatio"]>, string> = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[9/16]",
}

export function PostGridCard({
  title,
  posts,
  aspectRatio = "square",
  columns = 3,
}: PostGridCardProps) {
  return (
    <InfoCard title={title}>
      <div
        className={cn(
          "grid gap-3",
          columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        )}
      >
        {posts.map((p) => {
          const Wrapper: React.ElementType = p.href ? "a" : "div"
          return (
            <Wrapper
              key={p.id}
              href={p.href}
              target="_blank"
              rel="noopener"
              className="group block overflow-hidden rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] transition-colors hover:border-[var(--c-border-strong)]"
            >
              <motion.div
                className={cn("relative w-full overflow-hidden bg-[var(--c-surface-3)]", aspectClass[aspectRatio])}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.25 }}
              >
                {p.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.thumbnail}
                    alt={p.title ?? p.caption ?? ""}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full" />
                )}
              </motion.div>
              <div className="p-3">
                {(p.title ?? p.caption) && (
                  <p className="line-clamp-2 text-[12px] font-medium text-[var(--c-text)]">
                    {p.title ?? p.caption}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-3">
                  {p.stats.map((s, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[11px] text-[var(--c-text-muted)]"
                    >
                      {s.icon}
                      {typeof s.value === "number" ? s.value.toLocaleString("es-MX") : s.value}
                    </span>
                  ))}
                </div>
              </div>
            </Wrapper>
          )
        })}
      </div>
    </InfoCard>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/ui/charts/PostGridCard.tsx
git commit -m "feat(ui/charts): add PostGridCard (thumbnail grid with stats overlay)"
```

---

### Task 19: GeoBar

**Files:**
- Create: `apps/dashboard/components/ui/charts/GeoBar.tsx`

- [ ] **Step 1: Write file**

```tsx
"use client"
import { InfoCard } from "../InfoCard"
import { Progress } from "@heroui/react"

interface GeoBarItem {
  name: string
  percent: number
  flag?: string // optional emoji flag
}

interface GeoBarProps {
  title: string
  items: GeoBarItem[]
}

export function GeoBar({ title, items }: GeoBarProps) {
  return (
    <InfoCard title={title}>
      <ul className="flex flex-col gap-3">
        {items.map((it) => (
          <li key={it.name} className="grid grid-cols-[140px_1fr_40px] items-center gap-3">
            <span className="flex items-center gap-2 text-[12px] text-[var(--c-text)]">
              {it.flag && <span>{it.flag}</span>}
              <span className="truncate">{it.name}</span>
            </span>
            <Progress
              aria-label={it.name}
              value={it.percent}
              maxValue={100}
              size="sm"
              classNames={{
                track: "bg-[var(--c-surface-2)]",
                indicator: "bg-[var(--c-invert)]",
              }}
            />
            <span className="text-right text-[11px] font-medium text-[var(--c-text-muted)]">
              {it.percent}%
            </span>
          </li>
        ))}
      </ul>
    </InfoCard>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/ui/charts/GeoBar.tsx
git commit -m "feat(ui/charts): add GeoBar (progress bars for geo data)"
```

---

### Task 20: ComparisonTable

**Files:**
- Create: `apps/dashboard/components/ui/charts/ComparisonTable.tsx`

- [ ] **Step 1: Write file**

```tsx
"use client"
import { InfoCard } from "../InfoCard"
import { SparklineInline } from "./SparklineInline"
import { cn } from "@cerebros/lib"
import type { TimeSeriesPoint, PlatformId } from "@/lib/analytics/types"

interface ComparisonRow {
  platform: PlatformId
  label: string
  audience: number
  monthlyGrowth: number
  engagementRate: number
  postsPublished: number
  sparkline: TimeSeriesPoint[]
}

interface ComparisonTableProps {
  title: string
  rows: ComparisonRow[]
}

export function ComparisonTable({ title, rows }: ComparisonTableProps) {
  return (
    <InfoCard title={title} padded={false}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <Th>Plataforma</Th>
              <Th align="right">Audiencia</Th>
              <Th align="right">Crecimiento</Th>
              <Th align="right">Engagement</Th>
              <Th align="right">Posts</Th>
              <Th align="right">Tendencia</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.platform}>
                <Td>
                  <span className="text-[13px] font-medium text-[var(--c-text)]">{r.label}</span>
                </Td>
                <Td align="right">
                  <span className="text-[13px] text-[var(--c-text)]">
                    {r.audience.toLocaleString("es-MX")}
                  </span>
                </Td>
                <Td align="right">
                  <span
                    className={cn(
                      "text-[12px] font-medium",
                      r.monthlyGrowth >= 0 ? "text-emerald-500" : "text-red-500"
                    )}
                  >
                    {r.monthlyGrowth >= 0 ? "+" : ""}
                    {r.monthlyGrowth}%
                  </span>
                </Td>
                <Td align="right">
                  <span className="text-[12px] text-[var(--c-text-muted)]">
                    {r.engagementRate > 0 ? `${r.engagementRate}%` : "—"}
                  </span>
                </Td>
                <Td align="right">
                  <span className="text-[12px] text-[var(--c-text-muted)]">{r.postsPublished}</span>
                </Td>
                <Td align="right">
                  <div className="flex justify-end">
                    <SparklineInline data={r.sparkline} />
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </InfoCard>
  )
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      className={cn(
        "px-5 py-3 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--c-text-muted)] border-b border-[var(--c-border)]",
        align === "right" ? "text-right" : "text-left"
      )}
    >
      {children}
    </th>
  )
}

function Td({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <td
      className={cn(
        "px-5 py-3.5 border-t border-[var(--c-border)]",
        align === "right" ? "text-right" : "text-left"
      )}
    >
      {children}
    </td>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/ui/charts/ComparisonTable.tsx
git commit -m "feat(ui/charts): add ComparisonTable with inline sparklines"
```

---

### Task 21: SyncStatusBadge

**Files:**
- Create: `apps/dashboard/components/ui/charts/SyncStatusBadge.tsx`

- [ ] **Step 1: Write file**

```tsx
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@heroui/react"
import { RefreshCw } from "lucide-react"
import { cn } from "@cerebros/lib"

interface SyncStatusBadgeProps {
  lastSync: string
}

function timeAgo(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const mins = Math.floor((now - then) / 60_000)
  if (mins < 1) return "hace segundos"
  if (mins < 60) return `hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `hace ${days}d`
}

export function SyncStatusBadge({ lastSync }: SyncStatusBadgeProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSync() {
    setLoading(true)
    try {
      await fetch("/api/analytics/sync", { method: "POST" })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="flat"
      onPress={handleSync}
      isLoading={loading}
      className="h-8 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-[12px] text-[var(--c-text-muted)]"
      startContent={
        !loading ? (
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
        ) : null
      }
    >
      Sincronizado {timeAgo(lastSync)}
    </Button>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/ui/charts/SyncStatusBadge.tsx
git commit -m "feat(ui/charts): add SyncStatusBadge with refresh action"
```

---

### Task 22: MockDataBadge

**Files:**
- Create: `apps/dashboard/components/ui/charts/MockDataBadge.tsx`

- [ ] **Step 1: Write file**

```tsx
import { Tooltip } from "@heroui/react"
import { AlertCircle } from "lucide-react"

interface MockDataBadgeProps {
  fields?: string[]
}

export function MockDataBadge({ fields }: MockDataBadgeProps) {
  const content = fields && fields.length > 0
    ? `Datos demo en: ${fields.join(", ")}. Conecta la API real para ver datos verdaderos.`
    : "Datos demo. Conecta la API real para ver datos verdaderos."

  return (
    <Tooltip content={content} placement="bottom">
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[10px] font-medium text-amber-600 dark:text-amber-400">
        <AlertCircle className="h-3 w-3" />
        Demo data
      </span>
    </Tooltip>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/ui/charts/MockDataBadge.tsx
git commit -m "feat(ui/charts): add MockDataBadge with field list tooltip"
```

---

## PHASE 3 — Panels

### Task 23: AnalyticsHeaderActions

**Files:**
- Create: `apps/dashboard/components/analytics/AnalyticsHeaderActions.tsx`

- [ ] **Step 1: Write file**

```tsx
import { PeriodSelector } from "@/components/ui/charts/PeriodSelector"
import { SyncStatusBadge } from "@/components/ui/charts/SyncStatusBadge"

interface AnalyticsHeaderActionsProps {
  lastSync: string
}

export function AnalyticsHeaderActions({ lastSync }: AnalyticsHeaderActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <SyncStatusBadge lastSync={lastSync} />
      <PeriodSelector />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/analytics/AnalyticsHeaderActions.tsx
git commit -m "feat(analytics): add header actions (sync + period)"
```

---

### Task 24: AnalyticsTabsClient

**Files:**
- Create: `apps/dashboard/components/analytics/AnalyticsTabsClient.tsx`

- [ ] **Step 1: Write file**

```tsx
"use client"
import { Tabs, Tab } from "@heroui/react"

interface AnalyticsTabsClientProps {
  overview: React.ReactNode
  instagram: React.ReactNode
  youtube: React.ReactNode
  tiktok: React.ReactNode
  blog: React.ReactNode
}

export function AnalyticsTabsClient({
  overview,
  instagram,
  youtube,
  tiktok,
  blog,
}: AnalyticsTabsClientProps) {
  return (
    <Tabs
      aria-label="Analytics sections"
      variant="underlined"
      classNames={{
        tabList: "border-b border-[var(--c-border)] gap-6 w-full",
        cursor: "bg-[var(--c-invert)]",
        tab: "px-0 h-10 data-[selected=true]:text-[var(--c-text)] text-[var(--c-text-muted)]",
      }}
    >
      <Tab key="overview" title="Overview">
        <div className="pt-6">{overview}</div>
      </Tab>
      <Tab key="instagram" title="Instagram">
        <div className="pt-6">{instagram}</div>
      </Tab>
      <Tab key="youtube" title="YouTube">
        <div className="pt-6">{youtube}</div>
      </Tab>
      <Tab key="tiktok" title="TikTok">
        <div className="pt-6">{tiktok}</div>
      </Tab>
      <Tab key="blog" title="Blog">
        <div className="pt-6">{blog}</div>
      </Tab>
    </Tabs>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/analytics/AnalyticsTabsClient.tsx
git commit -m "feat(analytics): add tabs shell with 5 tabs"
```

---

### Task 25: OverviewPanel

**Files:**
- Create: `apps/dashboard/components/analytics/OverviewPanel.tsx`

- [ ] **Step 1: Write file**

```tsx
import { Users, TrendingUp, Eye, Star } from "lucide-react"
import { StatCard } from "@/components/ui/StatCard"
import { LineChartCard } from "@/components/ui/charts/LineChartCard"
import { DonutChartCard } from "@/components/ui/charts/DonutChartCard"
import { ComparisonTable } from "@/components/ui/charts/ComparisonTable"
import type { AnalyticsSummary } from "@/lib/analytics/types"

interface OverviewPanelProps {
  data: AnalyticsSummary
}

export function OverviewPanel({ data }: OverviewPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Audiencia total"
          value={data.totalAudience}
          icon={<Users className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />}
        />
        <StatCard
          label="Engagement promedio"
          value={`${data.avgEngagementRate}%`}
          icon={<TrendingUp className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />}
          animate={false}
        />
        <StatCard
          label="Alcance acumulado"
          value={data.totalReach}
          icon={<Eye className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />}
        />
        <StatCard
          label="Top post"
          value={data.topPost?.metric ?? "—"}
          sublabel={data.topPost?.title}
          icon={<Star className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />}
          animate={false}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LineChartCard
          title="Audiencia por plataforma"
          data={data.audienceSeries}
          lines={[
            { key: "instagram", label: "Instagram", color: "#E1306C" },
            { key: "youtube", label: "YouTube", color: "#FF0000" },
            { key: "tiktok", label: "TikTok", color: "#000000" },
            { key: "newsletter", label: "Newsletter", color: "#10b981" },
          ]}
          height={260}
        />
        <DonutChartCard
          title="Distribución de audiencia"
          data={data.audienceByPlatform.map((p) => ({
            label: p.label,
            value: p.count,
            color:
              p.platform === "instagram" ? "#E1306C"
              : p.platform === "youtube" ? "#FF0000"
              : p.platform === "tiktok" ? "#000000"
              : "#10b981",
          }))}
          height={260}
        />
      </div>

      <ComparisonTable title="Comparativa por plataforma" rows={data.platformsComparison} />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/analytics/OverviewPanel.tsx
git commit -m "feat(analytics): add OverviewPanel (hero stats + charts + comparison)"
```

---

### Task 26: InstagramPanel

**Files:**
- Create: `apps/dashboard/components/analytics/InstagramPanel.tsx`

- [ ] **Step 1: Write file**

```tsx
import {
  Users,
  Image as ImageIcon,
  Eye,
  Zap,
  UserCheck,
  ExternalLink,
  Heart,
  MessageCircle,
} from "lucide-react"
import { StatCard } from "@/components/ui/StatCard"
import { InfoCard } from "@/components/ui/InfoCard"
import { LineChartCard } from "@/components/ui/charts/LineChartCard"
import { BarChartCard } from "@/components/ui/charts/BarChartCard"
import { DonutChartCard } from "@/components/ui/charts/DonutChartCard"
import { GeoBar } from "@/components/ui/charts/GeoBar"
import { HeatmapCard } from "@/components/ui/charts/HeatmapCard"
import { PostGridCard } from "@/components/ui/charts/PostGridCard"
import { MockDataBadge } from "@/components/ui/charts/MockDataBadge"
import type { InstagramAnalytics } from "@/lib/analytics/types"

interface InstagramPanelProps {
  data: InstagramAnalytics
}

export function InstagramPanel({ data }: InstagramPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      {data.mockFields.length > 0 && (
        <div>
          <MockDataBadge fields={data.mockFields} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Seguidores" value={data.followers} icon={<Users className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
        <StatCard label="Posts publicados" value={data.postsCount} icon={<ImageIcon className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
        <StatCard label="Alcance 30d" value={data.reach30d} icon={<Eye className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
        <StatCard label="Impressions 30d" value={data.impressions30d} icon={<Zap className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Profile visits" value={data.profileVisits30d} icon={<UserCheck className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
        <StatCard label="Website clicks" value={data.websiteClicks30d} icon={<ExternalLink className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
        <StatCard
          label="Engagement rate"
          value={`${data.engagementRate}%`}
          sublabel="promedio por post"
          icon={<Heart className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />}
          animate={false}
        />
      </div>

      <LineChartCard
        title="Seguidores"
        data={data.followersSeries.map((p) => ({ date: p.date, value: p.value }))}
        lines={[{ key: "value", label: "Seguidores", color: "#E1306C" }]}
        height={280}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BarChartCard
          title="Demografía por edad"
          data={data.demographics.age.map((a) => ({ label: a.bucket, value: a.percent }))}
          color="#E1306C"
        />
        <DonutChartCard
          title="Género"
          data={data.demographics.gender.map((g) => ({ label: g.label, value: g.percent }))}
        />
      </div>

      <GeoBar title="Top ciudades" items={data.topCities} />

      <HeatmapCard
        title="Mejores horas para publicar"
        description="Día de la semana × hora del día. Más oscuro = mejor desempeño histórico."
        data={data.bestPostingHours}
      />

      <InfoCard title="Performance de Stories">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--c-text-subtle)]">Avg views</p>
            <p className="mt-1 text-xl font-semibold text-[var(--c-text)]">
              {data.storiesPerformance.avgViews.toLocaleString("es-MX")}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--c-text-subtle)]">Completion rate</p>
            <p className="mt-1 text-xl font-semibold text-[var(--c-text)]">
              {data.storiesPerformance.completionRate}%
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--c-text-subtle)]">Replies</p>
            <p className="mt-1 text-xl font-semibold text-[var(--c-text)]">
              {data.storiesPerformance.replies}
            </p>
          </div>
        </div>
      </InfoCard>

      <PostGridCard
        title="Top posts"
        aspectRatio="square"
        columns={3}
        posts={data.topPosts.map((p) => ({
          id: p.id,
          thumbnail: p.thumbnail,
          caption: p.caption,
          href: p.permalink,
          stats: [
            { icon: <Heart className="h-3 w-3" />, value: p.likes },
            { icon: <MessageCircle className="h-3 w-3" />, value: p.comments },
            { icon: <Eye className="h-3 w-3" />, value: p.reach },
          ],
        }))}
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/analytics/InstagramPanel.tsx
git commit -m "feat(analytics): add InstagramPanel with full layout"
```

---

### Task 27: YouTubePanel

**Files:**
- Create: `apps/dashboard/components/analytics/YouTubePanel.tsx`

- [ ] **Step 1: Write file**

```tsx
import { Users, Eye, Video, Clock, Play, Heart, MessageCircle } from "lucide-react"
import { StatCard } from "@/components/ui/StatCard"
import { InfoCard } from "@/components/ui/InfoCard"
import { LineChartCard } from "@/components/ui/charts/LineChartCard"
import { DonutChartCard } from "@/components/ui/charts/DonutChartCard"
import { GeoBar } from "@/components/ui/charts/GeoBar"
import { PostGridCard } from "@/components/ui/charts/PostGridCard"
import { MockDataBadge } from "@/components/ui/charts/MockDataBadge"
import type { YouTubeAnalytics } from "@/lib/analytics/types"

interface YouTubePanelProps {
  data: YouTubeAnalytics
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function YouTubePanel({ data }: YouTubePanelProps) {
  return (
    <div className="flex flex-col gap-6">
      {data.mockFields.length > 0 && (
        <div>
          <MockDataBadge fields={data.mockFields} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Subscribers" value={data.subscribers} icon={<Users className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
        <StatCard label="Vistas totales" value={data.totalViews} icon={<Eye className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
        <StatCard label="Videos" value={data.videosCount} icon={<Video className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
        <StatCard
          label="Avg view duration"
          value={formatDuration(data.avgViewDuration)}
          icon={<Clock className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />}
          animate={false}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LineChartCard
          title="Vistas"
          data={data.viewsSeries.map((p) => ({ date: p.date, value: p.value }))}
          lines={[{ key: "value", label: "Vistas", color: "#FF0000" }]}
          height={240}
        />
        <LineChartCard
          title="Suscriptores ganados"
          data={data.subsGainedSeries.map((p) => ({ date: p.date, value: p.value }))}
          lines={[{ key: "value", label: "Subs", color: "#10b981" }]}
          height={240}
        />
      </div>

      <InfoCard title="Retención promedio">
        <div className="flex items-end gap-6">
          <p className="text-[48px] font-semibold leading-none tracking-[-0.04em] text-[var(--c-text)]">
            {data.retentionAvg}%
          </p>
          <p className="pb-2 text-[13px] text-[var(--c-text-muted)]">
            de duración promedio vista por los espectadores
          </p>
        </div>
      </InfoCard>

      <PostGridCard
        title="Top 5 videos"
        aspectRatio="video"
        columns={3}
        posts={data.topVideos.map((v) => ({
          id: v.id,
          thumbnail: v.thumbnail,
          title: v.title,
          href: `https://www.youtube.com/watch?v=${v.id}`,
          stats: [
            { icon: <Play className="h-3 w-3" />, value: v.views },
            { icon: <Heart className="h-3 w-3" />, value: v.likes },
            { icon: <MessageCircle className="h-3 w-3" />, value: v.comments },
          ],
        }))}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DonutChartCard
          title="Tráfico por fuente"
          data={data.trafficSources.map((s) => ({ label: s.source, value: s.percent }))}
        />
        <GeoBar
          title="Top países"
          items={data.topCountries.map((c) => ({ name: c.name, percent: c.percent }))}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/analytics/YouTubePanel.tsx
git commit -m "feat(analytics): add YouTubePanel with real data + mock extras"
```

---

### Task 28: TikTokPanel

**Files:**
- Create: `apps/dashboard/components/analytics/TikTokPanel.tsx`

- [ ] **Step 1: Write file**

```tsx
import { Users, Video, Heart, Share2, Play, MessageCircle } from "lucide-react"
import { StatCard } from "@/components/ui/StatCard"
import { InfoCard } from "@/components/ui/InfoCard"
import { LineChartCard } from "@/components/ui/charts/LineChartCard"
import { HeatmapCard } from "@/components/ui/charts/HeatmapCard"
import { PostGridCard } from "@/components/ui/charts/PostGridCard"
import { MockDataBadge } from "@/components/ui/charts/MockDataBadge"
import { Chip } from "@heroui/react"
import type { TikTokAnalytics } from "@/lib/analytics/types"

interface TikTokPanelProps {
  data: TikTokAnalytics
}

export function TikTokPanel({ data }: TikTokPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <MockDataBadge />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Followers" value={data.followers} icon={<Users className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
        <StatCard label="Videos" value={data.videosCount} icon={<Video className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
        <StatCard label="Likes totales" value={data.totalLikes} icon={<Heart className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
        <StatCard label="Shares" value={data.totalShares} icon={<Share2 className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
      </div>

      <LineChartCard
        title="Followers"
        data={data.followersSeries.map((p) => ({ date: p.date, value: p.value }))}
        lines={[{ key: "value", label: "Followers", color: "#000000" }]}
        height={240}
      />

      <PostGridCard
        title="Top videos"
        aspectRatio="portrait"
        columns={3}
        posts={data.topVideos.map((v) => ({
          id: v.id,
          thumbnail: v.thumbnail,
          title: v.title,
          stats: [
            { icon: <Play className="h-3 w-3" />, value: v.views },
            { icon: <Heart className="h-3 w-3" />, value: v.likes },
            { icon: <Share2 className="h-3 w-3" />, value: v.shares },
            { icon: <MessageCircle className="h-3 w-3" />, value: v.comments },
          ],
        }))}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <InfoCard title="Hashtags populares">
          <div className="flex flex-wrap gap-2">
            {data.topHashtags.map((h) => (
              <Chip
                key={h.tag}
                size="sm"
                variant="flat"
                classNames={{
                  base: "bg-[var(--c-surface-2)] border border-[var(--c-border)]",
                  content: "text-[12px] text-[var(--c-text)]",
                }}
              >
                #{h.tag} · {h.uses}
              </Chip>
            ))}
          </div>
        </InfoCard>
        <HeatmapCard
          title="Mejores horas"
          data={data.bestPostingHours}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/analytics/TikTokPanel.tsx
git commit -m "feat(analytics): add TikTokPanel with full mock data"
```

---

### Task 29: BlogPanel

**Files:**
- Create: `apps/dashboard/components/analytics/BlogPanel.tsx`

- [ ] **Step 1: Write file**

```tsx
import { Heart, BookOpen, TrendingUp } from "lucide-react"
import { StatCard } from "@/components/ui/StatCard"
import { InfoCard } from "@/components/ui/InfoCard"
import { LineChartCard } from "@/components/ui/charts/LineChartCard"
import type { BlogAnalytics } from "@/lib/analytics/types"

interface BlogPanelProps {
  data: BlogAnalytics
}

export function BlogPanel({ data }: BlogPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Likes totales" value={data.totalLikes} icon={<Heart className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
        <StatCard label="Posts publicados" value={data.totalPosts} icon={<BookOpen className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
        <StatCard label="Avg likes por post" value={data.avgLikesPerPost} icon={<TrendingUp className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
      </div>

      <LineChartCard
        title="Likes por día"
        data={data.likesSeries.map((p) => ({ date: p.date, value: p.value }))}
        lines={[{ key: "value", label: "Likes", color: "#10b981" }]}
        height={240}
      />

      <InfoCard title="Posts más populares" padded={false}>
        <ul>
          {data.topPosts.map((p, i) => (
            <li
              key={p.slug}
              className={`flex items-center justify-between px-5 py-3 ${i > 0 ? "border-t border-[var(--c-border)]" : ""}`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="w-5 text-[11px] text-[var(--c-text-faint)]">{i + 1}</span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-[var(--c-text)]">{p.title}</p>
                  <p className="truncate text-[11px] text-[var(--c-text-muted)]">/blog/{p.slug}</p>
                </div>
              </div>
              <span className="shrink-0 text-[13px] font-medium text-[var(--c-text-muted)]">
                {p.likes} ❤️
              </span>
            </li>
          ))}
        </ul>
      </InfoCard>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/analytics/BlogPanel.tsx
git commit -m "feat(analytics): add BlogPanel with real Supabase data"
```

---

## PHASE 4 — Page + API route

### Task 30: Sync API route

**Files:**
- Create: `apps/dashboard/app/api/analytics/sync/route.ts`

- [ ] **Step 1: Write file**

```ts
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST() {
  // Invalidate analytics route cache to force fresh fetches next render.
  revalidatePath("/analytics")
  return NextResponse.json({ syncedAt: new Date().toISOString() })
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/app/api/analytics/sync/route.ts
git commit -m "feat(analytics): add POST /api/analytics/sync endpoint"
```

---

### Task 31: Rewrite Analytics page

**Files:**
- Modify: `apps/dashboard/app/(dashboard)/analytics/page.tsx`
- Delete: `apps/dashboard/app/(dashboard)/analytics/AnalyticsTabsClient.tsx` (old version at this path)

- [ ] **Step 1: Delete old AnalyticsTabsClient.tsx**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Landing"
rm apps/dashboard/app/\(dashboard\)/analytics/AnalyticsTabsClient.tsx
```

- [ ] **Step 2: Replace page.tsx with new version**

```tsx
// apps/dashboard/app/(dashboard)/analytics/page.tsx
import { PageHeader } from "@/components/ui/PageHeader"
import { FadeIn } from "@/components/ui/effects/FadeIn"
import { parsePeriod } from "@/lib/analytics/period"
import { analyticsAdapter } from "@/lib/analytics/adapter"
import { AnalyticsTabsClient } from "@/components/analytics/AnalyticsTabsClient"
import { AnalyticsHeaderActions } from "@/components/analytics/AnalyticsHeaderActions"
import { OverviewPanel } from "@/components/analytics/OverviewPanel"
import { InstagramPanel } from "@/components/analytics/InstagramPanel"
import { YouTubePanel } from "@/components/analytics/YouTubePanel"
import { TikTokPanel } from "@/components/analytics/TikTokPanel"
import { BlogPanel } from "@/components/analytics/BlogPanel"

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const { period: periodParam } = await searchParams
  const period = parsePeriod(periodParam)

  const [summary, ig, yt, tt, blog] = await Promise.all([
    analyticsAdapter.getSummary(period),
    analyticsAdapter.getInstagram(period),
    analyticsAdapter.getYouTube(period),
    analyticsAdapter.getTikTok(period),
    analyticsAdapter.getBlog(period),
  ])

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Métricas de redes sociales y blog"
        actions={<AnalyticsHeaderActions lastSync={summary.lastSync} />}
      />
      <div className="flex flex-col gap-6 p-8">
        <FadeIn>
          <AnalyticsTabsClient
            overview={<OverviewPanel data={summary} />}
            instagram={<InstagramPanel data={ig} />}
            youtube={<YouTubePanel data={yt} />}
            tiktok={<TikTokPanel data={tt} />}
            blog={<BlogPanel data={blog} />}
          />
        </FadeIn>
      </div>
    </>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add "apps/dashboard/app/(dashboard)/analytics/"
git commit -m "feat(analytics): rewrite page.tsx to use adapter + panels + period selector"
```

---

### Task 32: Build verify + push

**Files:**
- No file changes — verification only

- [ ] **Step 1: Type check**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Landing/apps/dashboard"
npx tsc --noEmit 2>&1 | tail -20
```

Expected: zero errors. If errors, report verbatim and fix before proceeding.

- [ ] **Step 2: Restart dev server and verify manually**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Landing"
# Kill existing dev server (Ctrl+C in its terminal first)
npm run dev --workspace=apps/dashboard
```

Open http://localhost:3002/analytics and verify:
- 5 tabs render (Overview, Instagram, YouTube, TikTok, Blog)
- PeriodSelector dropdown works
- SyncStatusBadge button triggers refresh
- Instagram tab shows real followers count (~353K)
- YouTube tab shows real subscribers (~938)
- TikTok tab shows MockDataBadge
- Charts render without errors in console
- Dark/light mode both work

- [ ] **Step 3: Push branch**

```bash
git push origin feature/dashboard
```

If rejected due to divergence, use fresh-clone approach per previous patterns.
