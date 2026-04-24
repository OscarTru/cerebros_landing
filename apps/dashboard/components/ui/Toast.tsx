"use client"
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { CheckCircle2, AlertCircle, X, Loader2 } from "lucide-react"
import { cn } from "@cerebros/lib"

type ToastKind = "success" | "error" | "info" | "loading"

interface ToastItem {
  id: number
  kind: ToastKind
  title: string
  description?: string
  durationMs?: number
}

interface ToastContextValue {
  show: (t: Omit<ToastItem, "id">) => number
  dismiss: (id: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let nextId = 1

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(
    (t: Omit<ToastItem, "id">) => {
      const id = nextId++
      const item: ToastItem = { id, ...t }
      setItems((prev) => [...prev, item])
      const duration = t.durationMs ?? (t.kind === "loading" ? 0 : 4500)
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration)
      }
      return id
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ show, dismiss }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-[380px]">
        {items.map((t) => (
          <ToastCard key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>")
  return ctx
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    requestAnimationFrame(() => setEntered(true))
  }, [])

  const Icon =
    item.kind === "success" ? CheckCircle2 :
    item.kind === "error" ? AlertCircle :
    item.kind === "loading" ? Loader2 :
    CheckCircle2

  const iconColor =
    item.kind === "success" ? "text-teal-500" :
    item.kind === "error" ? "text-red-500" :
    item.kind === "loading" ? "text-[var(--c-text-muted)]" :
    "text-[var(--c-text-muted)]"

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] px-4 py-3 shadow-xl transition-all duration-300",
        entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
      role="status"
    >
      <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", iconColor, item.kind === "loading" && "animate-spin")} />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium leading-tight text-[var(--c-text)]">{item.title}</p>
        {item.description && (
          <p className="mt-0.5 text-[12px] leading-snug text-[var(--c-text-muted)]">{item.description}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)]"
        aria-label="Cerrar"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}
