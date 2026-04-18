"use client"
import { motion } from "framer-motion"
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react"
import { MoreHorizontal } from "lucide-react"
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
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
      transition={{ duration: 0.15 }}
      className="flex flex-col gap-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-[var(--c-text)]">
            {colaboracion.marca}
          </p>
          <p className="truncate text-[11px] text-[var(--c-text-muted)]">
            {colaboracion.tipo}
          </p>
        </div>
        <Dropdown>
          <DropdownTrigger>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="h-6 w-6 min-w-6"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Acciones" variant="flat">
            {ESTADOS.filter((e) => e !== colaboracion.estado).map((e) => (
              <DropdownItem
                key={e}
                onPress={() => onEstadoChange(colaboracion.id, e)}
              >
                Mover a {e.replace("_", " ")}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>

      {colaboracion.valor_mxn && (
        <p className="text-[13px] font-semibold text-[var(--c-text)]">
          ${colaboracion.valor_mxn.toLocaleString("es-MX")} MXN
        </p>
      )}

      {colaboracion.notas && (
        <p className="line-clamp-2 text-[11px] text-[var(--c-text-subtle)]">
          {colaboracion.notas}
        </p>
      )}
    </motion.div>
  )
}
