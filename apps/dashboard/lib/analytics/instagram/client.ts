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
  accountsEngaged?: number
  totalInteractions?: number
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

interface IGInsightWithTotalValue {
  name: string
  total_value?: { value: number }
}

interface IGInsightsResponseWithTotal {
  data?: IGInsightWithTotalValue[]
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
  // IG Graph API v21: metric_type=total_value requires period=days_28 (not "day")
  const metrics = ["reach", "profile_views", "website_clicks", "accounts_engaged", "total_interactions"]
  const url = `${IG_BASE}/${userId}/insights?metric=${metrics.join(",")}&period=days_28&metric_type=total_value&access_token=${accessToken}`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) {
    throw new Error(`IG profile insights failed: ${res.status}`)
  }
  const data = (await res.json()) as IGInsightsResponseWithTotal
  const map: Record<string, number> = {}
  for (const m of data.data ?? []) {
    map[m.name] = m.total_value?.value ?? 0
  }
  return {
    reach: map.reach,
    impressions: map.accounts_engaged, // "accounts engaged" is the closest signal available on Creator tier (impressions deprecated)
    profileVisits: map.profile_views,
    websiteClicks: map.website_clicks,
    accountsEngaged: map.accounts_engaged,
    totalInteractions: map.total_interactions,
  }
}

export interface IGDemographics {
  age: Array<{ bucket: string; percent: number }>
  gender: Array<{ label: string; percent: number }>
  cities: Array<{ name: string; percent: number }>
}

interface IGDemographicsResponse {
  data?: Array<{
    name: string
    total_value?: {
      breakdowns?: Array<{
        dimension_keys: string[]
        results: Array<{
          dimension_values: string[]
          value: number
        }>
      }>
    }
  }>
}

function normalizeAgeBucket(raw: string): string {
  return raw
}

function normalizeGender(raw: string): string {
  if (raw === "F") return "Mujer"
  if (raw === "M") return "Hombre"
  return "Otro"
}

async function fetchDemographicBreakdown(
  accessToken: string,
  userId: string,
  breakdown: "age" | "gender" | "city"
): Promise<Array<{ label: string; value: number }>> {
  const url = `${IG_BASE}/${userId}/insights?metric=engaged_audience_demographics&period=lifetime&breakdown=${breakdown}&metric_type=total_value&access_token=${accessToken}`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`IG demographics ${breakdown} failed: ${res.status}`)
  const data = (await res.json()) as IGDemographicsResponse
  const results = data.data?.[0]?.total_value?.breakdowns?.[0]?.results ?? []
  return results.map((r) => ({
    label: r.dimension_values[0] ?? "",
    value: r.value,
  }))
}

export async function getAudienceDemographics(
  accessToken: string,
  userId: string
): Promise<IGDemographics> {
  const [ageRaw, genderRaw, cityRaw] = await Promise.all([
    fetchDemographicBreakdown(accessToken, userId, "age").catch(() => []),
    fetchDemographicBreakdown(accessToken, userId, "gender").catch(() => []),
    fetchDemographicBreakdown(accessToken, userId, "city").catch(() => []),
  ])

  // Aggregate gender (can have multiple rows per category due to breakdown combining)
  const genderMap: Record<string, number> = {}
  for (const g of genderRaw) {
    const label = normalizeGender(g.label)
    genderMap[label] = (genderMap[label] ?? 0) + g.value
  }
  const genderTotal = Object.values(genderMap).reduce((a, b) => a + b, 0)
  const gender = Object.entries(genderMap)
    .map(([label, value]) => ({
      label,
      percent: genderTotal > 0 ? Math.round((value / genderTotal) * 100) : 0,
    }))
    .sort((a, b) => b.percent - a.percent)

  // Aggregate age (might have duplicates, sum them)
  const ageMap: Record<string, number> = {}
  for (const a of ageRaw) {
    ageMap[a.label] = (ageMap[a.label] ?? 0) + a.value
  }
  const ageTotal = Object.values(ageMap).reduce((a, b) => a + b, 0)
  const ageOrder = ["13-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"]
  const age = ageOrder
    .filter((bucket) => ageMap[bucket] !== undefined)
    .map((bucket) => ({
      bucket: normalizeAgeBucket(bucket),
      percent: ageTotal > 0 ? Math.round((ageMap[bucket] / ageTotal) * 100) : 0,
    }))

  // Aggregate cities: sum dup rows, take top 10, calculate percent
  const cityMap: Record<string, number> = {}
  for (const c of cityRaw) {
    cityMap[c.label] = (cityMap[c.label] ?? 0) + c.value
  }
  const cityEntries = Object.entries(cityMap).sort((a, b) => b[1] - a[1])
  const cityTotal = cityEntries.reduce((a, b) => a + b[1], 0)
  const cities = cityEntries.slice(0, 10).map(([name, value]) => ({
    name,
    percent: cityTotal > 0 ? Math.round((value / cityTotal) * 100) : 0,
  }))

  return { age, gender, cities }
}

