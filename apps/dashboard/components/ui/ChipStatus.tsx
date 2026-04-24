"use client"
import { Chip } from "@heroui/react"
import { cn } from "@cerebros/lib"

type Status = "success" | "warning" | "error" | "neutral" | "info"

interface ChipStatusProps {
  status: Status
  label: string
  size?: "sm" | "md"
}

const statusStyles: Record<Status, string> = {
  success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/25",
  warning: "bg-amber-500/10 text-amber-500 border-amber-500/25",
  error: "bg-red-500/10 text-red-500 border-red-500/25",
  neutral: "bg-[var(--c-surface-2)] text-[var(--c-text-muted)] border-[var(--c-border)]",
  info: "bg-blue-500/10 text-blue-500 border-blue-500/25",
}

export function ChipStatus({ status, label, size = "sm" }: ChipStatusProps) {
  return (
    <Chip
      size={size}
      variant="flat"
      classNames={{
        base: cn("border", statusStyles[status]),
        content: "text-[11px] font-medium",
      }}
    >
      {label}
    </Chip>
  )
}
