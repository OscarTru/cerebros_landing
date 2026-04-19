import Link from "next/link"
import { cn } from "@cerebros/lib"

interface TodayStripProps {
  insight: string
  weeklyGrowth: number
  pipeline: number
  activeColabCount: number
}

export function TodayStrip({ insight, weeklyGrowth, pipeline, activeColabCount }: TodayStripProps) {
  const growthStr = weeklyGrowth >= 0 ? `+${weeklyGrowth.toLocaleString("es-MX")}` : weeklyGrowth.toLocaleString("es-MX")

  return (
    <div className="relative grid grid-cols-[1.3fr_1fr_1fr] gap-7 overflow-hidden rounded-[20px] border border-[var(--c-border)] bg-gradient-to-b from-[var(--c-surface)] to-[var(--c-bg)] p-7">
      {/* Glow top-right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full"
        style={{ background: "radial-gradient(circle, var(--c-glow) 0%, transparent 65%)" }}
      />

      {/* Col 1: Insight */}
      <div className="relative">
        <p className="mb-2.5 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--c-text-subtle)]">
          · Insight del día ·
        </p>
        <p className="text-[15px] font-medium leading-snug text-[var(--c-text)]">
          {insight}
        </p>
        <Link
          href="/agentes"
          className="mt-3 inline-flex items-center gap-1 text-[12px] text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors border-b border-[var(--c-border-strong)] pb-px"
        >
          Ver análisis completo →
        </Link>
      </div>

      {/* Col 2: Weekly growth */}
      <div className="border-l border-[var(--c-border)] pl-6">
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--c-text-subtle)]">
          Esta semana sumamos
        </p>
        <p className="text-[30px] font-semibold leading-none tracking-[-0.03em] text-[var(--c-brand-teal)]">
          {growthStr}
        </p>
        <p className="mt-1 text-[11.5px] text-[var(--c-text-muted)]">
          cerebros nuevos
        </p>
      </div>

      {/* Col 3: Pipeline */}
      <div className="border-l border-[var(--c-border)] pl-6">
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--c-text-subtle)]">
          Pipeline activo
        </p>
        <p className="text-[30px] font-semibold leading-none tracking-[-0.03em] text-[var(--c-text)]">
          ${pipeline.toLocaleString("es-MX")}
        </p>
        <p className="mt-1 text-[11.5px] text-[var(--c-text-muted)]">
          MXN · {activeColabCount} colaboraciones abiertas
        </p>
      </div>
    </div>
  )
}
