import type { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)]">
        <Icon className="h-5 w-5 text-[var(--c-text-muted)]" />
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--c-text)]">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-[var(--c-text-muted)]">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
