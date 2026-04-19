"use client"
import { useState, useCallback } from "react"
import { KanbanCard } from "./KanbanCard"
import type { Colaboracion } from "@cerebros/lib"
import { AnimatedNumber } from "./ui/animate/AnimatedNumber"
import { EmptyState } from "./ui/EmptyState"
import { Inbox } from "lucide-react"

interface KanbanBoardProps {
  initialColaboraciones: Colaboracion[]
}

const COLUMNAS: { id: Colaboracion["estado"]; label: string; accent: string }[] = [
  { id: "prospecto", label: "Prospecto", accent: "border-t-2 border-t-[var(--c-border-strong)]" },
  { id: "en_negociacion", label: "En negociación", accent: "border-t-2 border-t-amber-400/60" },
  { id: "confirmada", label: "Confirmada", accent: "border-t-2 border-t-emerald-400/70" },
  { id: "cerrada", label: "Cerrada", accent: "border-t-2 border-t-[var(--c-text-subtle)]" },
]

export function KanbanBoard({ initialColaboraciones }: KanbanBoardProps) {
  const [colaboraciones, setColaboraciones] = useState(initialColaboraciones)

  const handleEstadoChange = useCallback(
    async (id: string, nuevoEstado: Colaboracion["estado"]) => {
      setColaboraciones((prev) =>
        prev.map((c) => (c.id === id ? { ...c, estado: nuevoEstado } : c))
      )

      const res = await fetch(`/api/colaboraciones?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      })

      if (!res.ok) {
        setColaboraciones(initialColaboraciones)
        alert("Error al actualizar el estado")
      }
    },
    [initialColaboraciones]
  )

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {COLUMNAS.map(({ id, label, accent }) => {
        const items = colaboraciones.filter((c) => c.estado === id)
        return (
          <div
            key={id}
            className={`flex min-h-[220px] flex-col gap-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-3)] p-3.5 ${accent}`}
          >
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--c-text-subtle)]">
                {label}
              </h3>
              <span className="rounded-full border border-[var(--c-border)] bg-[var(--c-surface-2)] px-2 py-0.5 text-[10px] font-medium text-[var(--c-text-muted)]">
                <AnimatedNumber value={items.length} duration={0.6} />
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {items.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  title="Sin colaboraciones"
                  description="Las que agregues aparecerán aquí."
                />
              ) : (
                items.map((c) => (
                  <KanbanCard
                    key={c.id}
                    colaboracion={c}
                    onEstadoChange={handleEstadoChange}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
