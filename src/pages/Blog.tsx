import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"

interface PostMeta {
  slug: string
  title: string
  date: string
  description: string
  author: string
}

const modules = import.meta.glob("../content/blog/*.mdx", { eager: true })

function getAllPosts(): PostMeta[] {
  return Object.entries(modules)
    .map(([, mod]) => {
      const m = mod as { frontmatter?: PostMeta }
      if (!m.frontmatter) return null
      return m.frontmatter
    })
    .filter(Boolean)
    .sort((a, b) => (a!.date < b!.date ? 1 : -1)) as PostMeta[]
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function Blog() {
  const [posts, setPosts] = useState<PostMeta[]>([])

  useEffect(() => {
    setPosts(getAllPosts())
  }, [])

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)]">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-[var(--c-bg)]/70 border-b border-[var(--c-border)]">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-16">
          <Link
            to="/"
            className="font-serif text-xl text-[var(--c-text)] tracking-tight hover:text-[var(--c-text-muted)] transition-colors"
          >
            Cerebros Esponjosos
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <div className="inline-block px-4 py-1 border border-[var(--c-border)] rounded-full text-[11px] font-mono tracking-[0.25em] uppercase text-[var(--c-text-subtle)] mb-8">
            · Blog ·
          </div>
          <h1
            className="font-serif leading-[1.05] tracking-[-0.02em] mb-6"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
          >
            <span className="block text-[var(--c-text)]">Neurociencia</span>
            <span className="block italic text-[var(--c-text-faint)]">en palabras claras.</span>
          </h1>
          <p className="text-base text-[var(--c-text-muted)] max-w-xl leading-relaxed">
            Artículos sobre cómo funciona tu cerebro. Sin jerga innecesaria, con las referencias que importan.
          </p>
        </div>

        {/* Posts grid */}
        {posts.length === 0 ? (
          <p className="text-[var(--c-text-subtle)]">Cargando artículos...</p>
        ) : (
          <div className="grid gap-px bg-[var(--c-border)]">
            {posts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group relative bg-[var(--c-bg)] px-0 py-8 flex flex-col sm:flex-row sm:items-start gap-6 hover:bg-[var(--c-surface)] transition-colors"
              >
                {/* Date */}
                <div className="sm:w-36 shrink-0">
                  <time className="text-xs font-mono text-[var(--c-text-subtle)] uppercase tracking-[0.15em]">
                    {formatDate(post.date)}
                  </time>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h2 className="font-serif text-xl text-[var(--c-text)] leading-snug mb-2 group-hover:text-[var(--c-text)] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-[var(--c-text-muted)] leading-relaxed line-clamp-2 mb-3">
                    {post.description}
                  </p>
                  <span className="text-xs text-[var(--c-text-subtle)]">
                    por {post.author}
                  </span>
                </div>

                {/* Arrow */}
                <div className="hidden sm:flex items-center self-center">
                  <ArrowRight className="h-4 w-4 text-[var(--c-text-subtle)] group-hover:text-[var(--c-text)] group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
