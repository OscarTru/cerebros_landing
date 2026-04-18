import { Tooltip } from "@heroui/react"
import { AlertCircle } from "lucide-react"

interface MockDataBadgeProps {
  fields?: string[]
}

export function MockDataBadge({ fields }: MockDataBadgeProps) {
  const content = fields && fields.length > 0
    ? `Datos demo en: ${fields.join(", ")}. Conecta la API real para ver datos verdaderos.`
    : "Datos demo. Conecta la API real para ver datos verdaderos."

  return (
    <Tooltip content={content} placement="bottom">
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[10px] font-medium text-amber-600 dark:text-amber-400">
        <AlertCircle className="h-3 w-3" />
        Demo data
      </span>
    </Tooltip>
  )
}
