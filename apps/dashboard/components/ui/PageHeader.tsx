import { cn } from "@cerebros/lib"
import type { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  eyebrow?: string
  variant?: "default" | "editorial"
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow,
  variant = "default",
  className,
}: PageHeaderProps) {
  if (variant === "editorial") {
    return (
      <header
        className={cn(
          "flex items-end justify-between gap-6 border-b border-[var(--c-border)] bg-[var(--c-bg)] px-8 py-6",
          className
        )}
      >
        <div>
          {eyebrow && (
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--c-text-subtle)]">
              {eyebrow}
            </p>
          )}
          <h1 className="text-[34px] font-semibold leading-none tracking-[-0.02em] text-[var(--c-text)]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-[13px] text-[var(--c-text-muted)]">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </header>
    )
  }

  return (
    <header
      className={cn(
        "flex items-start justify-between gap-4 border-b border-[var(--c-border)] bg-[var(--c-bg)] px-8 py-5",
        className
      )}
    >
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-[var(--c-text)]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-[var(--c-text-muted)]">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  )
}
