import { cn } from "@cerebros/lib"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  label: string
  value: string | number
  sublabel?: string
  icon?: LucideIcon
  trend?: { value: number; label: string }
  className?: string
}

export function MetricCard({
  label,
  value,
  sublabel,
  icon: Icon,
  trend,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl p-5",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[var(--c-text-muted)] font-medium uppercase tracking-wide">
            {label}
          </p>
          <p className="text-2xl font-semibold text-[var(--c-text)] mt-1">{value}</p>
          {sublabel && (
            <p className="text-xs text-[var(--c-text-subtle)] mt-0.5">{sublabel}</p>
          )}
        </div>
        {Icon && (
          <div className="p-2 bg-[var(--c-surface-2)] rounded-lg">
            <Icon className="w-4 h-4 text-[var(--c-text-muted)]" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-[var(--c-border)]">
          <span
            className={cn(
              "text-xs font-medium",
              trend.value >= 0 ? "text-emerald-500" : "text-red-500"
            )}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}%
          </span>
          <span className="text-xs text-[var(--c-text-subtle)] ml-1">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
