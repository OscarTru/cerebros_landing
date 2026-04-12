import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { XMLParser } from "fast-xml-parser"

const OUTPUT = resolve(process.cwd(), "public/data/content.json")
const YT_CHANNEL_ID = "UC_0iMtxeDkSRB3KjVKsonUA"
const YT_RSS = `https://www.youtube.com/feeds/videos.xml?channel_id=${YT_CHANNEL_ID}`

const IG_TOKEN = process.env.IG_ACCESS_TOKEN

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

interface IgStats {
  username: string
  name: string | null
  profilePictureUrl: string | null
  followersCount: number
  mediaCount: number
  reach30d: number | null
  profileViews30d: number | null
  accountsEngaged30d: number | null
  reelsSampled: number
  avgViewsPerReel: number | null
  avgLikesPerReel: number | null
  avgCommentsPerReel: number | null
  avgEngagementRate: number | null
  avgEngagementRateByViews: number | null
  totalReelViews: number
  totalReelLikes: number
  totalReelComments: number
  totalReelShares: number
  totalReelSaves: number
  topReels: Array<{
    id: string
    permalink: string
    thumbnailUrl: string | null
    caption: string
    views: number | null
    likes: number | null
    comments: number | null
    shares: number | null
    saved: number | null
  }>
}

interface ContentCache {
  latestVideo: LatestVideo | null
  instagramPosts: IgPost[]
  instagramStats: IgStats | null
  fetchedAt: string | null
}

