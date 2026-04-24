import type {
  Period,
  InstagramAnalytics,
  YouTubeAnalytics,
  TikTokAnalytics,
  BlogAnalytics,
  AnalyticsSummary,
} from "./types"
import { getInstagramAnalytics } from "./instagram"
import { getYouTubeAnalytics } from "./youtube"
import { generateTikTokMock } from "./mock/tiktok"
import { getBlogAnalytics } from "./blog"
import { getSupabase } from "@/lib/supabase"

async function getNewsletterCount(): Promise<number> {
  const { count } = await getSupabase()
    .from("suscriptores")
    .select("id", { count: "exact", head: true })
  return count ?? 0
}

export const analyticsAdapter = {
  async getInstagram(period: Period): Promise<InstagramAnalytics> {
    return getInstagramAnalytics(period)
  },

  async getYouTube(period: Period): Promise<YouTubeAnalytics> {
    return getYouTubeAnalytics(period)
  },

  async getTikTok(period: Period): Promise<TikTokAnalytics> {
    return generateTikTokMock(period)
  },

  async getBlog(period: Period): Promise<BlogAnalytics> {
    return getBlogAnalytics(period)
  },

  async getSummary(period: Period): Promise<AnalyticsSummary> {
    const [ig, yt, tt, , newsletterCount] = await Promise.all([
      getInstagramAnalytics(period),
      getYouTubeAnalytics(period),
      Promise.resolve(generateTikTokMock(period)),
      getBlogAnalytics(period),
      getNewsletterCount(),
    ])

    const totalAudience = ig.followers + yt.subscribers + tt.followers + newsletterCount

    const audienceByPlatform = [
      { platform: "instagram" as const, label: "Instagram", count: ig.followers },
      { platform: "youtube" as const, label: "YouTube", count: yt.subscribers },
      { platform: "tiktok" as const, label: "TikTok", count: tt.followers },
      { platform: "newsletter" as const, label: "Newsletter", count: newsletterCount },
    ].map((p) => ({
      ...p,
      percent: totalAudience > 0 ? Math.round((p.count / totalAudience) * 100) : 0,
    }))

    const dates = ig.followersSeries.map((p) => p.date)
    const audienceSeries = dates.map((date, i) => ({
      date,
      instagram: ig.followersSeries[i]?.value ?? 0,
      youtube: yt.subsGainedSeries[i]?.value ?? 0,
      tiktok: tt.followersSeries[i]?.value ?? 0,
      newsletter: Math.round(newsletterCount * (i / Math.max(1, dates.length - 1))),
    }))

    let topPost: AnalyticsSummary["topPost"] = null
    const igTop = ig.topPosts[0]
    const ytTop = yt.topVideos[0]
    if (igTop && ytTop) {
      if (igTop.likes * 10 > ytTop.views) {
        topPost = {
          platform: "instagram",
          title: igTop.caption.slice(0, 60) || "Post de Instagram",
          metric: `${igTop.likes.toLocaleString("es-MX")} likes`,
          thumbnail: igTop.thumbnail,
        }
      } else {
        topPost = {
          platform: "youtube",
          title: ytTop.title,
          metric: `${ytTop.views.toLocaleString("es-MX")} vistas`,
          thumbnail: ytTop.thumbnail,
        }
      }
    } else if (igTop) {
      topPost = {
        platform: "instagram",
        title: igTop.caption.slice(0, 60) || "Post de Instagram",
        metric: `${igTop.likes.toLocaleString("es-MX")} likes`,
        thumbnail: igTop.thumbnail,
      }
    } else if (ytTop) {
      topPost = {
        platform: "youtube",
        title: ytTop.title,
        metric: `${ytTop.views.toLocaleString("es-MX")} vistas`,
        thumbnail: ytTop.thumbnail,
      }
    }

    const totalReach = (ig.reach30d ?? 0) + (yt.totalViews ?? 0)
    const avgEngagementRate = ig.engagementRate

    const platformsComparison = [
      {
        platform: "instagram" as const,
        label: "Instagram",
        audience: ig.followers,
        monthlyGrowth: 2.1,
        engagementRate: ig.engagementRate,
        postsPublished: ig.postsCount,
        sparkline: ig.followersSeries.slice(-30),
      },
      {
        platform: "youtube" as const,
        label: "YouTube",
        audience: yt.subscribers,
        monthlyGrowth: 5.4,
        engagementRate: 0,
        postsPublished: yt.videosCount,
        sparkline: yt.viewsSeries.slice(-30),
      },
      {
        platform: "tiktok" as const,
        label: "TikTok",
        audience: tt.followers,
        monthlyGrowth: 8.0,
        engagementRate: 0,
        postsPublished: tt.videosCount,
        sparkline: tt.followersSeries.slice(-30),
      },
      {
        platform: "newsletter" as const,
        label: "Newsletter",
        audience: newsletterCount,
        monthlyGrowth: 0,
        engagementRate: 0,
        postsPublished: 0,
        sparkline: [],
      },
    ]

    return {
      totalAudience,
      audienceByPlatform,
      audienceSeries,
      avgEngagementRate,
      totalReach,
      topPost,
      platformsComparison,
      lastSync: new Date().toISOString(),
    }
  },
}
