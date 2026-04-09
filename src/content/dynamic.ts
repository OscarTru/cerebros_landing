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

export interface DynamicContent {
  latestVideo: LatestVideo | null
  instagramPosts: IgPost[]
  fetchedAt: string | null
}

export const dynamicContent = contentData as DynamicContent
