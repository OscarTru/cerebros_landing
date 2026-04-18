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
      className={cn("rounded-2xl p-6 relative overflow-hidden card-elevated", className)}
      style={{
        background: "var(--c-surface)",
        border: "1px solid var(--c-border)",
      }}
    >
      {/* Ambient glow top-right */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-32px",
          right: "-32px",
          width: "120px",
          height: "120px",
          background: "radial-gradient(circle, var(--c-glow) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Icon */}
      {Icon && (
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
          style={{
            background: "var(--c-surface-2)",
            border: "1px solid var(--c-border)",
          }}
        >
          <Icon className="w-4 h-4" style={{ color: "var(--c-text-muted)" }} />
        </div>
      )}

      {/* Label */}
      <p
        className="font-medium uppercase mb-2"
        style={{
          fontSize: "10px",
          letterSpacing: "0.1em",
          color: "var(--c-text-subtle)",
        }}
      >
        {label}
      </p>

      {/* Value */}
      <p
        className="text-3xl font-semibold"
        style={{ color: "var(--c-text)", letterSpacing: "-0.04em", lineHeight: 1 }}
      >
        {value}
      </p>

      {sublabel && (
        <p className="text-xs mt-2" style={{ color: "var(--c-text-faint)" }}>
          {sublabel}
        </p>
      )}

      {trend && (
        <div
          className="mt-4 pt-4 flex items-center gap-1.5"
          style={{ borderTop: "1px solid var(--c-border)" }}
        >
          <span
            className="text-xs font-medium"
            style={{ color: trend.value >= 0 ? "#10b981" : "#ef4444" }}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}%
          </span>
          <span className="text-xs" style={{ color: "var(--c-text-subtle)" }}>
            {trend.label}
          </span>
        </div>
      )}
    </div>
  )
}
