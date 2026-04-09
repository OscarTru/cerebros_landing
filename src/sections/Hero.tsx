import { motion } from "framer-motion"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/FadeIn"
import { hero } from "@/content/site"

export function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-20 overflow-hidden"
    >
      {/* Radial background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <motion.div
          className="w-[900px] h-[900px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 60%)",
          }}
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
        {/* Logo */}
        <motion.div
          className="mb-12 relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)",
              filter: "blur(20px)",
            }}
          />
          <img
            src="/assets/brain.png"
            alt="Cerebros Esponjosos logo"
            className="relative w-full h-full object-contain"
            style={{ mixBlendMode: "screen" }}
          />
        </motion.div>

        {/* Eyebrow */}
        <FadeIn>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.02] text-xs font-medium text-zinc-400 mb-8">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            {hero.eyebrow}
          </div>
        </FadeIn>

        {/* Title */}
        <FadeIn delay={0.1}>
          <h1
            className="font-serif leading-[0.95] tracking-[-0.03em] mb-8"
            style={{ fontSize: "clamp(3rem, 8vw, 7.5rem)" }}
          >
            <span className="block text-white">{hero.titleTop}</span>
            <span className="block italic text-zinc-500">
              {hero.titleBottom}
            </span>
          </h1>
        </FadeIn>

        {/* Subcopy */}
        <FadeIn delay={0.2}>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto mb-12 leading-relaxed">
            {hero.subcopy}
          </p>
        </FadeIn>

        {/* CTAs */}
        <FadeIn delay={0.3}>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button
              size="lg"
              variant="primary"
              onClick={() =>
                document
                  .querySelector(hero.ctaPrimary.target)
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              {hero.ctaPrimary.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button asChild size="lg" variant="ghost">
              <a href={hero.ctaSecondary.href}>
                {hero.ctaSecondary.label}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
          </div>
        </FadeIn>
      </div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        aria-hidden="true"
      >
        <motion.div
          className="w-px h-10 bg-gradient-to-b from-transparent via-white/40 to-transparent"
          animate={{ scaleY: [0.3, 1, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  )
}
