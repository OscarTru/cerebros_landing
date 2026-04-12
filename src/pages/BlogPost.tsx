import { Suspense, lazy, useState, useEffect, useMemo } from "react"
import { useParams, Navigate } from "react-router-dom"
import { BlogLayout } from "@/layouts/BlogLayout"
import { EbookCTA } from "@/components/EbookCTA"

type Frontmatter = {
  title: string
  date: string
  slug: string
  description: string
  author: string
  image?: string
}

type MDXComponents = Record<string, React.ComponentType>

type MDXModule = {
  default: React.ComponentType<{ components?: MDXComponents }>
  frontmatter: Frontmatter
}

const modules = import.meta.glob<MDXModule>("../content/blog/*.mdx")

// All posts sorted newest-first (same order as blog listing)
const allPostsEager = import.meta.glob<{ frontmatter: Frontmatter }>("../content/blog/*.mdx", { eager: true })
const ALL_SLUGS: string[] = Object.values(allPostsEager)
  .map((m) => m.frontmatter?.slug)
  .filter((s): s is string => Boolean(s))
  .sort((a, b) => {
    const fa = allPostsEager[`../content/blog/${a}.mdx`]?.frontmatter
    const fb = allPostsEager[`../content/blog/${b}.mdx`]?.frontmatter
    if (!fa || !fb) return 0
    return fa.date < fb.date ? 1 : -1
  })

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [frontmatter, setFrontmatter] = useState<Frontmatter | null>(null)
  const [notFound, setNotFound] = useState(false)

  const path = slug ? `../content/blog/${slug}.mdx` : null
  const loader = path ? modules[path] : undefined

  useEffect(() => {
    if (!loader) {
      setNotFound(true)
      return
    }
    loader().then((mod) => setFrontmatter(mod.frontmatter))
  }, [loader])

  const Article = useMemo(
    () => (loader ? lazy(loader) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [path]
  )

  const currentIndex = slug ? ALL_SLUGS.indexOf(slug) : -1
  const prevSlug = currentIndex > 0 ? ALL_SLUGS[currentIndex - 1] : undefined
  const nextSlug = currentIndex >= 0 && currentIndex < ALL_SLUGS.length - 1 ? ALL_SLUGS[currentIndex + 1] : undefined

  const prevPost = prevSlug
    ? { slug: prevSlug, title: allPostsEager[`../content/blog/${prevSlug}.mdx`]?.frontmatter?.title ?? "" }
    : undefined
  const nextPost = nextSlug
    ? { slug: nextSlug, title: allPostsEager[`../content/blog/${nextSlug}.mdx`]?.frontmatter?.title ?? "" }
    : undefined

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
      prevPost={prevPost}
      nextPost={nextPost}
    >
      <Suspense fallback={<div className="min-h-[40vh]" />}>
        <Article components={{ EbookCTA }} />
      </Suspense>
    </BlogLayout>
  )
}
