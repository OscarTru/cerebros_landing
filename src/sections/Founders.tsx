import { motion } from "framer-motion"
import { FadeIn } from "@/components/FadeIn"
import { founders } from "@/content/site"
import { easeOut, viewportOnce } from "@/lib/motion"

export function Founders() {
  return (
    <section
      id="nosotros"
      className="relative py-32 px-6 border-t border-[var(--c-border)] z-10"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <FadeIn className="mb-20 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-text-subtle)] mb-4">
            Quiénes somos
          </p>
          <h2
            className="font-serif text-[var(--c-text)] leading-[1.05] tracking-[-0.02em]"
            style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}
          >
            Dos residentes, <span className="italic text-[var(--c-text-muted)]">una conversación.</span>
          </h2>
        </FadeIn>

        {/* Founder blocks */}
        <div className="flex flex-col gap-24">
          {founders.map((f, i) => {
            const reverse = i % 2 === 1
            return (
              <div
                key={f.id}
                className={`grid md:grid-cols-12 gap-10 md:gap-16 items-center ${
                  reverse ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                {/* Photo — scale + fade */}
                <motion.div
                  className="md:col-span-5"
                  initial={{ opacity: 0, scale: 0.96, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={viewportOnce}
                  transition={{ duration: 0.8, ease: easeOut }}
                >
                  <div className="relative overflow-hidden rounded-2xl aspect-[4/5] bg-[var(--c-surface)] border border-[var(--c-border)]">
                    <img
                      src={f.photo}
                      alt={f.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                    />
                  </div>
                </motion.div>

                {/* Text — fade up with slight delay */}
                <motion.div
                  className="md:col-span-7"
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={viewportOnce}
                  transition={{ duration: 0.7, delay: 0.15, ease: easeOut }}
                >
                  <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--c-text-subtle)] mb-4">
                    {f.orderLabel}
                  </p>
                  <h3
                    className="font-serif text-[var(--c-text)] mb-3"
                    style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
                  >
                    {f.name}
                  </h3>
                  <p className="text-xs font-mono uppercase tracking-[0.15em] text-[var(--c-text-subtle)] mb-8">
                    {f.role}
                  </p>
                  <p
                    className="text-[var(--c-text-muted)] leading-[1.75] text-base"
                    style={{ maxWidth: "55ch" }}
                  >
                    {f.bio}
                  </p>
                </motion.div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
