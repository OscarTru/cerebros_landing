import { m } from "framer-motion"
import { Link } from "react-router-dom"
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
        <m.div
          className="w-[900px] h-[900px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, var(--c-glow) 0%, transparent 60%)",
          }}
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
        {/* Title */}
        <FadeIn delay={0.1}>
          <h1
            className="font-serif leading-[0.95] tracking-[-0.03em] mb-4"
            style={{ fontSize: "clamp(3rem, 8vw, 7.5rem)" }}
          >
            <span className="block text-[var(--c-text)]">{hero.titleTop}</span>
            <span className="block italic text-[var(--c-text-faint)]">
              {hero.titleBottom}
            </span>
          </h1>
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="w-8 h-px bg-[var(--c-border-strong)]" aria-hidden="true" />
            <p className="font-serif italic text-xl text-[var(--c-text-muted)] tracking-wide">
              Oscar &amp; Steph
            </p>
            <span className="w-8 h-px bg-[var(--c-border-strong)]" aria-hidden="true" />
          </div>
        </FadeIn>

        {/* Subcopy */}
        <FadeIn delay={0.2}>
          <p className="text-lg text-[var(--c-text-muted)] max-w-xl mx-auto mb-10 leading-relaxed">
            {hero.subcopy}
          </p>
        </FadeIn>

        {/* Social icons */}
        <FadeIn delay={0.25}>
          <div className="flex items-center gap-6 mb-12">
            <a href="https://www.instagram.com/cerebros.esponjosos/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-[var(--c-text-subtle)] hover:text-[var(--c-text)] transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <a href="https://www.tiktok.com/@cerebros.esponjosos" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-[var(--c-text-subtle)] hover:text-[var(--c-text)] transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
              </svg>
            </a>
            <a href="https://www.youtube.com/@CerebrosEsponjosos" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-[var(--c-text-subtle)] hover:text-[var(--c-text)] transition-colors">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
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
              <Link to={hero.ctaSecondary.href}>
                {hero.ctaSecondary.label}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </FadeIn>
      </div>

    </section>
  )
}
