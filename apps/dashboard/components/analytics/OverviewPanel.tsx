import { Users, TrendingUp, Eye, Star } from "lucide-react"
import { StatCard } from "@/components/ui/StatCard"
import { LineChartCard } from "@/components/ui/charts/LineChartCard"
import { DonutChartCard } from "@/components/ui/charts/DonutChartCard"
import { ComparisonTable } from "@/components/ui/charts/ComparisonTable"
import type { AnalyticsSummary } from "@/lib/analytics/types"

interface OverviewPanelProps {
  data: AnalyticsSummary
}

export function OverviewPanel({ data }: OverviewPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Audiencia total"
          value={data.totalAudience}
          icon={<Users className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />}
        />
        <StatCard
          label="Engagement promedio"
          value={`${data.avgEngagementRate}%`}
          icon={<TrendingUp className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />}
          animate={false}
        />
        <StatCard
          label="Alcance acumulado"
          value={data.totalReach}
          icon={<Eye className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />}
        />
        <StatCard
          label="Top post"
          value={data.topPost?.metric ?? "—"}
          sublabel={data.topPost?.title}
          icon={<Star className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />}
          animate={false}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LineChartCard
          title="Audiencia por plataforma"
          data={data.audienceSeries}
          lines={[
            { key: "instagram", label: "Instagram", color: "#E1306C" },
            { key: "youtube", label: "YouTube", color: "#FF0000" },
            { key: "tiktok", label: "TikTok", color: "#000000" },
            { key: "newsletter", label: "Newsletter", color: "#10b981" },
          ]}
          height={260}
        />
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
          height={260}
        />
      </div>

      <ComparisonTable title="Comparativa por plataforma" rows={data.platformsComparison} />
    </div>
  )
}
