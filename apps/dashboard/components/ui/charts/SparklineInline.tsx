"use client"
import { useId } from "react"
import { AreaChart, Area, ResponsiveContainer } from "recharts"

interface SparklineInlineProps {
  data: Array<{ date: string; value: number }>
  color?: string
  width?: number
  height?: number
}

export function SparklineInline({
  data,
  color = "#10b981",
  width = 80,
  height = 24,
}: SparklineInlineProps) {
  const uid = useId()
  const id = `spark-${uid.replace(/:/g, "")}`

  if (data.length === 0) {
    return <div style={{ width, height }} />
  }
  return (
    <div style={{ width, height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${id})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
