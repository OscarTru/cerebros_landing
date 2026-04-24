interface SectionProps {
  label: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
}

export function Section({ label, description, action, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--c-text-subtle)]">
            {label}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-[var(--c-text-muted)]">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  )
}
