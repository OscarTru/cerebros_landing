import { Suspense, lazy, useState, useEffect, useMemo } from "react"
import { useParams, Navigate } from "react-router-dom"
import { BlogLayout, headingComponents } from "@/layouts/BlogLayout"
import { EbookCTA } from "@/components/EbookCTA"
import { getAdjacentPosts, type PostMeta } from "@/content/blogMeta"
import { analytics } from "@/lib/analytics"

type MDXComponents = Record<string, React.ComponentType>

type MDXModule = {
  default: React.ComponentType<{ components?: MDXComponents }>
  frontmatter: PostMeta
}

const modules = import.meta.glob<MDXModule>("../content/blog/*.mdx")

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [frontmatter, setFrontmatter] = useState<PostMeta | null>(null)
  const [notFound, setNotFound] = useState(false)

  const path = slug ? `../content/blog/${slug}.mdx` : null
  const loader = path ? modules[path] : undefined

  useEffect(() => {
    if (!loader) {
      setNotFound(true)
      return
    }
    loader().then((mod) => {
      setFrontmatter(mod.frontmatter)
      analytics.blogPostView(mod.frontmatter.slug)
    })
  }, [loader])

  const Article = useMemo(
    () => (loader ? lazy(loader) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [path]
  )

  const { prevPost, nextPost } = slug ? getAdjacentPosts(slug) : {}

  if (notFound) return <Navigate to="/" replace />
  if (!frontmatter || !Article) return <div className="min-h-screen bg-[var(--c-bg)]" />

  return (
    <BlogLayout
      title={frontmatter.title}
      date={frontmatter.date}
      author={frontmatter.author}
      description={frontmatter.description}
      slug={frontmatter.slug}
      image={frontmatter.image}
      readingTime={frontmatter.readingTime}
      headings={frontmatter.headings}
      prevPost={prevPost}
      nextPost={nextPost}
    >
      <Suspense fallback={<div className="min-h-[40vh]" />}>
        <Article
          components={{
            ...headingComponents,
            EbookCTA: (props: Record<string, unknown>) => (
              <EbookCTA slug={slug ?? "unknown"} {...props} />
            ),
          }}
        />
      </Suspense>
    </BlogLayout>
  )
}
