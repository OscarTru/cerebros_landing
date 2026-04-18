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
    <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-[var(--c-border-strong)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition-all">
      <div>
        <p className="text-[13px] font-medium text-[var(--c-text)]">{colaboracion.marca}</p>
        <p className="text-[11px] text-[var(--c-text-muted)] mt-0.5">{colaboracion.tipo}</p>
      </div>

      {colaboracion.valor_mxn && (
        <p className="text-[13px] font-semibold text-[var(--c-text)]">
          ${colaboracion.valor_mxn.toLocaleString("es-MX")} MXN
        </p>
      )}

      {colaboracion.notas && (
        <p className="text-[11px] text-[var(--c-text-subtle)] line-clamp-2">
          {colaboracion.notas}
        </p>
      )}

      <select
        value={colaboracion.estado}
        onChange={(e) =>
          onEstadoChange(colaboracion.id, e.target.value as Colaboracion["estado"])
        }
        className="w-full text-[11px] px-2 py-1.5 rounded-lg bg-[var(--c-surface-2)] border border-[var(--c-border)] text-[var(--c-text)] cursor-pointer outline-none focus:border-[var(--c-border-strong)]"
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
