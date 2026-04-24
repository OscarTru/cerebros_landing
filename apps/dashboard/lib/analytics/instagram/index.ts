import { cache } from "react"
import type { InstagramAnalytics, Period, TimeSeriesPoint } from "../types"
import {
  getBasicStats,
  getRecentMedia,
  getProfileInsights,
  getMediaInsights,
  getAudienceDemographics,
  getBestPostingHoursFromMedia,
  getActiveStoriesPerformance,
  getDailyReachSeries,
  type IGMedia,
} from "./client"
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
  const rnd = seededRandom(dailySeed())
  const days = periodToDays(period)
  const series: TimeSeriesPoint[] = []
  const now = new Date()
  const weeklyGrowth = 0.006
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
  if (series.length > 0) series[series.length - 1].value = currentFollowers
  return series
}

export const getInstagramAnalytics = cache(async function getInstagramAnalytics(period: Period): Promise<InstagramAnalytics> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
  const userId = process.env.INSTAGRAM_USER_ID

  if (!accessToken || !userId) {
    return mockInstagramFallback(period)
  }

  const mockFields: string[] = []

  let basic
  try {
    basic = await getBasicStats(accessToken, userId)
  } catch (err) {
    console.warn("[analytics/instagram] basic stats failed:", err)
    return mockInstagramFallback(period)
  }

  let media: IGMedia[] = []
  try {
    media = await getRecentMedia(accessToken, userId, 25)
  } catch (err) {
    console.warn("[analytics/instagram] media fetch failed:", err)
    mockFields.push("topPosts")
  }

  let insights: {
    reach?: number
    impressions?: number
    profileVisits?: number
    websiteClicks?: number
    accountsEngaged?: number
    totalInteractions?: number
  } = {}
  try {
    insights = await getProfileInsights(accessToken, userId)
  } catch {
    // Profile insights failed — fall back to mock for these fields
    mockFields.push("reach30d", "impressions30d", "profileVisits30d", "websiteClicks30d")
  }

  // If specific insight fields are missing (null), mark them as mock individually
  if (insights.reach === undefined) mockFields.push("reach30d")
  if (insights.impressions === undefined) mockFields.push("impressions30d")
  if (insights.profileVisits === undefined) mockFields.push("profileVisits30d")
  if (insights.websiteClicks === undefined) mockFields.push("websiteClicks30d")

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

  const engSample = media.slice(0, 12)
  const avgEng = engSample.length > 0
    ? engSample.reduce((a, m) => a + m.likeCount + m.commentsCount, 0) / engSample.length
    : 0
  const engagementRate = basic.followers > 0
    ? Math.round((avgEng / basic.followers) * 10000) / 100
    : 0

  // Use daily reach as audience activity indicator (Graph API doesn't expose
  // daily follower count). Reach is actually more useful for creators —
  // it shows how many accounts saw your content each day.
  let followersSeries: TimeSeriesPoint[] = approximateFollowersSeries(basic.followers, period)
  try {
    const reachSeries = await getDailyReachSeries(accessToken, userId, periodToDays(period))
    if (reachSeries && reachSeries.length > 0) {
      followersSeries = reachSeries
    } else {
      mockFields.push("followersSeries")
    }
  } catch {
    mockFields.push("followersSeries")
  }

  // Try real demographics + cities
  let realDemographicsAge = mockDemographicsAge()
  let realDemographicsGender = mockDemographicsGender()
  let realTopCities = mockTopCities()
  try {
    const demo = await getAudienceDemographics(accessToken, userId)
    if (demo.age.length > 0) {
      realDemographicsAge = demo.age
    } else {
      mockFields.push("demographics.age")
    }
    if (demo.gender.length > 0) {
      realDemographicsGender = demo.gender
    } else {
      mockFields.push("demographics.gender")
    }
    if (demo.cities.length > 0) {
      realTopCities = demo.cities
    } else {
      mockFields.push("topCities")
    }
  } catch {
    mockFields.push("demographics", "topCities")
  }

  // Try real best posting hours derived from historical post timestamps
  let realBestHours = mockBestPostingHours()
  try {
    const hours = await getBestPostingHoursFromMedia(accessToken, userId, 50)
    if (hours.length > 0 && hours.some((h) => h.score > 0)) {
      realBestHours = hours
    } else {
      mockFields.push("bestPostingHours")
    }
  } catch {
    mockFields.push("bestPostingHours")
  }

  // Try real stories performance. If no active stories, show zeros (not mock —
  // the creator just hasn't published stories in the 24h window).
  let realStoriesPerf = { avgViews: 0, completionRate: 0, replies: 0 }
  try {
    const storiesPerf = await getActiveStoriesPerformance(accessToken, userId)
    realStoriesPerf = {
      avgViews: storiesPerf.avgViews,
      completionRate: 0, // not exposed by API
      replies: storiesPerf.replies,
    }
    // Always mark completionRate as mock since API doesn't expose it
    if (storiesPerf.count > 0) {
      mockFields.push("storiesPerformance.completionRate")
    }
    // If no stories active, that's real data (0), not mock
  } catch {
    mockFields.push("storiesPerformance")
    realStoriesPerf = mockStoriesPerformance()
  }

  return {
    followers: basic.followers,
    following: basic.following,
    postsCount: basic.postsCount,
    reach30d: insights.reach ?? 0,
    impressions30d: insights.impressions ?? 0,
    profileVisits30d: insights.profileVisits ?? 0,
    websiteClicks30d: insights.websiteClicks ?? 0,
    engagementRate,
    followersSeries,
    demographics: { age: realDemographicsAge, gender: realDemographicsGender },
    topCities: realTopCities,
    bestPostingHours: realBestHours,
    topPosts: postsWithInsights,
    storiesPerformance: realStoriesPerf,
    mockFields,
  }
})
