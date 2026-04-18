import { Users, Eye, Video, Clock, Play, Heart, MessageCircle } from "lucide-react"
import { StatCard } from "@/components/ui/StatCard"
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
    <div className="flex flex-col gap-6">
      {data.mockFields.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <MockDataBadge fields={data.mockFields} />
          <a
            href="/api/youtube/oauth/start"
            className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/25 px-3 py-1 text-[11px] font-medium text-red-500 hover:bg-red-500/15 transition-colors"
          >
            Conectar YouTube Analytics →
          </a>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Subscribers" value={data.subscribers} icon={<Users className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
        <StatCard label="Vistas totales" value={data.totalViews} icon={<Eye className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
        <StatCard label="Videos" value={data.videosCount} icon={<Video className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
        <StatCard
          label="Avg view duration"
          value={formatDuration(data.avgViewDuration)}
          icon={<Clock className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />}
          animate={false}
        />
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

      <InfoCard title="Retención promedio">
        <div className="flex items-end gap-6">
          <p className="text-[48px] font-semibold leading-none tracking-[-0.04em] text-[var(--c-text)]">
            {data.retentionAvg}%
          </p>
          <p className="pb-2 text-[13px] text-[var(--c-text-muted)]">
            de duración promedio vista por los espectadores
          </p>
        </div>
      </InfoCard>

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
