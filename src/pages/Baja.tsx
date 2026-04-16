import { LazyMotion, domAnimation } from "framer-motion"
import { Link, useSearchParams } from "react-router-dom"
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import { NoiseOverlay } from "@/components/NoiseOverlay"
import { Footer } from "@/sections/Footer"
import { FadeIn } from "@/components/FadeIn"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useEffect, useState } from "react"

export function Baja() {
  const [params] = useSearchParams()
  const status = params.get("status")
  const email = params.get("e")
  const token = params.get("token")
  // Already processed if we have a status param, or there's no email to act on
  const [processed, setProcessed] = useState(() => Boolean(status || !email))

  // If arriving via direct link from email (no status yet), call the API
  useEffect(() => {
    if (!status && email) {
      const qs = new URLSearchParams({ e: email })
      if (token) qs.set("token", token)
      fetch(`/api/unsubscribe?${qs.toString()}`)
        .catch(() => {})
        .finally(() => { setProcessed(true) })
    }
  }, [status, email, token])

  const isOk = status === "ok" || (processed && !status && email)
  const isError = status === "error"

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
            {!processed ? (
              <FadeIn>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--c-surface-2)] border border-[var(--c-border)] mb-10">
                  <span className="text-2xl">⏳</span>
                </div>
                <p className="text-[var(--c-text-muted)]">Procesando...</p>
              </FadeIn>
            ) : isError ? (
              <>
                <FadeIn>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--c-surface-2)] border border-[var(--c-border)] mb-10">
                    <AlertCircle className="h-6 w-6 text-[var(--c-text-muted)]" aria-hidden="true" />
                  </div>
                </FadeIn>
                <FadeIn delay={0.05}>
                  <h1
                    className="font-serif text-[var(--c-text)] leading-[1.05] tracking-[-0.02em] mb-6"
                    style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
                  >
                    Algo salió mal.
                  </h1>
                </FadeIn>
                <FadeIn delay={0.1}>
                  <p className="text-base text-[var(--c-text-muted)] leading-relaxed mb-10 max-w-md mx-auto">
                    No pudimos procesar tu solicitud. Si quieres darte de baja, escríbenos a{" "}
                    <a href="mailto:hola@cerebrosesponjosos.com" className="text-[var(--c-text)] underline">
                      hola@cerebrosesponjosos.com
                    </a>
                    .
                  </p>
                </FadeIn>
                <FadeIn delay={0.15}>
                  <Button asChild size="lg" variant="ghost">
                    <Link to="/">Volver al inicio</Link>
                  </Button>
                </FadeIn>
              </>
            ) : isOk ? (
              <>
                <FadeIn>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--c-surface-2)] border border-[var(--c-border)] mb-10">
                    <CheckCircle className="h-6 w-6 text-[var(--c-text)]" aria-hidden="true" />
                  </div>
                </FadeIn>
                <FadeIn delay={0.05}>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-text-subtle)] mb-4">
                    Listo
                  </p>
                </FadeIn>
                <FadeIn delay={0.1}>
                  <h1
                    className="font-serif text-[var(--c-text)] leading-[1.05] tracking-[-0.02em] mb-6"
                    style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
                  >
                    Te dimos de baja.
                  </h1>
                </FadeIn>
                <FadeIn delay={0.15}>
                  <p className="text-base text-[var(--c-text-muted)] leading-relaxed mb-10 max-w-md mx-auto">
                    No recibirás más emails de nuestra parte. Si fue un error, puedes volver a suscribirte desde la página principal.
                  </p>
                </FadeIn>
                <FadeIn delay={0.2}>
                  <Button asChild size="lg" variant="ghost">
                    <Link to="/">Volver al inicio</Link>
                  </Button>
                </FadeIn>
              </>
            ) : null}
          </div>
        </main>
        <Footer />
      </div>
    </LazyMotion>
  )
}
