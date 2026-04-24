"use client"
import { useState, useMemo } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { cn } from "@cerebros/lib"
import { formatChartDate } from "@/lib/analytics/period"

interface LineSpec {
  key: string
  label: string
  color: string
  currentValue?: number
}

interface AudienceChartCardProps {
  data: Array<Record<string, string | number>>
  lines: LineSpec[]
  height?: number
}

const PERIODS = [
  { key: "7d", label: "7D", days: 7 },
  { key: "30d", label: "30D", days: 30 },
  { key: "90d", label: "90D", days: 90 },
  { key: "1a", label: "1A", days: 365 },
] as const

type PeriodKey = (typeof PERIODS)[number]["key"]

export function AudienceChartCard({ data, lines, height = 260 }: AudienceChartCardProps) {
  const [period, setPeriod] = useState<PeriodKey>("30d")

  const filtered = useMemo(() => {
    const p = PERIODS.find((p) => p.key === period)!
    return data.slice(-p.days)
  }, [data, period])

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)]">
      <div className="flex items-center justify-between border-b border-[var(--c-border)] px-5 py-4">
        <p className="text-[14px] font-semibold text-[var(--c-text)]">
          Crecimiento de audiencia{" "}
          <span className="font-normal text-[var(--c-text-muted)]">· últimos {period === "1a" ? "12 meses" : period}</span>
        </p>
        <div className="flex rounded-full border border-[var(--c-border)] bg-[var(--c-surface-2)] overflow-hidden">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={cn(
                "px-3 py-1.5 text-[11px] font-medium tracking-wide transition-colors",
                period === p.key
                  ? "bg-[var(--c-invert)] text-[var(--c-invert-fg)]"
                  : "text-[var(--c-text-muted)] hover:text-[var(--c-text)]"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend with current values */}
      <div className="flex flex-wrap items-center gap-5 px-5 pt-4 pb-0">
        {lines.map((ln) => (
          <div key={ln.key} className="flex items-center gap-2">
            <span className="h-2 w-4 rounded-full" style={{ background: ln.color }} />
            <span className="text-[12px] text-[var(--c-text-muted)]">
              {ln.label}
              {ln.currentValue !== undefined && (
                <span className="ml-1 font-semibold text-[var(--c-text)]">
                  · {ln.currentValue.toLocaleString("es-MX")}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      <div className="px-2 pb-4 pt-2" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filtered} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              {lines.map((ln) => (
                <linearGradient key={ln.key} id={`ag-${ln.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ln.color} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={ln.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "var(--c-text-muted)" }}
              tickFormatter={formatChartDate}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--c-text-muted)" }}
              axisLine={false}
              tickLine={false}
              width={38}
            />
            <Tooltip
              contentStyle={{
                background: "var(--c-surface)",
                border: "1px solid var(--c-border)",
                borderRadius: "12px",
                fontSize: "12px",
              }}
              labelFormatter={formatChartDate}
            />
            {lines.map((ln) => (
              <Area
                key={ln.key}
                type="monotone"
                dataKey={ln.key}
                name={ln.label}
                stroke={ln.color}
                strokeWidth={2}
                fill={`url(#ag-${ln.key})`}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
