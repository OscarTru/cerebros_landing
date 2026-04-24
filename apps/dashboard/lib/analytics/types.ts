export type Period = "7d" | "30d" | "90d" | "all"

export interface TimeSeriesPoint {
  date: string
  value: number
}

export type PlatformId = "instagram" | "youtube" | "tiktok" | "blog" | "newsletter"

export interface PlatformOverview {
  platform: PlatformId
  audience: number
  audienceSeries: TimeSeriesPoint[]
  engagementRate?: number
  totalReach?: number
  growthPercent?: number
}

export interface InstagramAnalytics {
  followers: number
  following: number
  postsCount: number
  reach30d: number
  impressions30d: number
  profileVisits30d: number
  websiteClicks30d: number
  engagementRate: number
  followersSeries: TimeSeriesPoint[]
  demographics: {
    age: Array<{ bucket: string; percent: number }>
    gender: Array<{ label: string; percent: number }>
  }
  topCities: Array<{ name: string; percent: number }>
  bestPostingHours: Array<{ day: number; hour: number; score: number }>
  topPosts: Array<{
    id: string
    thumbnail: string
    caption: string
    likes: number
    comments: number
    reach: number
    permalink: string
  }>
  storiesPerformance: {
    avgViews: number
    completionRate: number
    replies: number
  }
  mockFields: string[]
}

export interface YouTubeAnalytics {
  subscribers: number
  totalViews: number
  totalWatchHours: number
  videosCount: number
  avgViewDuration: number
  viewsSeries: TimeSeriesPoint[]
  subsGainedSeries: TimeSeriesPoint[]
  retentionAvg: number
  topVideos: Array<{
    id: string
    thumbnail: string
    title: string
    views: number
    likes: number
    comments: number
    publishedAt: string
    ctr?: number
  }>
  trafficSources: Array<{ source: string; percent: number }>
  topCountries: Array<{ code: string; name: string; percent: number }>
  mockFields: string[]
}

export interface TikTokAnalytics {
  followers: number
  following: number
  videosCount: number
  totalLikes: number
  totalShares: number
  followersSeries: TimeSeriesPoint[]
  topVideos: Array<{
    id: string
    thumbnail: string
    title: string
    views: number
    likes: number
    shares: number
    comments: number
    completionRate: number
  }>
  topHashtags: Array<{ tag: string; uses: number }>
  bestPostingHours: Array<{ day: number; hour: number; score: number }>
  isUsingMockData: true
}

export interface BlogAnalytics {
  totalLikes: number
  totalPosts: number
  avgLikesPerPost: number
  likesSeries: TimeSeriesPoint[]
  topPosts: Array<{
    slug: string
    title: string
    likes: number
    date: string
  }>
}

export interface AnalyticsSummary {
  totalAudience: number
  audienceByPlatform: Array<{ platform: PlatformId; label: string; count: number; percent: number }>
  audienceSeries: Array<{ date: string; instagram: number; youtube: number; tiktok: number; newsletter: number }>
  avgEngagementRate: number
  totalReach: number
  topPost: {
    platform: PlatformId
    title: string
    metric: string
    thumbnail?: string
  } | null
  platformsComparison: Array<{
    platform: PlatformId
    label: string
    audience: number
    monthlyGrowth: number
    engagementRate: number
    postsPublished: number
    sparkline: TimeSeriesPoint[]
  }>
  lastSync: string
}