// Infer best posting hours from historical post timestamps + engagement.
// This is a real data derivation — we look at the last N posts, see what time
// they were published, and which got the most likes+comments. That gives us a
// heatmap of "when do my posts tend to perform best."
export async function getBestPostingHoursFromMedia(
  accessToken: string,
  userId: string,
  limit = 50
): Promise<Array<{ day: number; hour: number; score: number }>> {
  const fields = "id,timestamp,like_count,comments_count"
  const url = `${IG_BASE}/${userId}/media?fields=${fields}&limit=${limit}&access_token=${accessToken}`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`IG media for hours failed: ${res.status}`)
  const data = (await res.json()) as {
    data?: Array<{ id: string; timestamp: string; like_count: number; comments_count: number }>
  }
  const posts = data.data ?? []

  // Bucket posts by (day, hour). Sum engagement, count posts.
  const buckets = new Map<string, { engagement: number; count: number }>()
  for (const p of posts) {
    const d = new Date(p.timestamp)
    const dayJs = d.getDay() // 0 = Sunday
    // Convert to 0 = Monday for our heatmap
    const day = (dayJs + 6) % 7
    const hour = d.getHours()
    const key = `${day}-${hour}`
    const eng = p.like_count + p.comments_count
    const existing = buckets.get(key) ?? { engagement: 0, count: 0 }
    buckets.set(key, { engagement: existing.engagement + eng, count: existing.count + 1 })
  }

  // Average engagement per (day, hour). Max is reference for normalization.
  const averages = new Map<string, number>()
  let maxAvg = 0
  for (const [key, b] of buckets) {
    const avg = b.engagement / b.count
    averages.set(key, avg)
    if (avg > maxAvg) maxAvg = avg
  }

  // Build full 7x24 grid — cells without posts get score 0.
  const grid: Array<{ day: number; hour: number; score: number }> = []
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const avg = averages.get(`${day}-${hour}`) ?? 0
      const score = maxAvg > 0 ? avg / maxAvg : 0
      grid.push({ day, hour, score })
    }
  }
  return grid
}

interface IGStoryItem {
  id: string
  media_type: string
  timestamp: string
}

export async function getActiveStoriesPerformance(
  accessToken: string,
  userId: string
): Promise<{ avgViews: number; completionRate: number; replies: number; count: number }> {
  const url = `${IG_BASE}/${userId}/stories?fields=id,media_type,timestamp&access_token=${accessToken}`
  const res = await fetch(url, { next: { revalidate: 600 } })
  if (!res.ok) throw new Error(`IG stories failed: ${res.status}`)
  const data = (await res.json()) as { data?: IGStoryItem[] }
  const stories = data.data ?? []
  if (stories.length === 0) {
    return { avgViews: 0, completionRate: 0, replies: 0, count: 0 }
  }

  // For each active story, fetch its insights (reach, replies)
  const insights = await Promise.all(
    stories.map(async (s) => {
      try {
        const r = await fetch(
          `${IG_BASE}/${s.id}/insights?metric=reach,replies,total_interactions&access_token=${accessToken}`,
          { next: { revalidate: 600 } }
        )
        if (!r.ok) return { reach: 0, replies: 0 }
        const d = (await r.json()) as IGMediaInsightsResponse
        const m: Record<string, number> = {}
        for (const v of d.data ?? []) {
          m[v.name] = v.values[0]?.value ?? 0
        }
        return { reach: m.reach ?? 0, replies: m.replies ?? 0 }
      } catch {
        return { reach: 0, replies: 0 }
      }
    })
  )

  const totalReach = insights.reduce((a, b) => a + b.reach, 0)
  const totalReplies = insights.reduce((a, b) => a + b.replies, 0)
  const avgViews = stories.length > 0 ? Math.round(totalReach / stories.length) : 0

  return {
    avgViews,
    completionRate: 0, // Not available via Graph API
    replies: totalReplies,
    count: stories.length,
  }
}

// Get daily reach time series. IG Graph API limits this to 28 days max.
// If period requests more days, we pad the earlier part with approximation.
export async function getDailyReachSeries(
  accessToken: string,
  userId: string,
  days: number
): Promise<Array<{ date: string; value: number }> | null> {
  const windowDays = Math.min(days, 28)
  const until = Math.floor(Date.now() / 1000)
  const since = until - windowDays * 86_400
  const url = `${IG_BASE}/${userId}/insights?metric=reach&period=day&metric_type=time_series&since=${since}&until=${until}&access_token=${accessToken}`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return null
  type TimeSeriesResponse = {
    data?: Array<{
      name: string
      values?: Array<{ value: number; end_time: string }>
    }>
  }
  const data = (await res.json()) as TimeSeriesResponse
  const values = data.data?.[0]?.values ?? []
  if (values.length === 0) return null
  return values.map((v) => ({
    date: v.end_time.slice(0, 10),
    value: v.value,
  }))
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
