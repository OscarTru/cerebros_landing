import { getValidAccessToken } from "./oauth"

const YT_ANALYTICS_BASE = "https://youtubeanalytics.googleapis.com/v2"

interface YTAnalyticsReport {
  columnHeaders?: Array<{ name: string; columnType: string; dataType: string }>
  rows?: Array<Array<string | number>>
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

async function fetchAnalyticsReport(
  params: Record<string, string>
): Promise<YTAnalyticsReport | null> {
  const accessToken = await getValidAccessToken()
  if (!accessToken) return null

  const url = `${YT_ANALYTICS_BASE}/reports?${new URLSearchParams(params).toString()}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 1800 },
  })
  if (!res.ok) {
    const body = await res.text()
    console.warn("[yt-analytics] report failed:", res.status, body.slice(0, 200))
    return null
  }
  return (await res.json()) as YTAnalyticsReport
}

export interface YTAnalyticsData {
  avgViewDuration: number | null      // seconds
  avgViewPercentage: number | null    // 0-100 (retention)
  totalWatchMinutes: number | null
  subsGainedSeries: Array<{ date: string; value: number }> | null
  viewsSeries: Array<{ date: string; value: number }> | null
  trafficSources: Array<{ source: string; percent: number }> | null
  topCountries: Array<{ code: string; name: string; percent: number }> | null
  topVideosCtr: Map<string, number> | null  // videoId → ctr
}

const COUNTRY_NAMES: Record<string, string> = {
  MX: "México", ES: "España", AR: "Argentina", CO: "Colombia",
  US: "Estados Unidos", CL: "Chile", PE: "Perú", VE: "Venezuela",
  EC: "Ecuador", UY: "Uruguay", BO: "Bolivia", PY: "Paraguay",
  GT: "Guatemala", CR: "Costa Rica", DO: "República Dominicana",
  CU: "Cuba", PR: "Puerto Rico", HN: "Honduras", SV: "El Salvador",
  NI: "Nicaragua", PA: "Panamá",
}

const TRAFFIC_SOURCE_LABELS: Record<string, string> = {
  YT_SEARCH: "YouTube search",
  SUGGESTED_VIDEO: "Suggested videos",
  BROWSE: "Browse features",
  EXTERNAL: "External",
  PLAYLIST: "Playlists",
  YT_CHANNEL: "Channel page",
  YT_OTHER_PAGE: "Other YouTube",
  NOTIFICATION: "Notifications",
  DIRECT_OR_UNKNOWN: "Direct / Unknown",
  END_SCREEN: "End screens",
  SHORTS: "Shorts",
  RELATED_VIDEO: "Related",
  NO_LINK_EMBEDDED: "Embedded",
  NO_LINK_OTHER: "Other",
}

/**
 * Fetch all YT Analytics data for the given period.
 * Returns null for individual fields if unavailable.
 */
export async function getYouTubeAnalyticsData(days: number): Promise<YTAnalyticsData> {
  const endDate = formatDate(new Date())
  const startDate = formatDate(new Date(Date.now() - days * 86_400_000))

  // 1. Total channel metrics (aggregate)
  const aggregatePromise = fetchAnalyticsReport({
    ids: "channel==MINE",
    startDate,
    endDate,
    metrics: "views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage",
  })

  // 2. Subs gained + views time series (daily)
  const timeSeriesPromise = fetchAnalyticsReport({
    ids: "channel==MINE",
    startDate,
    endDate,
    metrics: "views,subscribersGained",
    dimensions: "day",
    sort: "day",
  })

  // 3. Traffic sources
  const trafficPromise = fetchAnalyticsReport({
    ids: "channel==MINE",
    startDate,
    endDate,
    metrics: "views",
    dimensions: "insightTrafficSourceType",
    sort: "-views",
  })

  // 4. Top countries
  const countriesPromise = fetchAnalyticsReport({
    ids: "channel==MINE",
    startDate,
    endDate,
    metrics: "views",
    dimensions: "country",
    sort: "-views",
    maxResults: "10",
  })

  // 5. CTR per video (requires video dimension)
  const ctrPromise = fetchAnalyticsReport({
    ids: "channel==MINE",
    startDate,
    endDate,
    metrics: "cardImpressions,cardClickRate",
    dimensions: "video",
    sort: "-cardImpressions",
    maxResults: "10",
  })

  const [aggregate, ts, traffic, countries, ctr] = await Promise.all([
    aggregatePromise,
    timeSeriesPromise,
    trafficPromise,
    countriesPromise,
    ctrPromise,
  ])

  // Parse aggregate
  let avgViewDuration: number | null = null
  let avgViewPercentage: number | null = null
  let totalWatchMinutes: number | null = null
  if (aggregate?.rows?.[0]) {
    const row = aggregate.rows[0]
    // Order matches metrics query: views, estimatedMinutesWatched, averageViewDuration, averageViewPercentage
    totalWatchMinutes = Number(row[1] ?? 0)
    avgViewDuration = Number(row[2] ?? 0)
    avgViewPercentage = Number(row[3] ?? 0)
  }

  // Parse time series
  let subsGainedSeries: Array<{ date: string; value: number }> | null = null
  let viewsSeries: Array<{ date: string; value: number }> | null = null
  if (ts?.rows && ts.rows.length > 0) {
    viewsSeries = ts.rows.map((r) => ({
      date: String(r[0]),
      value: Number(r[1] ?? 0),
    }))
    subsGainedSeries = ts.rows.map((r) => ({
      date: String(r[0]),
      value: Number(r[2] ?? 0),
    }))
  }

  // Parse traffic sources
  let trafficSources: Array<{ source: string; percent: number }> | null = null
  if (traffic?.rows && traffic.rows.length > 0) {
    const total = traffic.rows.reduce((acc, r) => acc + Number(r[1] ?? 0), 0)
    if (total > 0) {
      trafficSources = traffic.rows.slice(0, 6).map((r) => {
        const key = String(r[0])
        return {
          source: TRAFFIC_SOURCE_LABELS[key] ?? key,
          percent: Math.round((Number(r[1] ?? 0) / total) * 100),
        }
      })
    }
  }

  // Parse top countries
  let topCountries: Array<{ code: string; name: string; percent: number }> | null = null
  if (countries?.rows && countries.rows.length > 0) {
    const total = countries.rows.reduce((acc, r) => acc + Number(r[1] ?? 0), 0)
    if (total > 0) {
      topCountries = countries.rows.slice(0, 7).map((r) => {
        const code = String(r[0])
        return {
          code,
          name: COUNTRY_NAMES[code] ?? code,
          percent: Math.round((Number(r[1] ?? 0) / total) * 100),
        }
      })
    }
  }

  // Parse CTR per video
  let topVideosCtr: Map<string, number> | null = null
  if (ctr?.rows && ctr.rows.length > 0) {
    topVideosCtr = new Map()
    for (const r of ctr.rows) {
      const videoId = String(r[0])
      const clickRate = Number(r[2] ?? 0) * 100 // API returns 0-1, we want percent
      topVideosCtr.set(videoId, Math.round(clickRate * 10) / 10)
    }
  }

  return {
    avgViewDuration,
    avgViewPercentage,
    totalWatchMinutes,
    subsGainedSeries,
    viewsSeries,
    trafficSources,
    topCountries,
    topVideosCtr,
  }
}
