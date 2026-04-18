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
