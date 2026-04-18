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
      style={{
        background: "var(--c-surface)",
        border: "1px solid var(--c-border)",
        borderRadius: "12px",
        padding: "14px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--c-border-strong)"
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 6px rgba(0,0,0,0.08)"
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--c-border)"
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"
      }}
    >
      <div>
        <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--c-text)", margin: 0 }}>
          {colaboracion.marca}
        </p>
        <p style={{ fontSize: "11px", color: "var(--c-text-muted)", margin: 0, marginTop: "2px" }}>
          {colaboracion.tipo}
        </p>
      </div>

      {colaboracion.valor_mxn && (
        <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--c-text)", margin: 0 }}>
          ${colaboracion.valor_mxn.toLocaleString("es-MX")} MXN
        </p>
      )}

      {colaboracion.notas && (
        <p style={{
          fontSize: "11px",
          color: "var(--c-text-subtle)",
          margin: 0,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {colaboracion.notas}
        </p>
      )}

      <select
        value={colaboracion.estado}
        onChange={(e) =>
          onEstadoChange(colaboracion.id, e.target.value as Colaboracion["estado"])
        }
        style={{
          width: "100%",
          fontSize: "11px",
          padding: "6px 8px",
          borderRadius: "8px",
          background: "var(--c-surface-2)",
          border: "1px solid var(--c-border)",
          color: "var(--c-text)",
          cursor: "pointer",
          outline: "none",
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
