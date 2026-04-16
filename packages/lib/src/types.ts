export interface Heading {
  id: string
  text: string
  level: number
}

export interface PostMeta {
  slug: string
  title: string
  date: string
  description: string
  author: string
  image?: string
  readingTime: number
  headings: Heading[]
}
