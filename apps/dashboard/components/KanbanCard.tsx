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
    <div className="bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl p-4 space-y-3 hover:border-[var(--c-border-strong)] transition-colors">
      <div>
        <p className="text-sm font-medium text-[var(--c-text)]">{colaboracion.marca}</p>
        <p className="text-xs text-[var(--c-text-muted)] mt-0.5">{colaboracion.tipo}</p>
      </div>

      {colaboracion.valor_mxn && (
        <p className="text-sm font-semibold text-[var(--c-text)]">
          ${colaboracion.valor_mxn.toLocaleString("es-MX")} MXN
        </p>
      )}

      {colaboracion.notas && (
        <p className="text-xs text-[var(--c-text-subtle)] line-clamp-2">{colaboracion.notas}</p>
      )}

      <select
        value={colaboracion.estado}
        onChange={(e) =>
          onEstadoChange(colaboracion.id, e.target.value as Colaboracion["estado"])
        }
        className="w-full text-xs bg-[var(--c-surface)] border border-[var(--c-border)] rounded-lg px-2 py-1.5 text-[var(--c-text)] cursor-pointer"
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
