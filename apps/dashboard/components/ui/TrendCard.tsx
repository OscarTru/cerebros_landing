"use client"
import { cn } from "@cerebros/lib"
import type { LucideIcon } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer } from "recharts"
import { AnimatedNumber } from "./animate/AnimatedNumber"

interface TrendCardProps {
  label: string
  value: number
  icon?: LucideIcon
  trendData: Array<{ day: string; value: number }>
  trendPercent?: number
  className?: string
}

export function TrendCard({
  label,
  value,
  icon: Icon,
  trendData,
  trendPercent,
  className,
}: TrendCardProps) {
  const isPositive = (trendPercent ?? 0) >= 0
  const strokeColor = isPositive ? "#10b981" : "#ef4444"

  return (
    <div
      className={cn(
        "relative flex min-h-[180px] flex-col justify-between overflow-hidden rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-8 h-[120px] w-[120px]"
        style={{ background: "radial-gradient(circle, var(--c-glow) 0%, transparent 70%)" }}
      />

      <div className="relative">
        <div className="mb-4 flex items-start justify-between">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--c-text-subtle)]">
            {label}
          </p>
          {Icon && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--c-border)] bg-[var(--c-surface-2)]">
              <Icon className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />
            </div>
          )}
        </div>

        <p className="text-[32px] font-semibold leading-none tracking-[-0.04em] text-[var(--c-text)]">
          <AnimatedNumber value={value} />
        </p>

        {trendPercent !== undefined && (
          <p
            className={cn(
              "mt-2 text-xs font-medium",
              isPositive ? "text-emerald-500" : "text-red-500"
            )}
          >
            {isPositive ? "+" : ""}
            {trendPercent}% <span className="text-[var(--c-text-subtle)]">últimos 30d</span>
          </p>
        )}
      </div>

      <div className="relative -mx-6 -mb-6 mt-2 h-16">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={strokeColor}
              strokeWidth={2}
              fill={`url(#grad-${label})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
