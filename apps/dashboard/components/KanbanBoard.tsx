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
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "16px",
    }}>
      {COLUMNAS.map(({ id, label }) => {
        const items = colaboraciones.filter((c) => c.estado === id)
        return (
          <div
            key={id}
            style={{
              background: "var(--c-surface-3)",
              border: "1px solid var(--c-border)",
              borderRadius: "16px",
              padding: "14px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              minHeight: "180px",
            }}
          >
            {/* Column header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 4px",
            }}>
              <h3 style={{
                fontSize: "10px",
                fontWeight: 600,
                color: "var(--c-text-subtle)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                margin: 0,
              }}>
                {label}
              </h3>
              <span style={{
                fontSize: "10px",
                fontWeight: 500,
                padding: "2px 8px",
                borderRadius: "999px",
                color: "var(--c-text-muted)",
                background: "var(--c-surface-2)",
                border: "1px solid var(--c-border)",
              }}>
                {items.length}
              </span>
            </div>

            {/* Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
