import { Link } from "react-router-dom"
import { footer } from "@/content/site"
import { analytics } from "@/lib/analytics"

export function Footer() {
  return (
    <footer className="relative border-t border-[var(--c-border)] px-6 py-20 z-10">
      <div className="max-w-6xl mx-auto">
        {/* Top */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-5">
            <p className="font-serif text-3xl text-[var(--c-text)] mb-4">
              Cerebros Esponjosos
            </p>
            <p className="text-sm text-[var(--c-text-subtle)] max-w-xs leading-relaxed mb-6">
              {footer.tagline}
            </p>
            <div className="flex items-center gap-5">
              <a href="https://www.instagram.com/cerebros.esponjosos/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" onClick={() => analytics.socialClick("instagram")} className="text-[var(--c-text-subtle)] hover:text-[var(--c-text)] transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
                </svg>
              </a>
              <a href="https://www.tiktok.com/@cerebros.esponjosos" target="_blank" rel="noopener noreferrer" aria-label="TikTok" onClick={() => analytics.socialClick("tiktok")} className="text-[var(--c-text-subtle)] hover:text-[var(--c-text)] transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
                </svg>
              </a>
              <a href="https://www.youtube.com/@CerebrosEsponjosos" target="_blank" rel="noopener noreferrer" aria-label="YouTube" onClick={() => analytics.socialClick("youtube")} className="text-[var(--c-text-subtle)] hover:text-[var(--c-text)] transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {footer.columns.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--c-text-subtle)] mb-4">
                  {col.title}
                </p>
                <ul className="flex flex-col gap-3">
                  {col.links.map((l) => {
                    const isInternal = l.href.startsWith("/")
                    const className =
                      "text-sm text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors"
                    return (
                      <li key={l.label}>
                        {isInternal ? (
                          <Link to={l.href} className={className}>
                            {l.label}
                          </Link>
                        ) : (
                          <a href={l.href} className={className}>
                            {l.label}
                          </a>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[var(--c-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--c-text-faint)]">
          <p>{footer.copyright}</p>
          <p className="font-mono uppercase tracking-[0.2em]">
            Hecho con ♥
          </p>
        </div>
      </div>
    </footer>
  )
}
