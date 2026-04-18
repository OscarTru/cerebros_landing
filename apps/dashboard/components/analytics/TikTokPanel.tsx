import { Users, Video, Heart, Share2, Play, MessageCircle } from "lucide-react"
import { StatCard } from "@/components/ui/StatCard"
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
    <div className="flex flex-col gap-6">
      <div>
        <MockDataBadge />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Followers" value={data.followers} icon={<Users className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
        <StatCard label="Videos" value={data.videosCount} icon={<Video className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
        <StatCard label="Likes totales" value={data.totalLikes} icon={<Heart className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
        <StatCard label="Shares" value={data.totalShares} icon={<Share2 className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
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
        <HeatmapCard
          title="Mejores horas"
          data={data.bestPostingHours}
        />
      </div>
    </div>
  )
}
