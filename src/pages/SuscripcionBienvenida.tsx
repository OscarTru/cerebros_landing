import { LazyMotion, domAnimation } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowLeft, Check, ArrowUpRight } from "lucide-react"
import { NoiseOverlay } from "@/components/NoiseOverlay"
import { Footer } from "@/sections/Footer"
import { FadeIn } from "@/components/FadeIn"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"

const YOUTUBE = "https://www.youtube.com/@CerebrosEsponjosos"
const INSTAGRAM = "https://instagram.com/cerebros.esponjosos"

export function SuscripcionBienvenida() {
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

        <main className="relative z-10 px-6 pt-32 pb-32">
          <div className="max-w-2xl mx-auto text-center">
            <FadeIn>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-400/30 mb-10">
                <Check className="h-6 w-6 text-emerald-500" aria-hidden="true" />
              </div>
            </FadeIn>
            <FadeIn delay={0.05}>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-text-subtle)] mb-4">
                Suscripción confirmada
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1
                className="font-serif text-[var(--c-text)] leading-[1.05] tracking-[-0.02em] mb-8"
                style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}
              >
                Bienvenido al{" "}
                <span className="italic text-[var(--c-text-faint)]">equipo.</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="text-lg text-[var(--c-text-muted)] leading-relaxed mb-12 max-w-lg mx-auto">
                Ya eres parte de la comunidad. La próxima edición aterriza en
                tu bandeja cada semana. Mientras tanto, pasate por nuestro
                contenido:
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" variant="primary">
                  <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">
                    Instagram
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="ghost">
                  <a href={YOUTUBE} target="_blank" rel="noopener noreferrer">
                    YouTube
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </Button>
              </div>
            </FadeIn>
          </div>
        </main>
        <Footer />
      </div>
    </LazyMotion>
  )
}
