"use client"
import { Users, Video, Heart, Share2, Play, MessageCircle } from "lucide-react"
import { InfoCard } from "@/components/ui/InfoCard"
import { LineChartCard } from "@/components/ui/charts/LineChartCard"
import { HeatmapCard } from "@/components/ui/charts/HeatmapCard"
import { PostGridCard } from "@/components/ui/charts/PostGridCard"
import { MockDataBadge } from "@/components/ui/charts/MockDataBadge"
import { Chip } from "@heroui/react"
import type { TikTokAnalytics } from "@/lib/analytics/types"

interface TikTokPanelProps {
  data: TikTokAnalytics
}

export function TikTokPanel({ data }: TikTokPanelProps) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <MockDataBadge />
      </div>

      {/* Hero stat */}
      <div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">
          · TIKTOK · AUDIENCIA ·
        </p>
        <div className="flex items-end gap-4">
          <span className="text-[96px] font-bold leading-none tracking-tight text-[var(--c-text)]">
            {data.followers.toLocaleString("es-MX")}
          </span>
          <div className="mb-3 flex flex-col gap-1">
            <span className="flex items-center gap-1.5 text-[12px] text-[var(--c-text-muted)]">
              <Users className="h-3.5 w-3.5" />
              followers
            </span>
          </div>
        </div>

        {/* Callout row */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
              <Heart className="mr-1 inline h-3 w-3" />Likes
            </p>
            <p className="text-[28px] font-bold leading-none text-[var(--c-text)]">
              {data.totalLikes.toLocaleString("es-MX")}
            </p>
            <p className="mt-1 text-[11px] text-[var(--c-text-subtle)]">totales</p>
          </div>
          <div className="rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-3">
            <p className="mb-1 text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">
              <Share2 className="mr-1 inline h-3 w-3" />Shares
            </p>
            <p className="text-[28px] font-bold leading-none text-[var(--c-text)]">
              {data.totalShares.toLocaleString("es-MX")}
            </p>
            <p className="mt-1 text-[11px] text-[var(--c-text-subtle)]">totales</p>
          </div>
          <div className="rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-3">
            <p className="mb-1 text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">
              Top video
            </p>
            <p className="mt-1 truncate text-[13px] font-semibold leading-snug text-[var(--c-text)]">
              {data.topVideos[0]?.title ?? "—"}
            </p>
            <p className="mt-1 text-[11px] text-[var(--c-text-subtle)]">
              {data.topVideos[0]?.views.toLocaleString("es-MX") ?? 0} views
            </p>
          </div>
        </div>
      </div>

      <LineChartCard
        title="Followers"
        data={data.followersSeries.map((p) => ({ date: p.date, value: p.value }))}
        lines={[{ key: "value", label: "Followers", color: "#000000" }]}
        height={240}
      />

      <PostGridCard
        title="Top videos"
        aspectRatio="portrait"
        columns={3}
        posts={data.topVideos.map((v) => ({
          id: v.id,
          thumbnail: v.thumbnail,
          title: v.title,
          stats: [
            { icon: <Play className="h-3 w-3" />, value: v.views },
            { icon: <Heart className="h-3 w-3" />, value: v.likes },
            { icon: <Share2 className="h-3 w-3" />, value: v.shares },
            { icon: <MessageCircle className="h-3 w-3" />, value: v.comments },
          ],
        }))}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <InfoCard title="Hashtags populares">
          <div className="flex flex-wrap gap-2">
            {data.topHashtags.map((h) => (
              <Chip
                key={h.tag}
                size="sm"
                variant="flat"
                classNames={{
                  base: "bg-[var(--c-surface-2)] border border-[var(--c-border)]",
                  content: "text-[12px] text-[var(--c-text)]",
                }}
              >
                #{h.tag} · {h.uses}
              </Chip>
            ))}
          </div>
        </InfoCard>
        <HeatmapCard title="Mejores horas" data={data.bestPostingHours} />
      </div>
    </div>
  )
}
