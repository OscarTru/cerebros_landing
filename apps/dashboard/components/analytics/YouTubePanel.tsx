import { Users, Eye, Video, Clock, Play, Heart, MessageCircle } from "lucide-react"
import { InfoCard } from "@/components/ui/InfoCard"
import { LineChartCard } from "@/components/ui/charts/LineChartCard"
import { DonutChartCard } from "@/components/ui/charts/DonutChartCard"
import { GeoBar } from "@/components/ui/charts/GeoBar"
import { PostGridCard } from "@/components/ui/charts/PostGridCard"
import { MockDataBadge } from "@/components/ui/charts/MockDataBadge"
import type { YouTubeAnalytics } from "@/lib/analytics/types"

interface YouTubePanelProps {
  data: YouTubeAnalytics
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function YouTubePanel({ data }: YouTubePanelProps) {
  return (
    <div className="flex flex-col gap-8">
      {data.mockFields.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <MockDataBadge fields={data.mockFields} />
          <a
            href="/api/youtube/oauth/start"
            className="inline-flex items-center gap-1.5 rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1 text-[11px] font-medium text-red-500 transition-colors hover:bg-red-500/15"
          >
            Conectar YouTube Analytics →
          </a>
        </div>
      )}

      {/* Hero stat */}
      <div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">
          · YOUTUBE · CANAL ·
        </p>
        <div className="flex items-end gap-4">
          <span className="text-[96px] font-bold leading-none tracking-tight text-[var(--c-text)]">
            {data.subscribers.toLocaleString("es-MX")}
          </span>
          <div className="mb-3 flex flex-col gap-1">
            <span className="flex items-center gap-1.5 text-[12px] text-[var(--c-text-muted)]">
              <Users className="h-3.5 w-3.5" />
              suscriptores
            </span>
          </div>
        </div>

        {/* Callout row */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-3">
            <p className="mb-1 text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">
              <Eye className="mr-1 inline h-3 w-3" />Vistas
            </p>
            <p className="text-[28px] font-bold leading-none text-[var(--c-text)]">
              {data.totalViews.toLocaleString("es-MX")}
            </p>
            <p className="mt-1 text-[11px] text-[var(--c-text-subtle)]">totales</p>
          </div>
          <div className="rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-3">
            <p className="mb-1 text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">
              <Video className="mr-1 inline h-3 w-3" />Videos
            </p>
            <p className="text-[28px] font-bold leading-none text-[var(--c-text)]">
              {data.videosCount}
            </p>
            <p className="mt-1 text-[11px] text-[var(--c-text-subtle)]">publicados</p>
          </div>
          <div className="rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-3">
            <p className="mb-1 text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">
              <Clock className="mr-1 inline h-3 w-3" />Duración avg
            </p>
            <p className="text-[28px] font-bold leading-none text-[var(--c-text)]">
              {formatDuration(data.avgViewDuration)}
            </p>
            <p className="mt-1 text-[11px] text-[var(--c-text-subtle)]">por vista</p>
          </div>
          <div className="rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-3">
            <p className="mb-1 text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">
              Retención
            </p>
            <p className="text-[28px] font-bold leading-none text-[var(--c-text)]">
              {data.retentionAvg}%
            </p>
            <p className="mt-1 text-[11px] text-[var(--c-text-subtle)]">promedio</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LineChartCard
          title="Vistas"
          data={data.viewsSeries.map((p) => ({ date: p.date, value: p.value }))}
          lines={[{ key: "value", label: "Vistas", color: "#FF0000" }]}
          height={240}
        />
        <LineChartCard
          title="Suscriptores ganados"
          data={data.subsGainedSeries.map((p) => ({ date: p.date, value: p.value }))}
          lines={[{ key: "value", label: "Subs", color: "#10b981" }]}
          height={240}
        />
      </div>

      <PostGridCard
        title="Top 5 videos"
        aspectRatio="video"
        columns={3}
        posts={data.topVideos.map((v) => ({
          id: v.id,
          thumbnail: v.thumbnail,
          title: v.title,
          href: `https://www.youtube.com/watch?v=${v.id}`,
          stats: [
            { icon: <Play className="h-3 w-3" />, value: v.views },
            { icon: <Heart className="h-3 w-3" />, value: v.likes },
            { icon: <MessageCircle className="h-3 w-3" />, value: v.comments },
          ],
        }))}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DonutChartCard
          title="Tráfico por fuente"
          data={data.trafficSources.map((s) => ({ label: s.source, value: s.percent }))}
        />
        <GeoBar
          title="Top países"
          items={data.topCountries.map((c) => ({ name: c.name, percent: c.percent }))}
        />
      </div>
    </div>
  )
}
