"use client"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { InfoCard } from "../InfoCard"
import { formatChartDate } from "@/lib/analytics/period"

interface LineSpec {
  key: string
  label: string
  color?: string
}

interface LineChartCardProps {
  title: string
  description?: string
  data: Array<Record<string, string | number>>
  lines: LineSpec[]
  height?: number
}

const DEFAULT_COLORS = ["#0a0a0b", "#6b7280", "#10b981", "#ef4444"]

export function LineChartCard({
  title,
  description,
  data,
  lines,
  height = 240,
}: LineChartCardProps) {
  return (
    <InfoCard title={title}>
      {description && (
        <p className="-mt-2 mb-4 text-xs text-[var(--c-text-muted)]">{description}</p>
      )}
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              {lines.map((ln, i) => (
                <linearGradient key={ln.key} id={`grad-${ln.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={ln.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="100%"
                    stopColor={ln.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
                    stopOpacity={0}
                  />
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
              width={40}
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
            {lines.length > 1 && (
              <Legend
                wrapperStyle={{ fontSize: "11px", color: "var(--c-text-muted)" }}
                iconType="circle"
                iconSize={8}
              />
            )}
            {lines.map((ln, i) => (
              <Area
                key={ln.key}
                type="monotone"
                dataKey={ln.key}
                name={ln.label}
                stroke={ln.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
                strokeWidth={2}
                fill={`url(#grad-${ln.key})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </InfoCard>
  )
}
