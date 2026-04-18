"use client"
import { Tabs, Tab } from "@heroui/react"
import { Camera, CirclePlay, Heart } from "lucide-react"
import { StatCard } from "@/components/ui/StatCard"
import { InfoCard } from "@/components/ui/InfoCard"

interface AnalyticsData {
  igFollowers: number
  igEngagement: number
  ytTotalViews: number
  ytVideosCount: number
  totalBlogLikes: number
  topPosts: Array<{ slug: string; count: number }>
  ytVideos: Array<{ id: string; title: string; views: number; likes: number }>
}

export function AnalyticsTabsClient({ data }: { data: AnalyticsData }) {
  return (
    <Tabs
      aria-label="Analytics sections"
      variant="underlined"
      classNames={{
        tabList: "border-b border-[var(--c-border)] gap-6 w-full",
        cursor: "bg-[var(--c-invert)]",
        tab: "px-0 h-10 data-[selected=true]:text-[var(--c-text)] text-[var(--c-text-muted)]",
      }}
    >
      <Tab key="overview" title="Overview">
        <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-3">
          <StatCard label="Instagram seguidores" value={data.igFollowers} icon={Camera} />
          <StatCard label="YouTube vistas" value={data.ytTotalViews} icon={CirclePlay} />
          <StatCard label="Blog likes" value={data.totalBlogLikes} icon={Heart} />
        </div>
      </Tab>

      <Tab key="instagram" title="Instagram">
        <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
          <StatCard label="Seguidores" value={data.igFollowers} icon={Camera} />
          <StatCard
            label="Engagement promedio"
            value={data.igEngagement}
            sublabel="likes + comments por post"
            icon={Camera}
          />
        </div>
      </Tab>

      <Tab key="youtube" title="YouTube">
        <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
          <StatCard label="Vistas totales" value={data.ytTotalViews} icon={CirclePlay} />
          <StatCard label="Videos" value={data.ytVideosCount} icon={CirclePlay} />
        </div>
        {data.ytVideos.length > 0 && (
          <div className="mt-6">
            <InfoCard title="Videos" padded={false}>
              <ul className="divide-y divide-[var(--c-border)]">
                {data.ytVideos.slice(0, 5).map((v) => (
                  <li key={v.id} className="flex items-center justify-between px-5 py-3">
                    <span className="text-[13px] text-[var(--c-text)]">{v.title}</span>
                    <span className="text-[13px] font-medium text-[var(--c-text-muted)]">
                      {v.views.toLocaleString("es-MX")} vistas
                    </span>
                  </li>
                ))}
              </ul>
            </InfoCard>
          </div>
        )}
      </Tab>

      <Tab key="blog" title="Blog">
        <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
          <StatCard label="Likes totales" value={data.totalBlogLikes} icon={Heart} />
        </div>
        {data.topPosts.length > 0 && (
          <div className="mt-6">
            <InfoCard title="Posts más populares" padded={false}>
              <ul className="divide-y divide-[var(--c-border)]">
                {data.topPosts.map(({ slug, count }, i) => (
                  <li
                    key={slug}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-4 text-xs text-[var(--c-text-faint)]">
                        {i + 1}
                      </span>
                      <span className="text-[13px] text-[var(--c-text)]">{slug}</span>
                    </div>
                    <span className="text-[13px] font-medium text-[var(--c-text-muted)]">
                      {count} ❤️
                    </span>
                  </li>
                ))}
              </ul>
            </InfoCard>
          </div>
        )}
      </Tab>
    </Tabs>
  )
}
