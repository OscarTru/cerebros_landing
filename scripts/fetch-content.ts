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
