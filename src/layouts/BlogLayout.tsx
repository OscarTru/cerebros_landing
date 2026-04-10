import { LazyMotion, domAnimation } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import type { ReactNode } from "react"
import { NoiseOverlay } from "@/components/NoiseOverlay"
import { Footer } from "@/sections/Footer"
import { FadeIn } from "@/components/FadeIn"
import { ThemeToggle } from "@/components/ThemeToggle"

interface BlogLayoutProps {
  title: string
  date: string
  author: string
  description: string
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

export function BlogLayout({ title, date, author, description, children }: BlogLayoutProps) {
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
          </div>
        </main>

        <Footer />
      </div>
    </LazyMotion>
  )
}
