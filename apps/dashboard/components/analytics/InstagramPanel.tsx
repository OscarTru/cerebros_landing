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
    <div className="flex flex-col gap-8">
      {data.mockFields.length > 0 && (
        <div>
          <MockDataBadge fields={data.mockFields} />
        </div>
      )}

      {/* Hero stat */}
      <div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">
          · INSTAGRAM · AUDIENCIA ·
        </p>
        <div className="flex items-end gap-4">
          <span className="text-[96px] font-bold leading-none tracking-tight text-[var(--c-text)]">
            {data.followers.toLocaleString("es-MX")}
          </span>
          <div className="mb-3 flex flex-col gap-1">
            <span className="flex items-center gap-1.5 text-[12px] text-[var(--c-text-muted)]">
              <Users className="h-3.5 w-3.5" />
              seguidores
            </span>
          </div>
        </div>

        {/* Callout row */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-3">
            <p className="mb-1 text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">
              <ImageIcon className="mr-1 inline h-3 w-3" />Posts
            </p>
            <p className="text-[28px] font-bold leading-none text-[var(--c-text)]">
              {data.postsCount}
            </p>
            <p className="mt-1 text-[11px] text-[var(--c-text-subtle)]">publicados</p>
          </div>
          <div className="rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-3">
            <p className="mb-1 text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">
              <Eye className="mr-1 inline h-3 w-3" />Alcance
            </p>
            <p className="text-[28px] font-bold leading-none text-[var(--c-text)]">
              {data.reach30d.toLocaleString("es-MX")}
            </p>
            <p className="mt-1 text-[11px] text-[var(--c-text-subtle)]">últimos 30d</p>
          </div>
          <div className="rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-3">
            <p className="mb-1 text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">
              <Heart className="mr-1 inline h-3 w-3" />Engagement
            </p>
            <p className="text-[28px] font-bold leading-none text-[var(--c-text)]">
              {data.engagementRate}%
            </p>
            <p className="mt-1 text-[11px] text-[var(--c-text-subtle)]">por post</p>
          </div>
          <div className="rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-3">
            <p className="mb-1 text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">
              <ExternalLink className="mr-1 inline h-3 w-3" />Website
            </p>
            <p className="text-[28px] font-bold leading-none text-[var(--c-text)]">
              {data.websiteClicks30d.toLocaleString("es-MX")}
            </p>
            <p className="mt-1 text-[11px] text-[var(--c-text-subtle)]">clics 30d</p>
          </div>
        </div>
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
            <p className="mt-1 text-[28px] font-bold leading-none text-[var(--c-text)]">
              {data.storiesPerformance.avgViews.toLocaleString("es-MX")}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--c-text-subtle)]">Completion rate</p>
            <p className="mt-1 text-[28px] font-bold leading-none text-[var(--c-text)]">
              {data.storiesPerformance.completionRate}%
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--c-text-subtle)]">Replies</p>
            <p className="mt-1 text-[28px] font-bold leading-none text-[var(--c-text)]">
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
