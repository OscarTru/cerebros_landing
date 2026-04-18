"use client"
import type { Colaboracion } from "@cerebros/lib"

interface KanbanCardProps {
  colaboracion: Colaboracion
  onEstadoChange: (id: string, estado: Colaboracion["estado"]) => void
}

const ESTADOS: Colaboracion["estado"][] = [
  "prospecto",
  "en_negociacion",
  "confirmada",
  "cerrada",
]

export function KanbanCard({ colaboracion, onEstadoChange }: KanbanCardProps) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3 transition-colors card-elevated"
      style={{
        background: "var(--c-surface)",
        border: "1px solid var(--c-border)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--c-border-strong)"
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--c-border)"
      }}
    >
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--c-text)" }}>
          {colaboracion.marca}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--c-text-muted)" }}>
          {colaboracion.tipo}
        </p>
      </div>

      {colaboracion.valor_mxn && (
        <p className="text-sm font-semibold" style={{ color: "var(--c-text)" }}>
          ${colaboracion.valor_mxn.toLocaleString("es-MX")} MXN
        </p>
      )}

      {colaboracion.notas && (
        <p
          className="text-xs line-clamp-2"
          style={{ color: "var(--c-text-subtle)" }}
        >
          {colaboracion.notas}
        </p>
      )}

      <select
        value={colaboracion.estado}
        onChange={(e) =>
          onEstadoChange(colaboracion.id, e.target.value as Colaboracion["estado"])
        }
        className="w-full text-xs rounded-lg px-2 py-1.5 cursor-pointer"
        style={{
          background: "var(--c-surface-2)",
          border: "1px solid var(--c-border)",
          color: "var(--c-text)",
        }}
      >
        {ESTADOS.map((e) => (
          <option key={e} value={e}>
            {e.replace("_", " ")}
          </option>
        ))}
      </select>
    </div>
  )
}
