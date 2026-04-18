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
  const metrics = ["reach", "impressions", "profile_views", "website_clicks"]
  const url = `${IG_BASE}/${userId}/insights?metric=${metrics.join(",")}&period=day&metric_type=total_value&access_token=${accessToken}`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) {
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
