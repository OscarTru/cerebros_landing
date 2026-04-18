interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-[var(--c-border)] bg-[var(--c-bg)] px-8 py-5">
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
