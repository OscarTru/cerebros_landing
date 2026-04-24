"use client"
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import { cn } from "@cerebros/lib"

export type ConfirmKind = "default" | "danger"

export interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  kind?: ConfirmKind
  onConfirm?: () => void | Promise<void>
}

interface InternalState extends ConfirmOptions {
  open: boolean
  resolve?: (v: boolean) => void
  loading?: boolean
}

interface ConfirmContextValue {
  confirm: (opts: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<InternalState>({ open: false, title: "" })

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setState({ ...opts, open: true, resolve, loading: false })
    })
  }, [])

  const close = useCallback((value: boolean) => {
    setState((s) => {
      s.resolve?.(value)
      return { ...s, open: false, resolve: undefined, loading: false }
    })
  }, [])

  async function handleConfirm() {
    if (state.onConfirm) {
      setState((s) => ({ ...s, loading: true }))
      try {
        await state.onConfirm()
        close(true)
      } catch (e) {
        setState((s) => ({ ...s, loading: false }))
        throw e
      }
    } else {
      close(true)
    }
  }

  // ESC closes dialog as cancel
  useEffect(() => {
    if (!state.open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !state.loading) close(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [state.open, state.loading, close])

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state.open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !state.loading && close(false)}
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="relative w-full max-w-md mx-4 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-2xl"
          >
            <div className="flex items-start gap-4 p-6">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
                  state.kind === "danger"
                    ? "border-red-500/20 bg-red-500/10 text-red-500"
                    : "border-[var(--c-border)] bg-[var(--c-surface-2)] text-[var(--c-text-muted)]"
                )}
              >
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 id="confirm-title" className="text-[15px] font-semibold leading-snug text-[var(--c-text)]">
                  {state.title}
                </h3>
                {state.description && (
                  <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--c-text-muted)]">
                    {state.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-[var(--c-border)] bg-[var(--c-surface-2)]/40 px-6 py-3 rounded-b-2xl">
              <button
                onClick={() => close(false)}
                disabled={state.loading}
                className="inline-flex h-9 items-center px-4 rounded-full border border-[var(--c-border)] bg-[var(--c-surface)] text-[12px] font-medium text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)] transition-colors disabled:opacity-50"
              >
                {state.cancelLabel ?? "Cancelar"}
              </button>
              <button
                onClick={handleConfirm}
                disabled={state.loading}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 px-5 rounded-full text-[12px] font-medium transition-opacity disabled:opacity-60",
                  state.kind === "danger"
                    ? "bg-red-500 text-white hover:opacity-90"
                    : "bg-[var(--c-invert)] text-[var(--c-invert-fg)] hover:opacity-90"
                )}
              >
                {state.loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {state.confirmLabel ?? "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm(): ConfirmContextValue["confirm"] {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error("useConfirm must be used inside <ConfirmProvider>")
  return ctx.confirm
}
