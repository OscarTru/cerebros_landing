import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { LineChartCard } from "@/components/ui/charts/LineChartCard"
import { DonutChartCard } from "@/components/ui/charts/DonutChartCard"
import { ComparisonTable } from "@/components/ui/charts/ComparisonTable"
import { PublishHeatmap } from "@/components/ui/PublishHeatmap"
import type { AnalyticsSummary } from "@/lib/analytics/types"

interface OverviewPanelProps {
  data: AnalyticsSummary
}

function TrendChip({ value }: { value: number }) {
  if (value > 0)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-500">
        <TrendingUp className="h-3 w-3" />+{value.toLocaleString("es-MX")} esta semana
      </span>
    )
  if (value < 0)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-500">
        <TrendingDown className="h-3 w-3" />{value.toLocaleString("es-MX")} esta semana
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--c-surface-2)] px-2.5 py-0.5 text-xs font-medium text-[var(--c-text-subtle)]">
      <Minus className="h-3 w-3" />Sin cambio esta semana
    </span>
  )
}

function weeklyGrowth(data: AnalyticsSummary): number {
  const as = data.audienceSeries
  if (as.length < 2) return 0
  const lastWeekStart = Math.max(0, as.length - 8)
  const start =
    (as[lastWeekStart]?.instagram ?? 0) +
    (as[lastWeekStart]?.youtube ?? 0) +
    (as[lastWeekStart]?.tiktok ?? 0) +
    (as[lastWeekStart]?.newsletter ?? 0)
  const end =
    (as[as.length - 1]?.instagram ?? 0) +
    (as[as.length - 1]?.youtube ?? 0) +
    (as[as.length - 1]?.tiktok ?? 0) +
    (as[as.length - 1]?.newsletter ?? 0)
  return end - start
}

const CALLOUTS = [
  {
    key: "engagement",
    label: "Engagement",
    getValue: (d: AnalyticsSummary) => `${d.avgEngagementRate}%`,
    note: "Promedio ponderado entre plataformas activas",
  },
  {
    key: "reach",
    label: "Alcance acumulado",
    getValue: (d: AnalyticsSummary) =>
      d.totalReach >= 1_000_000
        ? `${(d.totalReach / 1_000_000).toFixed(1)}M`
        : d.totalReach >= 1_000
        ? `${(d.totalReach / 1_000).toFixed(1)}K`
        : d.totalReach.toLocaleString("es-MX"),
    note: "Personas únicas alcanzadas en 30 días",
  },
  {
    key: "topPost",
    label: "Top post",
    getValue: (d: AnalyticsSummary) => d.topPost?.metric ?? "—",
    note: (d: AnalyticsSummary) => d.topPost?.title ?? "Sin datos",
  },
] as const

export function OverviewPanel({ data }: OverviewPanelProps) {
  const growth = weeklyGrowth(data)

  return (
    <div className="flex flex-col gap-6">
      {/* Hero stat */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-8 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--c-text-subtle)]">
            Audiencia total
          </p>
          <p className="text-[96px] font-semibold leading-none tracking-[-0.04em] text-[var(--c-text)]">
            {data.totalAudience >= 1_000_000
              ? `${(data.totalAudience / 1_000_000).toFixed(1)}M`
              : data.totalAudience >= 1_000
              ? `${(data.totalAudience / 1_000).toFixed(1)}K`
              : data.totalAudience.toLocaleString("es-MX")}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <TrendChip value={growth} />
            <span className="text-xs text-[var(--c-text-faint)]">
              suma de seguidores activos en todas las plataformas
            </span>
          </div>
        </div>
        <div className="col-span-4">
          <DonutChartCard
            title="Distribución de audiencia"
            data={data.audienceByPlatform.map((p) => ({
              label: p.label,
              value: p.count,
              color:
                p.platform === "instagram" ? "#E1306C"
                : p.platform === "youtube" ? "#FF0000"
                : p.platform === "tiktok" ? "#000000"
                : "#10b981",
            }))}
            height={220}
          />
        </div>
      </div>

      {/* ¿Qué cambió esta semana? */}
      <div>
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--c-text-subtle)]">
          ¿Qué cambió esta semana?
        </p>
        <div className="grid grid-cols-3 gap-4">
          {CALLOUTS.map((c) => {
            const note = typeof c.note === "function" ? c.note(data) : c.note
            return (
              <div
                key={c.key}
                className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
              >
                <span className="inline-block rounded-full border border-[var(--c-brand-teal)]/30 bg-[var(--c-brand-teal)]/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--c-brand-teal)]">
                  {c.label}
                </span>
                <p className="mt-3 text-[28px] font-semibold leading-none tracking-[-0.03em] text-[var(--c-text)]">
                  {c.getValue(data)}
                </p>
                <p className="mt-2 text-xs text-[var(--c-text-faint)]">{note}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Growth chart */}
      <LineChartCard
        title="Audiencia por plataforma · últimos 30 días"
        data={data.audienceSeries}
        lines={[
          { key: "instagram", label: "Instagram", color: "#E1306C" },
          { key: "youtube", label: "YouTube", color: "#FF0000" },
          { key: "tiktok", label: "TikTok", color: "#000000" },
          { key: "newsletter", label: "Newsletter", color: "#10b981" },
        ]}
        height={260}
      />

      {/* Comparison table + heatmap */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <ComparisonTable title="Comparativa por plataforma" rows={data.platformsComparison} />
        </div>
        <div className="col-span-5">
          <PublishHeatmap />
        </div>
      </div>
    </div>
  )
}
