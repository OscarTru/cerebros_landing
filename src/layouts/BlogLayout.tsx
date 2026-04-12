import { LazyMotion, domAnimation } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowLeft, ArrowRight, Clock, Link2 } from "lucide-react"
import { useState, type ReactNode } from "react"
import { NoiseOverlay } from "@/components/NoiseOverlay"
import { Footer } from "@/sections/Footer"
import { FadeIn } from "@/components/FadeIn"
import { ThemeToggle } from "@/components/ThemeToggle"
import { LikeButton } from "@/components/LikeButton"
import { ReadingProgressBar } from "@/components/ReadingProgressBar"
import { TableOfContents } from "@/components/TableOfContents"
import { isCloudinaryId, cloudinaryUrl, cloudinarySrcSet } from "@/lib/cloudinary"
import { slugify, type Heading } from "@/lib/readingTime"

interface PostNav {
  slug: string
  title: string
}

interface BlogLayoutProps {
  title: string
  date: string
  author: string
  description: string
  slug: string
  image?: string
  readingTime?: number
  headings?: Heading[]
  prevPost?: PostNav
  nextPost?: PostNav
  children: ReactNode
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

const iconClass =
  "h-9 w-9 flex items-center justify-center rounded-full border border-[var(--c-border)] text-[var(--c-text-muted)] hover:border-[var(--c-border-strong)] hover:text-[var(--c-text)] hover:scale-110 active:scale-95 transition-all duration-150 cursor-pointer"

function ShareBar({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== "undefined" ? window.location.href : ""
  const text = `"${title}" — vía @cerebros.esponjosos`

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`
  const threadsUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(`${text}\n${url}`)}`
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {/* WhatsApp */}
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Compartir por WhatsApp" className={iconClass}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
        {/* Threads */}
        <a href={threadsUrl} target="_blank" rel="noopener noreferrer" aria-label="Compartir en Threads" className={iconClass}>
          <svg width="16" height="16" viewBox="0 0 192 192" fill="currentColor" aria-hidden="true">
            <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.861 14.05-7.327-1.244-15.224-1.626-23.68-1.141-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 9.998 15.83 12.787 26.117l16.231-4.333c-3.413-12.567-8.878-23.459-16.337-32.542C147.144 9.672 125.27.195 97.07 0h-.113C68.882.195 47.292 9.715 32.788 28.283 19.882 44.768 13.224 67.162 13.001 95.983v.034c.223 28.822 6.88 51.216 19.787 67.7C47.292 182.286 68.882 191.806 96.957 192h.113c24.96-.173 42.554-6.708 57.048-21.189 18.963-18.945 18.392-42.692 12.142-57.27-4.484-10.454-13.033-18.945-24.723-24.553Z"/>
          </svg>
        </a>
        {/* Facebook */}
        <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Compartir en Facebook" className={iconClass}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>
        {/* Copy link */}
        <div className="relative">
          <button onClick={copyLink} aria-label={copied ? "Enlace copiado" : "Copiar enlace"} className={iconClass}>
            <Link2 className="h-4 w-4" aria-hidden="true" />
          </button>
          {copied && (
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-mono tracking-wide text-[var(--c-text)] bg-[var(--c-surface-2)] border border-[var(--c-border)] px-2 py-0.5 rounded-full whitespace-nowrap pointer-events-none">
              copiado
            </span>
          )}
        </div>
      </div>
      <LikeButton slug={slug} />
    </div>
  )
}

// MDX heading components that inject slugified IDs for TOC anchor links
function makeHeadingComponents() {
  const H2 = ({ children }: { children?: ReactNode }) => {
    const text = typeof children === "string" ? children : ""
    return <h2 id={slugify(text)}>{children}</h2>
  }
  const H3 = ({ children }: { children?: ReactNode }) => {
    const text = typeof children === "string" ? children : ""
    return <h3 id={slugify(text)}>{children}</h3>
  }
  return { h2: H2, h3: H3 }
}

const headingComponents = makeHeadingComponents()

export function BlogLayout({
  title,
  date,
  author,
  description,
  slug,
  image,
  readingTime,
  headings = [],
  prevPost,
  nextPost,
  children,
}: BlogLayoutProps) {
  const showTOC = headings.length >= 2

  return (
    <LazyMotion features={domAnimation}>
      <div className="relative min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] font-sans">
        <ReadingProgressBar />
        <NoiseOverlay />

        <nav className="relative z-20 px-6 py-6 border-b border-[var(--c-border)]">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link
              to="/blog"
              className="flex items-center gap-2 text-sm text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="font-serif text-base text-[var(--c-text)]">Blog</span>
            </Link>
            <ThemeToggle />
          </div>
        </nav>

        <main className="relative z-10 px-6 pt-20 pb-32">
          {/* Outer container: wider to accommodate sidebar */}
          <div className="max-w-5xl mx-auto">
            <div className={showTOC ? "lg:grid lg:grid-cols-[200px_1fr] lg:gap-16 lg:items-start" : ""}>
              {/* ── Sidebar (desktop only) — LEFT column ── */}
              {showTOC && (
                <aside className="hidden lg:block sticky top-32 self-start pt-2">
                  <TableOfContents headings={headings} />
                </aside>
              )}

              {/* ── Main prose column ── */}
              <article className="min-w-0">
                <FadeIn>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-text-subtle)] mb-4">
                    Blog · {formatDate(date)}
                  </p>
                </FadeIn>
                <FadeIn delay={0.05}>
                  <h1
                    className="font-serif text-[var(--c-text)] leading-[1.05] tracking-[-0.02em] mb-6"
                    style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}
                  >
                    {title}
                  </h1>
                </FadeIn>
                <FadeIn delay={0.08}>
                  <p className="text-base text-[var(--c-text-muted)] leading-relaxed mb-3 max-w-2xl">
                    {description}
                  </p>
                  <div className="flex items-center gap-3 mb-16 text-xs text-[var(--c-text-faint)]">
                    <span>Por {author}</span>
                    {readingTime && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          {readingTime} min de lectura
                        </span>
                      </>
                    )}
                  </div>
                </FadeIn>
                {image && (
                  <FadeIn delay={0.09}>
                    <div className="mb-12 rounded-xl overflow-hidden">
                      {isCloudinaryId(image) ? (
                        <img
                          src={cloudinaryUrl(image, 800)}
                          srcSet={cloudinarySrcSet(image)}
                          sizes="(max-width: 640px) 100vw, 800px"
                          alt={title}
                          className="w-full max-h-[480px] object-cover"
                          loading="eager"
                          decoding="sync"
                        />
                      ) : (
                        <img
                          src={image}
                          alt={title}
                          className="w-full max-h-[480px] object-cover"
                          loading="eager"
                          decoding="sync"
                        />
                      )}
                    </div>
                  </FadeIn>
                )}

                <FadeIn delay={0.1}>
                  <div className="prose-blog">
                    {children}
                  </div>
                </FadeIn>

                {/* Share + Like bar */}
                <FadeIn delay={0.1}>
                  <div className="mt-16 pt-6 border-t border-[var(--c-border)]">
                    <ShareBar title={title} slug={slug} />
                  </div>
                </FadeIn>

                {/* Blog navigation */}
                <FadeIn delay={0.12}>
                  <div className="mt-10 flex flex-col gap-6">
                    <Link
                      to="/blog"
                      className="inline-flex items-center gap-2 text-sm text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                      Todos los artículos
                    </Link>

                    {(prevPost || nextPost) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[var(--c-border)]">
                        {prevPost ? (
                          <Link
                            to={`/blog/${prevPost.slug}`}
                            className="group flex flex-col gap-1 p-4 rounded-xl border border-[var(--c-border)] hover:border-[var(--c-border-strong)] transition-colors"
                          >
                            <span className="flex items-center gap-1 text-xs text-[var(--c-text-subtle)] uppercase tracking-[0.15em]">
                              <ArrowLeft className="h-3 w-3" aria-hidden="true" />
                              Anterior
                            </span>
                            <span className="font-serif text-sm text-[var(--c-text)] leading-snug group-hover:text-[var(--c-text)] line-clamp-2">
                              {prevPost.title}
                            </span>
                          </Link>
                        ) : (
                          <div />
                        )}
                        {nextPost ? (
                          <Link
                            to={`/blog/${nextPost.slug}`}
                            className="group flex flex-col gap-1 p-4 rounded-xl border border-[var(--c-border)] hover:border-[var(--c-border-strong)] transition-colors sm:items-end sm:text-right"
                          >
                            <span className="flex items-center gap-1 text-xs text-[var(--c-text-subtle)] uppercase tracking-[0.15em]">
                              Siguiente
                              <ArrowRight className="h-3 w-3" aria-hidden="true" />
                            </span>
                            <span className="font-serif text-sm text-[var(--c-text)] leading-snug group-hover:text-[var(--c-text)] line-clamp-2">
                              {nextPost.title}
                            </span>
                          </Link>
                        ) : (
                          <div />
                        )}
                      </div>
                    )}
                  </div>
                </FadeIn>
              </article>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </LazyMotion>
  )
}

// Re-export heading components so BlogPost can pass them to MDX Article
export { headingComponents }
