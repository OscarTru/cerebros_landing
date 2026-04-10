import { Suspense, lazy, useState, useEffect } from "react"
import { useParams, Navigate } from "react-router-dom"
import { BlogLayout } from "@/layouts/BlogLayout"

type Frontmatter = {
  title: string
  date: string
  slug: string
  description: string
  author: string
}

type MDXModule = {
  default: React.ComponentType
  frontmatter: Frontmatter
}

const modules = import.meta.glob<MDXModule>("../content/blog/*.mdx")

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

  if (notFound) return <Navigate to="/" replace />
  if (!frontmatter) return <div className="min-h-screen bg-[var(--c-bg)]" />

  const Article = lazy(loader!)

  return (
    <BlogLayout
      title={frontmatter.title}
      date={frontmatter.date}
      author={frontmatter.author}
      description={frontmatter.description}
    >
      <Suspense fallback={null}>
        <Article />
      </Suspense>
    </BlogLayout>
  )
}
