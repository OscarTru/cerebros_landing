import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { FadeIn } from "@/components/FadeIn"
import { easeOut, viewportOnce } from "@/lib/motion"

const EBOOK_URL = "https://shop.beacons.ai/cerebros.esponjosos/5ceae34c-eccf-438a-8369-b7fdf3d2b2cd"

export function Ebook() {
  return (
    <section className="relative py-24 px-6 border-t border-[var(--c-border)] z-10">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-text-subtle)] mb-4">
            Recursos gratuitos
          </p>
          <h2
            className="font-serif text-[var(--c-text)] leading-[1.05] tracking-[-0.02em]"
            style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}
          >
            Empieza aquí.{" "}
            <span className="italic text-[var(--c-text-muted)]">Es gratis.</span>
          </h2>
        </FadeIn>

        <motion.a
          href={EBOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={viewportOnce}
          transition={{ duration: 0.7, ease: easeOut }}
          className="group relative flex flex-col sm:flex-row items-center gap-10 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-8 sm:p-12 hover:border-[var(--c-border-strong)] transition-all overflow-hidden"
        >
          {/* Background glow */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 15% 50%, var(--c-glow) 0%, transparent 60%)",
            }}
          />

          {/* Book cover */}
          <motion.div
            className="relative shrink-0 w-40 sm:w-48"
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.8, delay: 0.1, ease: easeOut }}
          >
            <img
              src="/assets/ebook-gratis.webp"
              alt="Ebook: 7 días para activar tu cerebro"
              className="w-full rounded-xl shadow-2xl group-hover:scale-[1.03] transition-transform duration-500"
            />
          </motion.div>

          {/* Text */}
          <div className="relative flex-1 min-w-0 text-center sm:text-left">
            <div className="inline-block px-3 py-0.5 rounded-full bg-[var(--c-surface-2)] border border-[var(--c-border)] text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--c-text-subtle)] mb-4">
              Ebook gratuito
            </div>
            <h3 className="font-serif leading-snug text-[var(--c-text)] mb-4"
              style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}
            >
              7 días para activar<br />
              <span className="italic text-[var(--c-text-muted)]">tu cerebro</span>
            </h3>
            <p className="text-sm text-[var(--c-text-muted)] leading-relaxed max-w-lg mb-8">
              Una guía práctica con lo que la neurociencia sabe sobre hábitos, atención y aprendizaje. Sin teoría de más — solo lo que puedes aplicar esta semana.
            </p>
            <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--c-invert)] text-[var(--c-invert-fg)] text-sm font-medium group-hover:opacity-90 transition-opacity">
              Descárgalo gratis
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
        </motion.a>
      </div>
    </section>
  )
}
