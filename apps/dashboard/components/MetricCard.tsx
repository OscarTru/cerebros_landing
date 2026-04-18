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
        "relative overflow-hidden rounded-2xl p-6 bg-[var(--c-surface)] border border-[var(--c-border)] shadow-[0_1px_4px_rgba(0,0,0,0.06)]",
        className
      )}
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-8 -right-8 w-[120px] h-[120px]"
        style={{ background: "radial-gradient(circle, var(--c-glow) 0%, transparent 70%)" }}
      />

      <div className="relative flex items-start justify-between mb-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--c-text-subtle)]">
          {label}
        </p>
        {Icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[var(--c-surface-2)] border border-[var(--c-border)]">
            <Icon className="w-3.5 h-3.5 text-[var(--c-text-muted)]" />
          </div>
        )}
      </div>

      <p className="relative text-[36px] font-semibold leading-none tracking-[-0.04em] text-[var(--c-text)]">
        {value}
      </p>

      {sublabel && (
        <p className="relative mt-1.5 text-xs text-[var(--c-text-faint)]">{sublabel}</p>
      )}

      {trend && (
        <div className="relative mt-4 pt-4 flex items-center gap-1.5 border-t border-[var(--c-border)]">
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
