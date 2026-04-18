import {
  Users,
  Image as ImageIcon,
  Eye,
  Zap,
  UserCheck,
  ExternalLink,
  Heart,
  MessageCircle,
} from "lucide-react"
import { StatCard } from "@/components/ui/StatCard"
import { InfoCard } from "@/components/ui/InfoCard"
import { LineChartCard } from "@/components/ui/charts/LineChartCard"
import { BarChartCard } from "@/components/ui/charts/BarChartCard"
import { DonutChartCard } from "@/components/ui/charts/DonutChartCard"
import { GeoBar } from "@/components/ui/charts/GeoBar"
import { HeatmapCard } from "@/components/ui/charts/HeatmapCard"
import { PostGridCard } from "@/components/ui/charts/PostGridCard"
import { MockDataBadge } from "@/components/ui/charts/MockDataBadge"
import type { InstagramAnalytics } from "@/lib/analytics/types"

interface InstagramPanelProps {
  data: InstagramAnalytics
}

export function InstagramPanel({ data }: InstagramPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      {data.mockFields.length > 0 && (
        <div>
          <MockDataBadge fields={data.mockFields} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Seguidores" value={data.followers} icon={<Users className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
        <StatCard label="Posts publicados" value={data.postsCount} icon={<ImageIcon className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
        <StatCard label="Alcance 30d" value={data.reach30d} icon={<Eye className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
        <StatCard label="Impressions 30d" value={data.impressions30d} icon={<Zap className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Profile visits" value={data.profileVisits30d} icon={<UserCheck className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
        <StatCard label="Website clicks" value={data.websiteClicks30d} icon={<ExternalLink className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
        <StatCard
          label="Engagement rate"
          value={`${data.engagementRate}%`}
          sublabel="promedio por post"
          icon={<Heart className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />}
          animate={false}
        />
      </div>

      <LineChartCard
        title="Alcance diario"
        description="Cuentas únicas que vieron tu contenido cada día"
        data={data.followersSeries.map((p) => ({ date: p.date, value: p.value }))}
        lines={[{ key: "value", label: "Alcance", color: "#E1306C" }]}
        height={280}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BarChartCard
          title="Demografía por edad"
          data={data.demographics.age.map((a) => ({ label: a.bucket, value: a.percent }))}
          color="#E1306C"
        />
        <DonutChartCard
          title="Género"
          data={data.demographics.gender.map((g) => ({ label: g.label, value: g.percent }))}
        />
      </div>

      <GeoBar title="Top ciudades" items={data.topCities} />

      <HeatmapCard
        title="Mejores horas para publicar"
        description="Día de la semana × hora del día. Más oscuro = mejor desempeño histórico."
        data={data.bestPostingHours}
      />

      <InfoCard title="Performance de Stories">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--c-text-subtle)]">Avg views</p>
            <p className="mt-1 text-xl font-semibold text-[var(--c-text)]">
              {data.storiesPerformance.avgViews.toLocaleString("es-MX")}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--c-text-subtle)]">Completion rate</p>
            <p className="mt-1 text-xl font-semibold text-[var(--c-text)]">
              {data.storiesPerformance.completionRate}%
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--c-text-subtle)]">Replies</p>
            <p className="mt-1 text-xl font-semibold text-[var(--c-text)]">
              {data.storiesPerformance.replies}
            </p>
          </div>
        </div>
      </InfoCard>

      <PostGridCard
        title="Top posts"
        aspectRatio="square"
        columns={3}
        posts={data.topPosts.map((p) => ({
          id: p.id,
          thumbnail: p.thumbnail,
          caption: p.caption,
          href: p.permalink,
          stats: [
            { icon: <Heart className="h-3 w-3" />, value: p.likes },
            { icon: <MessageCircle className="h-3 w-3" />, value: p.comments },
            { icon: <Eye className="h-3 w-3" />, value: p.reach },
          ],
        }))}
      />
    </div>
  )
}
