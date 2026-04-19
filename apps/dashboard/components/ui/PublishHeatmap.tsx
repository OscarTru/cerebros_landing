"use client"

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]

// Static heatmap data: [dayIndex][hourIndex] → score 0-1
const DATA: number[][] = [
  // Dom
  [0.1, 0.1, 0.2, 0.2, 0.1, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.5, 0.3, 0.2],
  // Lun
  [0.2, 0.3, 0.3, 0.2, 0.2, 0.2, 0.3, 0.5, 0.6, 0.7, 0.8, 0.9, 0.7, 0.4, 0.2],
  // Mar
  [0.2, 0.3, 0.4, 0.3, 0.2, 0.2, 0.3, 0.5, 0.7, 0.8, 0.9, 1.0, 0.8, 0.5, 0.3],
  // Mié
  [0.1, 0.2, 0.3, 0.3, 0.2, 0.2, 0.3, 0.4, 0.6, 0.7, 0.8, 0.9, 0.7, 0.4, 0.2],
  // Jue
  [0.2, 0.3, 0.4, 0.3, 0.2, 0.2, 0.4, 0.5, 0.7, 0.8, 0.9, 0.8, 0.6, 0.4, 0.2],
  // Vie
  [0.2, 0.2, 0.3, 0.2, 0.2, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.7, 0.5],
  // Sáb
  [0.1, 0.1, 0.2, 0.2, 0.1, 0.1, 0.2, 0.3, 0.4, 0.6, 0.7, 0.8, 0.8, 0.6, 0.4],
]

function cellColor(score: number): string {
  if (score >= 0.85) return "bg-[var(--c-brand-teal)] opacity-100"
  if (score >= 0.65) return "bg-[var(--c-brand-teal)] opacity-70"
  if (score >= 0.45) return "bg-[var(--c-brand-teal)] opacity-45"
  if (score >= 0.25) return "bg-[var(--c-brand-teal)] opacity-20"
  return "bg-[var(--c-surface-2)] opacity-60"
}

interface PublishHeatmapProps {
  title?: string
}

export function PublishHeatmap({ title = "Mejores horarios para publicar" }: PublishHeatmapProps) {
  return (
    <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--c-text-subtle)]">
        {title}
      </p>
      <p className="mb-5 text-xs text-[var(--c-text-faint)]">Basado en engagement histórico · hora Ciudad de México</p>

      <div className="overflow-x-auto">
        <div className="min-w-[520px]">
          {/* Hour labels */}
          <div className="mb-1 flex">
            <div className="w-9 shrink-0" />
            {HOURS.map((h) => (
              <div
                key={h}
                className="flex-1 text-center text-[10px] text-[var(--c-text-faint)]"
              >
                {h}h
              </div>
            ))}
          </div>

          {/* Rows */}
          {DAYS.map((day, di) => (
            <div key={day} className="mb-1 flex items-center gap-1">
              <div className="w-8 shrink-0 text-[10px] text-[var(--c-text-subtle)]">{day}</div>
              {HOURS.map((_, hi) => {
                const score = DATA[di][hi]
                return (
                  <div
                    key={hi}
                    title={`${day} ${HOURS[hi]}h — score ${Math.round(score * 100)}%`}
                    className={`h-5 flex-1 rounded-sm transition-opacity ${cellColor(score)}`}
                  />
                )
              })}
            </div>
          ))}

          {/* Legend */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[10px] text-[var(--c-text-faint)]">Menos</span>
            {[0.1, 0.3, 0.55, 0.75, 0.95].map((s) => (
              <div key={s} className={`h-3 w-5 rounded-sm ${cellColor(s)}`} />
            ))}
            <span className="text-[10px] text-[var(--c-text-faint)]">Más</span>
          </div>
        </div>
      </div>
    </div>
  )
}
