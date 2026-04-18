"use client"
import { useState, useCallback } from "react"
import { KanbanCard } from "./KanbanCard"
import type { Colaboracion } from "@cerebros/lib"

interface KanbanBoardProps {
  initialColaboraciones: Colaboracion[]
}

const COLUMNAS: { id: Colaboracion["estado"]; label: string }[] = [
  { id: "prospecto", label: "Prospecto" },
  { id: "en_negociacion", label: "En negociación" },
  { id: "confirmada", label: "Confirmada" },
  { id: "cerrada", label: "Cerrada" },
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {COLUMNAS.map(({ id, label }) => {
        const items = colaboraciones.filter((c) => c.estado === id)
        return (
          <div
            key={id}
            className="rounded-xl p-3 flex flex-col gap-3"
            style={{
              background: "var(--c-surface-3)",
              border: "1px solid var(--c-border)",
            }}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-1">
              <h3
                className="font-medium uppercase"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.08em",
                  color: "var(--c-text-subtle)",
                }}
              >
                {label}
              </h3>
              <span
                className="px-2 py-0.5 rounded-full"
                style={{
                  color: "var(--c-text-faint)",
                  background: "var(--c-surface-2)",
                  fontSize: "10px",
                }}
              >
                {items.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2 min-h-24">
              {items.map((c) => (
                <KanbanCard
                  key={c.id}
                  colaboracion={c}
                  onEstadoChange={handleEstadoChange}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
