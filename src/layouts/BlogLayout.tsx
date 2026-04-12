import { LazyMotion, domAnimation } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowLeft, Link2 } from "lucide-react"
import { useState, type ReactNode } from "react"
import { NoiseOverlay } from "@/components/NoiseOverlay"
import { Footer } from "@/sections/Footer"
import { FadeIn } from "@/components/FadeIn"
import { ThemeToggle } from "@/components/ThemeToggle"
import { LikeButton } from "@/components/LikeButton"

interface BlogLayoutProps {
  title: string
  date: string
  author: string
  description: string
  slug: string
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

function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== "undefined" ? window.location.href : ""
  const text = `"${title}" — vía @cerebros.esponjosos`

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`

  return (
    <div className="flex items-center gap-3">
      {/* X / Twitter */}
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartir en X"
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--c-border)] bg-[var(--c-surface)] text-xs text-[var(--c-text-muted)] hover:border-[var(--c-border-strong)] hover:text-[var(--c-text)] transition-all"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        X
      </a>

      {/* WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartir por WhatsApp"
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--c-border)] bg-[var(--c-surface)] text-xs text-[var(--c-text-muted)] hover:border-[var(--c-border-strong)] hover:text-[var(--c-text)] transition-all"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        WhatsApp
      </a>

      {/* Copiar link */}
      <button
        onClick={copyLink}
        aria-label="Copiar enlace"
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--c-border)] bg-[var(--c-surface)] text-xs text-[var(--c-text-muted)] hover:border-[var(--c-border-strong)] hover:text-[var(--c-text)] transition-all"
      >
        <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
        {copied ? "¡Copiado!" : "Copiar enlace"}
      </button>
    </div>
  )
}

export function BlogLayout({ title, date, author, description, slug, children }: BlogLayoutProps) {
  return (
    <LazyMotion features={domAnimation}>
      <div className="relative min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] overflow-x-hidden font-sans">
        <NoiseOverlay />

        <nav className="relative z-20 px-6 py-6 border-b border-[var(--c-border)]">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="font-serif text-base text-[var(--c-text)]">
                Cerebros Esponjosos
              </span>
            </Link>
            <ThemeToggle />
          </div>
        </nav>

        <main className="relative z-10 px-6 pt-20 pb-32">
          <div className="max-w-3xl mx-auto">
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
              <p className="text-base text-[var(--c-text-muted)] leading-relaxed mb-4 max-w-2xl">
                {description}
              </p>
              <p className="text-xs text-[var(--c-text-faint)] mb-16">
                Por {author}
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="prose-blog">
                {children}
              </div>
            </FadeIn>

            {/* Like button — before share */}
            <FadeIn delay={0.1}>
              <div className="mt-16 pt-10 border-t border-[var(--c-border)] flex flex-col items-center">
                <LikeButton slug={slug} />
              </div>
            </FadeIn>

            {/* Share buttons — after article */}
            <FadeIn delay={0.1}>
              <div className="mt-10 pt-10 border-t border-[var(--c-border)]">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-text-subtle)] mb-4">
                  Compartir
                </p>
                <ShareButtons title={title} />
              </div>
            </FadeIn>

            {/* Back to home */}
            <FadeIn delay={0.12}>
              <div className="mt-10">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-sm text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Volver al inicio
                </Link>
              </div>
            </FadeIn>
          </div>
        </main>

        <Footer />
      </div>
    </LazyMotion>
  )
}
