import { LazyMotion, domAnimation } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowLeft, ArrowUpRight, Mail, Mic } from "lucide-react"
import { NoiseOverlay } from "@/components/NoiseOverlay"
import { Footer } from "@/sections/Footer"
import { FadeIn } from "@/components/FadeIn"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { founders } from "@/content/site"
import { m } from "framer-motion"
import { easeOut, viewportOnce } from "@/lib/motion"
import { analytics } from "@/lib/analytics"

const CONTACT_EMAIL = "contacto@cerebrosesponjosos.com"

const AREAS = [
  "Neurociencia aplicada a la vida cotidiana",
  "Memoria, aprendizaje y rendimiento cognitivo",
  "Sueño, estrés y salud cerebral",
  "Divulgación científica: cómo comunicar ciencia sin perder rigor",
  "Enfermedades neurológicas: desmitificando el cerebro enfermo",
]

export function Speaker() {
  return (
    <LazyMotion features={domAnimation}>
      <div className="relative min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] overflow-x-hidden font-sans">
        <NoiseOverlay />

        {/* Minimal nav */}
        <nav className="relative z-20 px-6 py-6 border-b border-[var(--c-border)]">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="font-serif text-base text-[var(--c-text)]">
                Cerebros Esponjosos
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button asChild size="sm" variant="primary">
                <a href={`mailto:${CONTACT_EMAIL}?subject=Invitación como speakers`} onClick={() => analytics.speakerInquiry()}>
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Invítanos
                </a>
              </Button>
            </div>
          </div>
        </nav>

        <main className="relative z-10">

          {/* Hero */}
          <section className="px-6 pt-28 pb-20">
            <div className="max-w-6xl mx-auto">
              <FadeIn>
                <div className="flex items-center gap-2 mb-6">
                  <Mic className="h-4 w-4 text-[var(--c-text-subtle)]" aria-hidden="true" />
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-text-subtle)]">
                    Speakers · Conferencias
                  </p>
                </div>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h1
                  className="font-serif text-[var(--c-text)] leading-[0.95] tracking-[-0.03em] mb-8 max-w-4xl"
                  style={{ fontSize: "clamp(2.75rem, 7vw, 6rem)" }}
                >
                  La neurociencia,{" "}
                  <span className="italic text-[var(--c-text-faint)]">
                    explicada en vivo.
                  </span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-lg text-[var(--c-text-muted)] max-w-2xl leading-relaxed">
                  Oscar y Stephanie son residentes de neurología disponibles para
                  conferencias, talleres y eventos. Hablan de ciencia del cerebro
                  de forma que la gente entiende, recuerda y aplica.
                </p>
              </FadeIn>
            </div>
          </section>

          {/* Founders */}
          <section className="px-6 py-20 border-t border-[var(--c-border)]">
            <div className="max-w-6xl mx-auto">
              <FadeIn className="mb-14 max-w-2xl">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-text-subtle)] mb-4">
                  Quiénes somos
                </p>
                <h2
                  className="font-serif text-[var(--c-text)] leading-[1.05] tracking-[-0.02em]"
                  style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
                >
                  Dos residentes,{" "}
                  <span className="italic text-[var(--c-text-muted)]">una misión.</span>
                </h2>
              </FadeIn>

              <div className="grid md:grid-cols-2 gap-8">
                {founders.map((f, i) => (
                  <m.div
                    key={f.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={viewportOnce}
                    transition={{ duration: 0.7, delay: i * 0.1, ease: easeOut }}
                    className="flex gap-6 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6"
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-[var(--c-border)]">
                      <img
                        src={f.photo}
                        alt={f.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl text-[var(--c-text)] mb-1">{f.name}</h3>
                      <p className="text-xs text-[var(--c-text-subtle)] mb-3">{f.role}</p>
                      <p className="text-sm text-[var(--c-text-muted)] leading-relaxed line-clamp-3">
                        {f.bio}
                      </p>
                    </div>
                  </m.div>
                ))}
              </div>
            </div>
          </section>

          {/* Areas */}
          <section className="px-6 py-20 border-t border-[var(--c-border)]">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-text-subtle)] mb-4">
                  Temas
                </p>
                <h2
                  className="font-serif text-[var(--c-text)] leading-[1.05] tracking-[-0.02em]"
                  style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
                >
                  Áreas en las que{" "}
                  <span className="italic text-[var(--c-text-muted)]">podemos hablar.</span>
                </h2>
              </FadeIn>
              <FadeIn delay={0.1}>
                <ul className="flex flex-col gap-4">
                  {AREAS.map((area, i) => (
                    <li key={i} className="flex items-start gap-4 text-[var(--c-text-muted)] text-sm leading-relaxed">
                      <span className="text-[var(--c-text-faint)] font-mono text-xs mt-0.5 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {area}
                    </li>
                  ))}
                </ul>
              </FadeIn>
            </div>
          </section>

          {/* CTA */}
          <section className="px-6 py-32 border-t border-[var(--c-border)]">
            <div className="max-w-3xl mx-auto text-center">
              <FadeIn>
                <h2
                  className="font-serif text-[var(--c-text)] leading-[1.05] tracking-[-0.02em] mb-6"
                  style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}
                >
                  ¿Quieres invitarnos?
                </h2>
              </FadeIn>
              <FadeIn delay={0.1}>
                <p className="text-lg text-[var(--c-text-muted)] mb-10 max-w-xl mx-auto">
                  Cuéntanos sobre tu evento — tipo de audiencia, fecha tentativa y tema de interés.
                  Respondemos en menos de 48 horas.
                </p>
              </FadeIn>
              <FadeIn delay={0.2}>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button asChild size="lg" variant="primary">
                    <a href={`mailto:${CONTACT_EMAIL}?subject=Invitación como speakers`} onClick={() => analytics.speakerInquiry()}>
                      <Mail className="h-4 w-4" aria-hidden="true" />
                      {CONTACT_EMAIL}
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="ghost">
                    <Link to="/media-kit">
                      Ver Media Kit
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </FadeIn>
            </div>
          </section>

        </main>
        <Footer />
      </div>
    </LazyMotion>
  )
}
