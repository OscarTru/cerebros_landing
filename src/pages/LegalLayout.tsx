import { LazyMotion, domAnimation } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import type { ReactNode } from "react"
import { NoiseOverlay } from "@/components/NoiseOverlay"
import { Footer } from "@/sections/Footer"
import { FadeIn } from "@/components/FadeIn"

interface LegalLayoutProps {
  title: string
  updated: string
  children: ReactNode
}

export function LegalLayout({ title, updated, children }: LegalLayoutProps) {
  return (
    <LazyMotion features={domAnimation}>
      <div className="relative min-h-screen bg-[#0a0a0b] text-zinc-100 overflow-x-hidden font-sans">
        <NoiseOverlay />

        <nav className="relative z-20 px-6 py-6 border-b border-white/[0.06]">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="font-serif text-base text-white">
                Cerebros Esponjosos
              </span>
            </Link>
          </div>
        </nav>

        <main className="relative z-10 px-6 pt-28 pb-32">
          <div className="max-w-3xl mx-auto">
            <FadeIn>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-4">
                Legal · Actualizado {updated}
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h1
                className="font-serif text-white leading-[1.05] tracking-[-0.02em] mb-12"
                style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}
              >
                {title}
              </h1>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="prose-legal text-zinc-300 leading-relaxed space-y-8">
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
