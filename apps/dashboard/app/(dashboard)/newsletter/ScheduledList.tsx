"use client"
import { useState } from "react"
import { Calendar, Trash2, Loader2 } from "lucide-react"
import { useConfirm } from "@/components/ui/ConfirmDialog"
import { useToast } from "@/components/ui/Toast"

export interface ScheduledItem {
  id: string
  subject: string
  scheduled_at: string
}

interface Props {
  items: ScheduledItem[]
}

export function ScheduledList({ items: initialItems }: Props) {
  const [items, setItems] = useState(initialItems)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const confirm = useConfirm()
  const toast = useToast()

  async function handleCancel(id: string, subject: string) {
    const ok = await confirm({
      title: "Cancelar envío programado",
      description: `"${subject}" no se enviará. Puedes programar un nuevo envío después.`,
      confirmLabel: "Cancelar envío",
      cancelLabel: "No, mantener",
      kind: "danger",
    })
    if (!ok) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/newsletter/scheduled?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id))
        toast.show({ kind: "success", title: "Envío cancelado" })
      } else {
        toast.show({ kind: "error", title: "No se pudo cancelar" })
      }
    } finally {
      setDeletingId(null)
    }
  }

  if (items.length === 0) return null

  return (
    <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-2)] overflow-hidden">
      <div className="flex items-center gap-2 border-b border-[var(--c-border)] px-5 py-3.5">
        <Calendar className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />
        <p className="text-[13px] font-medium text-[var(--c-text)]">
          Envíos programados{" "}
          <span className="font-normal text-[var(--c-text-muted)]">· {items.length}</span>
        </p>
      </div>
      <ul className="divide-y divide-[var(--c-border)]">
        {items.map((item) => {
          const when = new Date(item.scheduled_at)
          const isDeleting = deletingId === item.id
          return (
            <li key={item.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium text-[var(--c-text)]">
                  {item.subject}
                </p>
                <p className="mt-0.5 text-[11.5px] text-[var(--c-text-muted)]">
                  {when.toLocaleString("es-MX", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <button
                onClick={() => handleCancel(item.id, item.subject)}
                disabled={isDeleting}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--c-border)] text-[var(--c-text-muted)] hover:bg-[var(--c-surface-3)] hover:text-red-500 transition-colors disabled:opacity-40"
                aria-label="Cancelar envío"
              >
                {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
