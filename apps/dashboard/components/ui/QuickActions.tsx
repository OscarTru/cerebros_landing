import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

export interface QuickAction {
  title: string
  subtitle: string
  href: string
}

interface QuickActionsProps {
  actions: QuickAction[]
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div>
      <p className="mb-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--c-text-subtle)]">
        · Acciones rápidas ·
      </p>
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group relative flex flex-col gap-1 rounded-[14px] border border-[var(--c-border)] bg-[var(--c-bg)] p-5 transition-all hover:border-[var(--c-border-strong)] hover:bg-[var(--c-surface)] no-underline"
          >
            <ArrowUpRight className="absolute right-4 top-4 h-3.5 w-3.5 text-[var(--c-text-subtle)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            <p className="text-[13.5px] font-medium text-[var(--c-text)]">{action.title}</p>
            <p className="text-[11.5px] text-[var(--c-text-muted)]">{action.subtitle}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