function readCache(): ContentCache {
  const empty: ContentCache = {
    latestVideo: null,
    instagramPosts: [],
    instagramStats: null,
    fetchedAt: null,
  }
  if (!existsSync(OUTPUT)) return empty
  try {
    const parsed = JSON.parse(readFileSync(OUTPUT, "utf8")) as Partial<ContentCache>
    return { ...empty, ...parsed }
  } catch {
    return empty
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
  console.log("→ Fetching Instagram API (graph.instagram.com)…")
  if (!IG_TOKEN) {
    throw new Error("Missing IG_ACCESS_TOKEN env var")
  }
  const fields =
    "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp"
  const url = `https://graph.instagram.com/v21.0/me/media?fields=${fields}&limit=3&access_token=${IG_TOKEN}`
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`IG API ${res.status}: ${body.slice(0, 200)}`)
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

async function fetchInstagramStats(): Promise<IgStats> {
  console.log("→ Fetching Instagram account + insights…")
  if (!IG_TOKEN) throw new Error("Missing IG_ACCESS_TOKEN env var")
  const base = "https://graph.instagram.com/v21.0"

  // 1. Account profile
  const profRes = await fetch(
    `${base}/me?fields=username,name,profile_picture_url,followers_count,media_count&access_token=${IG_TOKEN}`
  )
  if (!profRes.ok) {
    const body = await profRes.text()
    throw new Error(`IG profile ${profRes.status}: ${body.slice(0, 200)}`)
  }
  const prof = (await profRes.json()) as {
    username: string
    name?: string
    profile_picture_url?: string
    followers_count: number
    media_count: number
  }

  // 2. 30-day account insights (best-effort)
  const since = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60
  const until = Math.floor(Date.now() / 1000)
  let reach30d: number | null = null
  let profileViews30d: number | null = null
  let accountsEngaged30d: number | null = null
  try {
    const metrics = "reach,profile_views,accounts_engaged"
    const insRes = await fetch(
      `${base}/me/insights?metric=${metrics}&period=day&metric_type=total_value&since=${since}&until=${until}&access_token=${IG_TOKEN}`
    )
    if (insRes.ok) {
      const ins = (await insRes.json()) as {
        data?: Array<{ name: string; total_value?: { value: number } }>
      }
      for (const m of ins.data ?? []) {
        const v = m.total_value?.value ?? null
        if (m.name === "reach") reach30d = v
        if (m.name === "profile_views") profileViews30d = v
        if (m.name === "accounts_engaged") accountsEngaged30d = v
      }
    } else {
      console.warn(`  ⚠ account insights ${insRes.status} — skipping`)
    }
  } catch (e) {
    console.warn(`  ⚠ account insights failed: ${(e as Error).message}`)
  }

  // 3. Recent reels — fetch last 50 media items, filter reels, compute metrics
  const mediaRes = await fetch(
    `${base}/me/media?fields=id,caption,media_type,media_product_type,permalink,thumbnail_url,media_url&limit=50&access_token=${IG_TOKEN}`
  )
  if (!mediaRes.ok) {
    const body = await mediaRes.text()
    throw new Error(`IG media ${mediaRes.status}: ${body.slice(0, 200)}`)
  }
  const mediaJson = (await mediaRes.json()) as {
    data?: Array<{
      id: string
      caption?: string
      media_type: string
      media_product_type?: string
      permalink: string
      thumbnail_url?: string
      media_url: string
    }>
  }
  const reels = (mediaJson.data ?? []).filter(
    (m) => m.media_type === "VIDEO" || m.media_product_type === "REELS"
  )

  const withInsights = await Promise.all(
    reels.slice(0, 24).map(async (r) => {
      try {
        const res = await fetch(
          `${base}/${r.id}/insights?metric=views,likes,comments,shares,saved&access_token=${IG_TOKEN}`
        )
        if (!res.ok) return { r, metrics: {} as Record<string, number> }
        const j = (await res.json()) as {
          data?: Array<{ name: string; values?: Array<{ value: number }> }>
        }
        const metrics: Record<string, number> = {}
        for (const m of j.data ?? []) {
          metrics[m.name] = m.values?.[0]?.value ?? 0
        }
        return { r, metrics }
      } catch {
        return { r, metrics: {} as Record<string, number> }
      }
    })
  )

  const mapReel = ({
    r,
    metrics,
  }: (typeof withInsights)[number]) => ({
    id: r.id,
    permalink: r.permalink,
    thumbnailUrl: r.thumbnail_url ?? r.media_url ?? null,
    caption: r.caption ?? "",
    views: metrics.views ?? null,
    likes: metrics.likes ?? null,
    comments: metrics.comments ?? null,
    shares: metrics.shares ?? null,
    saved: metrics.saved ?? null,
  })

  const topReels = [...withInsights]
    .sort((a, b) => (b.metrics.views ?? 0) - (a.metrics.views ?? 0))
    .slice(0, 3)
    .map(mapReel)

  // Aggregates across ALL fetched reels (classical engagement rate)
  const reelsSampled = withInsights.length
  const sumViews = withInsights.reduce((a, { metrics }) => a + (metrics.views ?? 0), 0)
  const sumLikes = withInsights.reduce((a, { metrics }) => a + (metrics.likes ?? 0), 0)
  const sumComments = withInsights.reduce(
    (a, { metrics }) => a + (metrics.comments ?? 0),
    0
  )
  const sumShares = withInsights.reduce(
    (a, { metrics }) => a + (metrics.shares ?? 0),
    0
  )
  const sumSaved = withInsights.reduce(
    (a, { metrics }) => a + (metrics.saved ?? 0),
    0
  )
  const avgViewsPerReel = reelsSampled > 0 ? Math.round(sumViews / reelsSampled) : null
  const avgLikesPerReel = reelsSampled > 0 ? Math.round(sumLikes / reelsSampled) : null
  const avgCommentsPerReel =
    reelsSampled > 0 ? Math.round(sumComments / reelsSampled) : null
  // Classical engagement rate = avg(likes+comments per post) / followers * 100
  const avgEngagementRate =
    reelsSampled > 0 && prof.followers_count > 0
      ? ((sumLikes + sumComments) / reelsSampled / prof.followers_count) * 100
      : null
  // Engagement rate by views (Beacons-style) = (likes+comments+shares+saves) / views, avg per reel
  const perReelErByViews = withInsights
    .map(({ metrics }) => {
      const v = metrics.views ?? 0
      if (v === 0) return null
      const interactions =
        (metrics.likes ?? 0) +
        (metrics.comments ?? 0) +
        (metrics.shares ?? 0) +
        (metrics.saved ?? 0)
      return (interactions / v) * 100
    })
    .filter((x): x is number => x != null)
  const avgEngagementRateByViews =
    perReelErByViews.length > 0
      ? perReelErByViews.reduce((a, b) => a + b, 0) / perReelErByViews.length
      : null

  return {
    username: prof.username,
    name: prof.name ?? null,
    profilePictureUrl: prof.profile_picture_url ?? null,
    followersCount: prof.followers_count,
    mediaCount: prof.media_count,
    reach30d,
    profileViews30d,
    accountsEngaged30d,
    reelsSampled,
    avgViewsPerReel,
    avgLikesPerReel,
    avgCommentsPerReel,
    avgEngagementRate,
    avgEngagementRateByViews,
    totalReelViews: sumViews,
    totalReelLikes: sumLikes,
    totalReelComments: sumComments,
    totalReelShares: sumShares,
    totalReelSaves: sumSaved,
    topReels,
  }
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

  try {
    next.instagramStats = await fetchInstagramStats()
    console.log(
      `  ✓ IG stats: ${next.instagramStats.followersCount} followers, ${next.instagramStats.topReels.length} top reels`
    )
  } catch (err) {
    console.warn(`  ⚠ IG stats failed, keeping cache: ${(err as Error).message}`)
    next.instagramStats = cache.instagramStats
  }

  mkdirSync(dirname(OUTPUT), { recursive: true })
  writeFileSync(OUTPUT, JSON.stringify(next, null, 2) + "\n", "utf8")
  console.log(`✓ Wrote ${OUTPUT}`)
}

main().catch((err) => {
  console.error("fetch-content failed:", err)
  process.exit(1)
})
