import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Footer } from "@/sections/Footer"
import { getAllPosts } from "@/content/blog-utils"
import { isCloudinaryId, cloudinaryUrl, cloudinarySrcSet } from "@cerebros/lib"
import type { PostMeta } from "@cerebros/lib"

export const metadata: Metadata = {
  title: "Blog",
  description: "Artículos sobre neurociencia y cómo funciona tu cerebro.",
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const PLACEHOLDER_GRADIENTS = [
  "linear-gradient(135deg, #1e1b2e, #2d1f3d)",
  "linear-gradient(135deg, #0f1a12, #1a2e1f)",
  "linear-gradient(135deg, #1a1200, #2e2200)",
  "linear-gradient(135deg, #001a1a, #002e2e)",
  "linear-gradient(135deg, #1a000f, #2e0018)",
]

function PostImage({
  image,
  title,
  index,
  className,
  eager,
}: {
  image?: string
  title: string
  index: number
  className?: string
  eager?: boolean
}) {
  const gradient = PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length]

  if (image) {
    if (isCloudinaryId(image)) {
      return (
        <img
          src={cloudinaryUrl(image, 800)}
          srcSet={cloudinarySrcSet(image)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 800px"
          alt={title}
          className={className}
          style={{ objectFit: "cover" }}
          loading={eager ? "eager" : "lazy"}
          decoding={eager ? "sync" : "async"}
        />
      )
    }
    return (
      <img
        src={image}
        alt={title}
        className={className}
        style={{ objectFit: "cover" }}
        loading={eager ? "eager" : "lazy"}
        decoding={eager ? "sync" : "async"}
      />
    )
  }

  return (
    <div
      className={className}
      style={{ background: gradient }}
      aria-hidden="true"
    />
  )
}

export const revalidate = 60

export default async function BlogPage() {
  const allPosts = await getAllPosts()
  const [featured, ...rest] = allPosts

  if (!featured) {
    return (
      <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] flex items-center justify-center">
        <p className="text-[var(--c-text-subtle)]">No hay artículos aún.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)]">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-[var(--c-bg)]/70 border-b border-[var(--c-border)]">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-16">
          <Link
            href="/"
            className="font-serif text-xl text-[var(--c-text)] tracking-tight hover:text-[var(--c-text-muted)] transition-colors"
          >
            Cerebros Esponjosos
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="pt-32 pb-24 px-6 max-w-5xl mx-auto">
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

        {/* Featured post */}
        <Link
          href={`/blog/${featured.slug}`}
          className="group block mb-16 border border-[var(--c-border)] rounded-xl overflow-hidden hover:border-[var(--c-border-strong)] transition-colors"
        >
          <PostImage
            image={featured.image}
            title={featured.title}
            index={0}
            className="w-full h-64 sm:h-80 md:h-96"
            eager
          />
          <div className="p-6 sm:p-8">
            <time className="text-xs font-mono text-[var(--c-text-subtle)] uppercase tracking-[0.15em] block mb-3">
              {formatDate(featured.date)}
            </time>
            <h2
              className="font-serif text-[var(--c-text)] leading-[1.1] tracking-[-0.02em] mb-3 group-hover:text-[var(--c-text)] transition-colors"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
            >
              {featured.title}
            </h2>
            <p className="text-sm text-[var(--c-text-muted)] leading-relaxed mb-4 max-w-2xl">
              {featured.description}
            </p>
            <div className="flex items-center gap-2 text-xs text-[var(--c-text-subtle)]">
              <span>por {featured.author}</span>
              <span>·</span>
              <span className="flex items-center gap-1 group-hover:text-[var(--c-text)] transition-colors">
                Leer artículo
                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>
        </Link>

        {/* Secondary posts grid */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {rest.map((post: PostMeta, i: number) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group border border-[var(--c-border)] rounded-xl overflow-hidden hover:border-[var(--c-border-strong)] transition-colors"
              >
                <PostImage
                  image={post.image}
                  title={post.title}
                  index={i + 1}
                  className="w-full h-40"
                />
                <div className="p-5">
                  <time className="text-xs font-mono text-[var(--c-text-subtle)] uppercase tracking-[0.15em] block mb-2">
                    {formatDate(post.date)}
                  </time>
                  <h2 className="font-serif text-base text-[var(--c-text)] leading-snug mb-2 group-hover:text-[var(--c-text)] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-xs text-[var(--c-text-muted)] leading-relaxed line-clamp-2 mb-3">
                    {post.description}
                  </p>
                  <span className="text-xs text-[var(--c-text-subtle)]">por {post.author}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
