import Link from "next/link"
import { cn } from "@cerebros/lib"
import type { ReactNode } from "react"

export interface AttentionItem {
  id: string
  title: ReactNode
  subtitle: string
  href: string
  cta: string
  priority: "urgent" | "info" | "ok" | "neutral"
}

const dotColor: Record<AttentionItem["priority"], string> = {
  urgent: "bg-amber-500",
  info: "bg-[var(--c-brand-teal)]",
  ok: "bg-emerald-500",
  neutral: "bg-[var(--c-border-strong)]",
}

interface AttentionQueueProps {
  items: AttentionItem[]
}

export function AttentionQueue({ items }: AttentionQueueProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)]">
      <div className="border-b border-[var(--c-border)] px-5 py-3.5">
        <p className="text-[13px] font-medium text-[var(--c-text)]">
          Tu atención, <span className="text-[var(--c-text-muted)]">hoy</span>
        </p>
      </div>
      {items.length === 0 ? (
        <div className="px-5 py-8 text-center text-[13px] text-[var(--c-text-muted)]">
          Nada urgente hoy. 🎉
        </div>
      ) : (
        <ul>
          {items.map((item, i) => (
            <li
              key={item.id}
              className={cn(
                "flex items-start gap-3.5 px-5 py-3.5",
                i > 0 && "border-t border-[var(--c-border)]"
              )}
            >
              {/* Dot */}
              <div className="mt-1.5 flex-shrink-0">
                <span className={cn("block h-2 w-2 rounded-full", dotColor[item.priority])} />
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-[var(--c-text)] leading-snug">{item.title}</p>
                <p className="mt-0.5 text-[11.5px] text-[var(--c-text-muted)]">{item.subtitle}</p>
              </div>

              {/* CTA */}
              <Link
                href={item.href}
                className="mt-0.5 flex-shrink-0 text-[12px] font-medium text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors whitespace-nowrap"
              >
                {item.cta}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
