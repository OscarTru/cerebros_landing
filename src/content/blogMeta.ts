// Shared blog post metadata — imported eagerly once, used by Blog listing and BlogPost navigation.
// Separating this from the MDX content glob avoids Vite warning about dual static+dynamic imports.

export interface PostMeta {
  slug: string
  title: string
  date: string
  description: string
  author: string
  image?: string
}

const metaModules = import.meta.glob<{ frontmatter: PostMeta }>("./blog/*.mdx", { eager: true })

export const ALL_POSTS: PostMeta[] = Object.values(metaModules)
  .map((m) => m.frontmatter)
  .filter((f): f is PostMeta => Boolean(f?.slug))
  .sort((a, b) => (a.date < b.date ? 1 : -1))

export const ALL_SLUGS: string[] = ALL_POSTS.map((p) => p.slug)

export function getAdjacentPosts(slug: string): {
  prevPost?: { slug: string; title: string }
  nextPost?: { slug: string; title: string }
} {
  const idx = ALL_SLUGS.indexOf(slug)
  return {
    prevPost: idx > 0 ? { slug: ALL_SLUGS[idx - 1], title: ALL_POSTS[idx - 1].title } : undefined,
    nextPost: idx >= 0 && idx < ALL_SLUGS.length - 1
      ? { slug: ALL_SLUGS[idx + 1], title: ALL_POSTS[idx + 1].title }
      : undefined,
  }
}
