import Link from "next/link"
import { cn } from "@cerebros/lib"

interface TodayStripProps {
  insight: string
  weeklyGrowth: number
  weeklyGrowthPct?: number
  pipeline: number
  activeColabCount: number
}

// Headline + supporting detail (different from insight so they don't repeat)
const INSIGHTS: { headline: string; muted: string; detail: string }[] = [
  {
    headline: "Tus posts con preguntas",
    muted: "obtienen 40% más engagement.",
    detail: "Los que abren con una pregunta directa al lector promedian 1.124 reacciones vs. 802 de los que abren con dato.",
  },
  {
    headline: "Videos de 2-3 minutos",
    muted: "tienen mejor retención en tu canal.",
    detail: "La caída de audiencia ocurre después del minuto 3. Considera acortar los próximos videos.",
  },
  {
    headline: "Tu newsletter tiene confirm rate alto.",
    muted: "Estás atrayendo la audiencia correcta.",
    detail: "87% de tus suscriptores confirman el email — la media de la industria es 55%. Eso significa listas limpias.",
  },
  {
    headline: "'Cerebro' en el título",
    muted: "predice más likes en el blog.",
    detail: "Posts con esa palabra en el título promedian 112 likes vs. 68 del resto. Úsala con intención.",
  },
  {
    headline: "Tu audiencia en IG pica",
    muted: "entre 8 y 10pm.",
    detail: "El alcance de tus publicaciones nocturnas supera en +38% al promedio del día. Programa ahí.",
  },
]

export function TodayStrip({
  insight,
  weeklyGrowth,
  weeklyGrowthPct,
  pipeline,
  activeColabCount,
}: TodayStripProps) {
  const dayIdx = new Date().getDate() % INSIGHTS.length
  const { headline, muted, detail } = INSIGHTS[dayIdx]

  const isPositive = weeklyGrowth >= 0
  const growthStr = isPositive
    ? `+${weeklyGrowth.toLocaleString("es-MX")}`
    : weeklyGrowth.toLocaleString("es-MX")

  const pctStr = weeklyGrowthPct !== undefined
    ? ` · ${weeklyGrowthPct >= 0 ? "+" : ""}${weeklyGrowthPct}% vs. semana pasada`
    : ""

  const pipelineK =
    pipeline >= 1000
      ? `$${Math.round(pipeline / 1000)}K`
      : `$${pipeline.toLocaleString("es-MX")}`

  return (
    <div className="grid grid-cols-[1fr_260px] overflow-hidden rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)]">
      {/* Left: insight */}
      <div className="flex flex-col justify-between p-7">
        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-[var(--c-text-subtle)]">
            · INSIGHT DEL DÍA ·
          </p>
          <h2 className="text-[26px] font-bold leading-snug tracking-tight text-[var(--c-text)]">
            {headline}{" "}
            <span className="text-[var(--c-text-muted)]">{muted}</span>
          </h2>
          <p className="mt-3 max-w-lg text-[13px] leading-relaxed text-[var(--c-text-muted)]">
            {detail}
          </p>
        </div>
        <Link
          href="/agentes"
          className="mt-5 inline-flex w-fit items-center gap-1 border-b border-[var(--c-border-strong,#3f3f46)] pb-px text-[12px] text-[var(--c-text-muted)] transition-colors hover:text-[var(--c-text)]"
        >
          Ver análisis completo →
        </Link>
      </div>

      {/* Right: stats */}
      <div className="flex flex-col divide-y divide-[var(--c-border)] border-l border-[var(--c-border)]">
        <div className="flex flex-1 flex-col justify-center px-6 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--c-text-subtle)]">
            Esta semana sumamos
          </p>
          <p
            className={cn(
              "mt-1.5 text-[32px] font-bold leading-none tracking-tight",
              isPositive
                ? "text-[var(--c-brand-teal,#14b8a6)]"
                : "text-[var(--c-text-muted)]"
            )}
          >
            {growthStr}
          </p>
          <p className="mt-1 text-[11px] leading-snug text-[var(--c-text-muted)]">
            cerebros nuevos{pctStr}
          </p>
        </div>

        <div className="flex flex-1 flex-col justify-center px-6 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--c-text-subtle)]">
            Pipeline activo
          </p>
          <p className="mt-1.5 text-[32px] font-bold leading-none tracking-tight text-[var(--c-text)]">
            {pipelineK}
          </p>
          <p className="mt-1 text-[11px] text-[var(--c-text-muted)]">
            MXN · {activeColabCount} colaboraciones abiertas
          </p>
        </div>
      </div>
    </div>
  )
}
