export type DraftMode = "blocks" | "markdown" | "html"

export interface NewsItem {
  publication: string
  title: string
  url: string
  description: string
}

export interface ArticleBlock {
  label?: string
  title: string
  url: string
  excerpt: string
  byline?: string
}

export interface BlogPromo {
  title: string
  url: string
  excerpt: string
  cta?: string
}

export interface EbookCta {
  eyebrow?: string
  title: string
  description: string
  ctaLabel: string
  url: string
}

export interface EditionBlocks {
  editionNumber?: string
  badge?: string
  issueDate?: string
  heroLabel?: string
  heroTitle: string
  heroSubtitle?: string
  coverIntro?: string
  article?: ArticleBlock
  blogPromo?: BlogPromo
  news?: NewsItem[]
  ebookCta?: EbookCta
  freeMarkdown?: string
  quote?: string
  signatureIntro?: string
  signature?: string
  signatureRole?: string
}

export interface DraftShape {
  subject: string
  mode: DraftMode
  blocks: EditionBlocks | null
  markdown: string | null
  html: string | null
}
