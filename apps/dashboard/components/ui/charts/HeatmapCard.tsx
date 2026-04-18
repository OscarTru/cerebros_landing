"use client"
import { InfoCard } from "../InfoCard"
import { Tooltip } from "@heroui/react"

interface HeatmapCardProps {
  title: string
  description?: string
  data: Array<{ day: number; hour: number; score: number }>
}

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
const HOURS_SHOWN = [0, 3, 6, 9, 12, 15, 18, 21]

export function HeatmapCard({ title, description, data }: HeatmapCardProps) {
  const grid: Record<string, number> = {}
  for (const d of data) {
    grid[`${d.day}-${d.hour}`] = d.score
  }

  function cellColor(score: number): string {
    const alpha = 0.08 + score * 0.82
    return `rgba(10, 10, 11, ${alpha})`
  }

  return (
    <InfoCard title={title}>
      {description && (
        <p className="-mt-2 mb-4 text-xs text-[var(--c-text-muted)]">{description}</p>
      )}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <div className="w-10" />
          {Array.from({ length: 24 }).map((_, h) => (
            <div
              key={h}
              className="flex-1 text-center text-[9px] text-[var(--c-text-subtle)]"
            >
              {HOURS_SHOWN.includes(h) ? `${h}h` : ""}
            </div>
          ))}
        </div>
        {DAY_LABELS.map((day, dayIdx) => (
          <div key={dayIdx} className="flex items-center gap-1">
            <div className="w-10 text-[10px] font-medium text-[var(--c-text-muted)]">{day}</div>
            {Array.from({ length: 24 }).map((_, h) => {
              const score = grid[`${dayIdx}-${h}`] ?? 0
              return (
                <Tooltip
                  key={h}
                  content={`${day} ${h}:00 — score ${Math.round(score * 100)}`}
                  delay={0}
                  closeDelay={0}
                >
                  <div
                    className="flex-1 rounded-sm"
                    style={{
                      height: 18,
                      background: cellColor(score),
                      border: "1px solid var(--c-border)",
                    }}
                  />
                </Tooltip>
              )
            })}
          </div>
        ))}
      </div>
    </InfoCard>
  )
}
