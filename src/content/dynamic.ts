import contentData from "../../public/data/content.json"

export interface LatestVideo {
  id: string
  title: string
  thumbnail: string
  url: string
  publishedAt: string
}

export type IgMediaType = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM"

export interface IgPost {
  id: string
  caption: string
  mediaUrl: string
  thumbnailUrl: string | null
  permalink: string
  mediaType: IgMediaType
  timestamp: string
}

export interface IgTopReel {
  id: string
  permalink: string
  thumbnailUrl: string | null
  caption: string
  views: number | null
  likes: number | null
  comments: number | null
  shares: number | null
  saved: number | null
}

export interface IgStats {
  username: string
  name: string | null
  profilePictureUrl: string | null
  followersCount: number
  mediaCount: number
  reach30d: number | null
  profileViews30d: number | null
  accountsEngaged30d: number | null
  reelsSampled: number
  avgViewsPerReel: number | null
  avgLikesPerReel: number | null
  avgCommentsPerReel: number | null
  avgEngagementRate: number | null
  avgEngagementRateByViews: number | null
  totalReelViews: number
  totalReelLikes: number
  totalReelComments: number
  totalReelShares: number
  totalReelSaves: number
  topReels: IgTopReel[]
}

export interface DynamicContent {
  latestVideo: LatestVideo | null
  instagramPosts: IgPost[]
  instagramStats: IgStats | null
  fetchedAt: string | null
}

export const dynamicContent = contentData as DynamicContent
