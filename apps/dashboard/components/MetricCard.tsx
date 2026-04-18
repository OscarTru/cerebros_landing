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
      className={cn("rounded-xl p-5 relative overflow-hidden card-elevated", className)}
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
          top: "-24px",
          right: "-24px",
          width: "100px",
          height: "100px",
          background: "radial-gradient(circle, var(--c-glow) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="flex items-start justify-between relative">
        <div>
          <p
            className="font-medium uppercase"
            style={{
              fontSize: "10px",
              letterSpacing: "0.08em",
              color: "var(--c-text-subtle)",
            }}
          >
            {label}
          </p>
          <p
            className="text-2xl font-semibold mt-1"
            style={{ color: "var(--c-text)", letterSpacing: "-0.03em" }}
          >
            {value}
          </p>
          {sublabel && (
            <p className="text-xs mt-0.5" style={{ color: "var(--c-text-faint)" }}>
              {sublabel}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className="p-2 rounded-lg"
            style={{
              background: "var(--c-surface-2)",
              border: "1px solid var(--c-border)",
            }}
          >
            <Icon className="w-4 h-4" style={{ color: "var(--c-text-muted)" }} />
          </div>
        )}
      </div>

      {trend && (
        <div
          className="mt-3 pt-3 flex items-center gap-1"
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
