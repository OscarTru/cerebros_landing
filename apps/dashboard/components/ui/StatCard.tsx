import { cn } from "@cerebros/lib"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { AnimatedNumber } from "./animate/AnimatedNumber"

type IconProp = LucideIcon | ReactNode

interface StatCardProps {
  label: string
  value: number | string
  sublabel?: string
  icon?: IconProp
  trend?: { value: number; label: string }
  animate?: boolean
  className?: string
}

function renderIcon(icon: IconProp) {
  if (typeof icon === "function") {
    const Icon = icon as LucideIcon
    return <Icon className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />
  }
  return icon as ReactNode
}

export function StatCard({
  label,
  value,
  sublabel,
  icon,
  trend,
  animate = true,
  className,
}: StatCardProps) {
  const isNumeric = typeof value === "number"

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-8 h-[120px] w-[120px]"
        style={{ background: "radial-gradient(circle, var(--c-glow) 0%, transparent 70%)" }}
      />

      <div className="relative mb-4 flex items-start justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--c-text-subtle)]">
          {label}
        </p>
        {icon != null && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--c-border)] bg-[var(--c-surface-2)]">
            {renderIcon(icon)}
          </div>
        )}
      </div>

      <p className="relative text-[36px] font-semibold leading-none tracking-[-0.04em] text-[var(--c-text)]">
        {isNumeric && animate ? <AnimatedNumber value={value} /> : value}
      </p>

      {sublabel && (
        <p className="relative mt-1.5 text-xs text-[var(--c-text-faint)]">{sublabel}</p>
      )}

      {trend && (
        <div className="relative mt-4 flex items-center gap-1.5 border-t border-[var(--c-border)] pt-4">
          <span
            className={cn(
              "text-xs font-medium",
              trend.value >= 0 ? "text-emerald-500" : "text-red-500"
            )}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}%
          </span>
          <span className="text-xs text-[var(--c-text-subtle)]">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
