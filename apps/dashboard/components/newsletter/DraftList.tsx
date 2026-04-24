import Link from "next/link"
import { FileText, CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react"
import { cn } from "@cerebros/lib"

export interface DraftListItem {
  id: string
  title: string
  subject: string
  status: "draft" | "pending_approval" | "approved" | "sent" | "cancelled"
  updated_at: string
  created_by: string
}

const STATUS_CONFIG: Record<DraftListItem["status"], { label: string; cls: string; icon: typeof FileText }> = {
  draft:             { label: "Borrador",             cls: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",     icon: FileText },
  pending_approval:  { label: "Esperando aprobación",  cls: "bg-amber-500/10 text-amber-600 border-amber-500/20",  icon: AlertCircle },
  approved:          { label: "Programado",           cls: "bg-teal-500/10 text-teal-600 border-teal-500/20",     icon: Clock },
  sent:              { label: "Enviado",              cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
  cancelled:         { label: "Cancelado",            cls: "bg-zinc-400/10 text-zinc-400 border-zinc-400/20",     icon: XCircle },
}

interface Props {
  items: DraftListItem[]
  variant?: "active" | "history"
}

export function DraftList({ items, variant = "active" }: Props) {
  if (items.length === 0) {
    if (variant === "history") return null
    return (
      <div className="rounded-2xl border border-dashed border-[var(--c-border)] bg-[var(--c-surface)] px-6 py-12 text-center">
        <p className="text-[14px] text-[var(--c-text-muted)]">No hay borradores todavía. Crea el primero.</p>
      </div>
    )
  }

  const isHistory = variant === "history"

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const cfg = STATUS_CONFIG[item.status]
        const Icon = cfg.icon
        return (
          <Link
            key={item.id}
            href={`/newsletter/editor/${item.id}`}
            className={cn(
              "group flex flex-col gap-3 rounded-2xl border p-5 transition-colors",
              isHistory
                ? "border-[var(--c-border)]/60 bg-[var(--c-surface)]/50 hover:bg-[var(--c-surface)]"
                : "border-[var(--c-border)] bg-[var(--c-surface)] hover:border-[var(--c-border-strong)] hover:bg-[var(--c-surface-2)]"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p className={cn(
                "line-clamp-2 text-[14px] font-semibold",
                isHistory ? "text-[var(--c-text-muted)]" : "text-[var(--c-text)]"
              )}>{item.title}</p>
              <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium whitespace-nowrap", cfg.cls)}>
                <Icon className="h-3 w-3" />
                {cfg.label}
              </span>
            </div>
            <p className={cn(
              "line-clamp-2 text-[12px]",
              isHistory ? "text-[var(--c-text-subtle)]" : "text-[var(--c-text-muted)]"
            )}>
              {item.subject || "Sin asunto"}
            </p>
            <p className="mt-auto pt-3 border-t border-[var(--c-border)] text-[10.5px] text-[var(--c-text-subtle)]">
              {isHistory ? "Enviado" : "Actualizado"} {new Date(item.updated_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </p>
          </Link>
        )
      })}
    </div>
  )
}
