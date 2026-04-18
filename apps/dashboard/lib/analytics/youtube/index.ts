import { cache } from "react"
import type { YouTubeAnalytics, Period, TimeSeriesPoint } from "../types"
import {
  getChannelStats,
  getRecentVideoIds,
  getVideosBatch,
  deriveViewsSeriesFromVideos,
  type YTVideo,
} from "./client"
import { getYouTubeAnalyticsData } from "./analytics-client"
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

export const getYouTubeAnalytics = cache(async function getYouTubeAnalytics(period: Period): Promise<YouTubeAnalytics> {
  const apiKey = process.env.YOUTUBE_API_KEY
  const channelId = process.env.YOUTUBE_CHANNEL_ID

  if (!apiKey || !channelId) {
    return mockYouTubeFallback(period)
  }

  try {
    const stats = await getChannelStats(apiKey, channelId)
    const videoIds = await getRecentVideoIds(apiKey, stats.uploadsPlaylistId, 25)
    const videos = await getVideosBatch(apiKey, videoIds)

    // Try YouTube Analytics API (OAuth). Returns null if not connected.
    const analytics = await getYouTubeAnalyticsData(periodToDays(period)).catch(() => null)

    const mockFields: string[] = []

    // Top videos with CTR from analytics if available
    const topVideos = videos
      .slice()
      .sort((a: YTVideo, b: YTVideo) => b.views - a.views)
      .slice(0, 5)
      .map((v) => {
        const realCtr = analytics?.topVideosCtr?.get(v.id)
        if (realCtr === undefined) mockFields.push(`topVideos[${v.id}].ctr`)
        return {
          id: v.id,
          thumbnail: v.thumbnail,
          title: v.title,
          views: v.views,
          likes: v.likes,
          comments: v.comments,
          publishedAt: v.publishedAt,
          ctr: realCtr ?? mockYTCTR(),
        }
      })
    // Simplify mockFields if all CTRs are missing
    if (topVideos.length > 0 && topVideos.every((v) => !analytics?.topVideosCtr?.has(v.id))) {
      // remove all per-video entries and add a single "topVideos[].ctr"
      mockFields.splice(0, mockFields.length)
      mockFields.push("topVideos[].ctr")
    }

    // Views time series: prefer Analytics API (real daily views)
    let viewsSeries: TimeSeriesPoint[]
    if (analytics?.viewsSeries && analytics.viewsSeries.length > 0) {
      viewsSeries = analytics.viewsSeries
    } else {
      viewsSeries = deriveViewsSeriesFromVideos(videos, period)
      mockFields.push("viewsSeries (approx)")
    }

    // Subs gained: prefer real
    let subsGainedSeries: TimeSeriesPoint[]
    if (analytics?.subsGainedSeries && analytics.subsGainedSeries.length > 0) {
      subsGainedSeries = analytics.subsGainedSeries
    } else {
      const rnd = seededRandom(dailySeed() + 3)
      subsGainedSeries = viewsSeries.map((p) => ({
        date: p.date,
        value: Math.round(rnd() * 6),
      }))
      mockFields.push("subsGainedSeries")
    }

    // Watch hours: prefer real
    const totalWatchHours = analytics?.totalWatchMinutes !== null && analytics?.totalWatchMinutes !== undefined
      ? Math.round(analytics.totalWatchMinutes / 60)
      : (mockFields.push("totalWatchHours"), mockYTWatchHours(stats.totalViews))

    // Avg view duration: prefer real
    const avgViewDuration = analytics?.avgViewDuration !== null && analytics?.avgViewDuration !== undefined
      ? Math.round(analytics.avgViewDuration)
      : (mockFields.push("avgViewDuration"), mockYTAvgViewDuration())

    // Retention: prefer real
    const retentionAvg = analytics?.avgViewPercentage !== null && analytics?.avgViewPercentage !== undefined
      ? Math.round(analytics.avgViewPercentage)
      : (mockFields.push("retentionAvg"), mockYTRetention())

    // Traffic sources: prefer real
    const trafficSources = analytics?.trafficSources && analytics.trafficSources.length > 0
      ? analytics.trafficSources
      : (mockFields.push("trafficSources"), mockYTTrafficSources())

    // Top countries: prefer real
    const topCountries = analytics?.topCountries && analytics.topCountries.length > 0
      ? analytics.topCountries
      : (mockFields.push("topCountries"), mockYTTopCountries())

    return {
      subscribers: stats.subscribers,
      totalViews: stats.totalViews,
      totalWatchHours,
      videosCount: stats.videosCount,
      avgViewDuration,
      viewsSeries,
      subsGainedSeries,
      retentionAvg,
      topVideos,
      trafficSources,
      topCountries,
      mockFields,
    }
  } catch (err) {
    console.warn("[analytics/youtube] fetch failed, falling back to mock:", err)
    return mockYouTubeFallback(period)
  }
})
