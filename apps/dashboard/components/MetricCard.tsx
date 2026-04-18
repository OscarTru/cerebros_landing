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
      className={className}
      style={{
        background: "var(--c-surface)",
        border: "1px solid var(--c-border)",
        borderRadius: "16px",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {/* Ambient glow */}
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

      {/* Icon + label row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
        <p style={{
          fontSize: "11px",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--c-text-subtle)",
          margin: 0,
        }}>
          {label}
        </p>
        {Icon && (
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--c-surface-2)",
            border: "1px solid var(--c-border)",
            flexShrink: 0,
          }}>
            <Icon style={{ width: "14px", height: "14px", color: "var(--c-text-muted)" }} />
          </div>
        )}
      </div>

      {/* Value */}
      <p style={{
        fontSize: "36px",
        fontWeight: 600,
        color: "var(--c-text)",
        letterSpacing: "-0.04em",
        lineHeight: 1,
        margin: 0,
      }}>
        {value}
      </p>

      {sublabel && (
        <p style={{ fontSize: "12px", color: "var(--c-text-faint)", marginTop: "6px" }}>
          {sublabel}
        </p>
      )}

      {trend && (
        <div style={{
          marginTop: "16px",
          paddingTop: "16px",
          borderTop: "1px solid var(--c-border)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}>
          <span style={{ fontSize: "12px", fontWeight: 500, color: trend.value >= 0 ? "#10b981" : "#ef4444" }}>
            {trend.value >= 0 ? "+" : ""}{trend.value}%
          </span>
          <span style={{ fontSize: "12px", color: "var(--c-text-subtle)" }}>
            {trend.label}
          </span>
        </div>
      )}
    </div>
  )
}
