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
    console.warn("[analytics/youtube] fetch failed, falling back to mock:", err)
    return mockYouTubeFallback(period)
  }
}
