import { Link } from "react-router-dom"
import { footer } from "@/content/site"

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
            <p className="text-sm text-[var(--c-text-subtle)] max-w-xs leading-relaxed">
              {footer.tagline}
            </p>
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
            Desde la residencia, con cuidado.
          </p>
        </div>
      </div>
    </footer>
  )
}
