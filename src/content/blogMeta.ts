// Shared blog post metadata — imported eagerly once, used by Blog listing and BlogPost navigation.
// Separating this from the MDX content glob avoids Vite warning about dual static+dynamic imports.
//
// readingTime is stored in each post's frontmatter (pre-computed).
// headings are extracted via a separate ?raw import at the BlogPost render level,
// or passed as an empty array fallback — BlogLayout handles both cases.

import type { Heading } from "@/lib/readingTime"

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

// readingTime and headings are pre-computed and stored in each post's frontmatter.
// This avoids the Vite MDX plugin intercepting ?raw imports (it transforms .mdx
// before the raw loader runs, returning a compiled component instead of a string).
type FrontmatterRaw = Omit<PostMeta, "readingTime" | "headings"> & {
  readingTime?: number
  headings?: Heading[]
}

const metaModules = import.meta.glob<{ frontmatter: FrontmatterRaw }>(
  "./blog/*.mdx",
  { eager: true }
)

export const ALL_POSTS: PostMeta[] = Object.values(metaModules)
  .map((m) => {
    const f = m.frontmatter
    if (!f?.slug) return null
    return {
      ...f,
      readingTime: f.readingTime ?? 1,
      headings: f.headings ?? [],
    } satisfies PostMeta
  })
  .filter((f): f is PostMeta => f !== null)
  .sort((a, b) => (a.date < b.date ? 1 : -1))

export const ALL_SLUGS: string[] = ALL_POSTS.map((p) => p.slug)

export function getAdjacentPosts(slug: string): {
  prevPost?: { slug: string; title: string }
  nextPost?: { slug: string; title: string }
} {
  const idx = ALL_SLUGS.indexOf(slug)
  return {
    prevPost: idx > 0 ? { slug: ALL_SLUGS[idx - 1], title: ALL_POSTS[idx - 1].title } : undefined,
    nextPost:
      idx >= 0 && idx < ALL_SLUGS.length - 1
        ? { slug: ALL_SLUGS[idx + 1], title: ALL_POSTS[idx + 1].title }
        : undefined,
  }
}
