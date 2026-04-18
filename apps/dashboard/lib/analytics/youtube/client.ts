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
  for (const v of videos) {
    const d = v.publishedAt.slice(0, 10)
    if (!buckets.has(d)) continue
    buckets.set(d, (buckets.get(d) ?? 0) + v.views)
  }
  return Array.from(buckets.entries()).map(([date, value]) => ({ date, value }))
}
