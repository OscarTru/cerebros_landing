"use client"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { InfoCard } from "../InfoCard"

interface DonutChartCardProps {
  title: string
  data: Array<{ label: string; value: number; color?: string }>
  height?: number
}

const DEFAULT_COLORS = ["#0a0a0b", "#6b7280", "#a1a1aa", "#d4d4d4", "#f4f4f5"]

export function DonutChartCard({ title, data, height = 240 }: DonutChartCardProps) {
  const total = data.reduce((a, b) => a + b.value, 0)
  return (
    <InfoCard title={title}>
      <div className="flex items-center gap-6" style={{ minHeight: height }}>
        <div style={{ width: "50%", height }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={2}
                stroke="var(--c-bg)"
                strokeWidth={2}
              >
                {data.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--c-surface)",
                  border: "1px solid var(--c-border)",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="flex flex-1 flex-col gap-2">
          {data.map((d, i) => {
            const pct = total > 0 ? Math.round((d.value / total) * 100) : 0
            return (
              <li key={i} className="flex items-center gap-2 text-[12px]">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: d.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}
                />
                <span className="flex-1 text-[var(--c-text)]">{d.label}</span>
                <span className="font-medium text-[var(--c-text-muted)]">{pct}%</span>
              </li>
            )
          })}
        </ul>
      </div>
    </InfoCard>
  )
}
