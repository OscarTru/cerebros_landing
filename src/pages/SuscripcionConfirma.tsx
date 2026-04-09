import { LazyMotion, domAnimation } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowLeft, Mail } from "lucide-react"
import { NoiseOverlay } from "@/components/NoiseOverlay"
import { Footer } from "@/sections/Footer"
import { FadeIn } from "@/components/FadeIn"
import { Button } from "@/components/ui/button"

export function SuscripcionConfirma() {
  return (
    <LazyMotion features={domAnimation}>
      <div className="relative min-h-screen bg-[#0a0a0b] text-zinc-100 overflow-x-hidden font-sans">
        <NoiseOverlay />

        <nav className="relative z-20 px-6 py-6 border-b border-white/[0.06]">
          <div className="max-w-4xl mx-auto">
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

        <main className="relative z-10 px-6 pt-32 pb-32">
          <div className="max-w-2xl mx-auto text-center">
            <FadeIn>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-10">
                <Mail className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
            </FadeIn>
            <FadeIn delay={0.05}>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-4">
                Casi listo
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1
                className="font-serif text-white leading-[1.05] tracking-[-0.02em] mb-8"
                style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}
              >
                Revisa tu{" "}
                <span className="italic text-zinc-500">correo.</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="text-lg text-zinc-400 leading-relaxed mb-4 max-w-lg mx-auto">
                Te enviamos un email con un enlace de confirmación. Haz click
                para activar tu suscripción — así nos aseguramos que eres tú.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-sm text-zinc-600 mb-12">
                ¿No lo encuentras? Revisa la carpeta de spam o promociones.
              </p>
            </FadeIn>
            <FadeIn delay={0.25}>
              <Button asChild size="lg" variant="ghost">
                <Link to="/">Volver al inicio</Link>
              </Button>
            </FadeIn>
          </div>
        </main>
        <Footer />
      </div>
    </LazyMotion>
  )
}
