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

const CONTACT_EMAIL = "contacto@cerebrosesponjosos.com"

const TOPICS = [
  {
    category: "Neurociencia aplicada",
    talks: [
      {
        title: "El cerebro que aprende: cómo la neurociencia redefine la educación",
        description:
          "Qué dice la investigación actual sobre memoria, atención y aprendizaje — y cómo aplicarlo en aulas, empresas y vida cotidiana.",
        duration: "45–60 min",
        audience: "Docentes, equipos de RRHH, público general",
      },
      {
        title: "Sueño, estrés y rendimiento: lo que nadie te dijo en la escuela",
        description:
          "La biología del descanso, la neurología del estrés crónico y por qué optimizar ambos es la intervención más efectiva para el rendimiento.",
        duration: "30–45 min",
        audience: "Empresas, universidades, atletas",
      },
      {
        title: "Neurología del hábito: por qué cambiamos y por qué no",
        description:
          "Los circuitos cerebrales detrás de la formación y el abandono de hábitos — explicados sin jerga, con aplicaciones prácticas inmediatas.",
        duration: "45 min",
        audience: "Público general, equipos de salud",
      },
    ],
  },
  {
    category: "Divulgación científica",
    talks: [
      {
        title: "Cómo comunicar ciencia sin perder rigor ni audiencia",
        description:
          "El proceso detrás de Cerebros Esponjosos: cómo dos residentes de neurología construyeron una comunidad de cientos de miles traduciendo ciencia compleja en contenido que la gente entiende y recuerda.",
        duration: "30–45 min",
        audience: "Médicos, investigadores, comunicadores de ciencia",
      },
      {
        title: "El cerebro enfermo: desmitificando las enfermedades neurológicas",
        description:
          "Epilepsia, Alzheimer, Parkinson, cefaleas — qué son realmente, cómo afectan la vida cotidiana y cómo hablar de ellas sin estigma.",
        duration: "60 min",
        audience: "Público general, pacientes y familias",
      },
    ],
  },
]

const FORMATS = [
  {
    icon: "🎤",
    title: "Conferencia magistral",
    desc: "45–90 minutos. Para congresos, eventos corporativos o universitarios. Con o sin sesión de preguntas.",
  },
  {
    icon: "🏫",
    title: "Taller participativo",
    desc: "2–4 horas. Grupos de hasta 50 personas. Dinámicas, casos clínicos simplificados y aplicación práctica.",
  },
  {
    icon: "🎙️",
    title: "Panel o mesa redonda",
    desc: "Participación como expertos en neurociencia dentro de eventos de mayor escala.",
  },
  {
    icon: "🎥",
    title: "Conferencia virtual",
    desc: "Formato online para audiencias nacionales o internacionales. Webinars, clases magistrales y eventos híbridos.",
  },
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
                <a href={`mailto:${CONTACT_EMAIL}?subject=Invitación como speakers`}>
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
                  Oscar y Stephanie son residentes de neurología y creadores de contenido con
                  cientos de miles de seguidores en español. Hablan de ciencia del cerebro
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
                  Los speakers
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
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--c-text-subtle)] mb-1">
                        {f.orderLabel}
                      </p>
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

          {/* Topics */}
          <section className="px-6 py-20 border-t border-[var(--c-border)]">
            <div className="max-w-6xl mx-auto">
              <FadeIn className="mb-14 max-w-2xl">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-text-subtle)] mb-4">
                  Temas
                </p>
                <h2
                  className="font-serif text-[var(--c-text)] leading-[1.05] tracking-[-0.02em]"
                  style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
                >
                  Conferencias{" "}
                  <span className="italic text-[var(--c-text-muted)]">disponibles.</span>
                </h2>
              </FadeIn>

              <div className="flex flex-col gap-16">
                {TOPICS.map((cat) => (
                  <div key={cat.category}>
                    <FadeIn>
                      <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--c-text-subtle)] mb-6">
                        {cat.category}
                      </p>
                    </FadeIn>
                    <div className="grid md:grid-cols-2 gap-5">
                      {cat.talks.map((talk, i) => (
                        <FadeIn key={talk.title} delay={i * 0.07}>
                          <div className="h-full rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 flex flex-col">
                            <h3
                              className="font-serif text-[var(--c-text)] leading-snug mb-3"
                              style={{ fontSize: "clamp(1.1rem, 1.8vw, 1.35rem)" }}
                            >
                              {talk.title}
                            </h3>
                            <p className="text-sm text-[var(--c-text-muted)] leading-relaxed mb-5 flex-1">
                              {talk.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[var(--c-surface-2)] border border-[var(--c-border)] text-[var(--c-text-subtle)]">
                                {talk.duration}
                              </span>
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[var(--c-surface-2)] border border-[var(--c-border)] text-[var(--c-text-subtle)]">
                                {talk.audience}
                              </span>
                            </div>
                          </div>
                        </FadeIn>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Formats */}
          <section className="px-6 py-20 border-t border-[var(--c-border)]">
            <div className="max-w-6xl mx-auto">
              <FadeIn className="mb-12 max-w-2xl">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-text-subtle)] mb-4">
                  Formatos
                </p>
                <h2
                  className="font-serif text-[var(--c-text)] leading-[1.05] tracking-[-0.02em]"
                  style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
                >
                  Cómo trabajamos{" "}
                  <span className="italic text-[var(--c-text-muted)]">juntos.</span>
                </h2>
              </FadeIn>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {FORMATS.map((f, i) => (
                  <FadeIn key={f.title} delay={i * 0.06}>
                    <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-5 h-full">
                      <span className="text-2xl mb-3 block" aria-hidden="true">{f.icon}</span>
                      <h3 className="font-serif text-base text-[var(--c-text)] mb-2">{f.title}</h3>
                      <p className="text-xs text-[var(--c-text-muted)] leading-relaxed">{f.desc}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
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
                    <a href={`mailto:${CONTACT_EMAIL}?subject=Invitación como speakers`}>
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
