import { Heart, BookOpen, TrendingUp } from "lucide-react"
import { StatCard } from "@/components/ui/StatCard"
import { InfoCard } from "@/components/ui/InfoCard"
import { LineChartCard } from "@/components/ui/charts/LineChartCard"
import type { BlogAnalytics } from "@/lib/analytics/types"

interface BlogPanelProps {
  data: BlogAnalytics
}

export function BlogPanel({ data }: BlogPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Likes totales" value={data.totalLikes} icon={<Heart className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
        <StatCard label="Posts publicados" value={data.totalPosts} icon={<BookOpen className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
        <StatCard label="Avg likes por post" value={data.avgLikesPerPost} icon={<TrendingUp className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
      </div>

      <LineChartCard
        title="Likes por día"
        data={data.likesSeries.map((p) => ({ date: p.date, value: p.value }))}
        lines={[{ key: "value", label: "Likes", color: "#10b981" }]}
        height={240}
      />

      <InfoCard title="Posts más populares" padded={false}>
        <ul>
          {data.topPosts.map((p, i) => (
            <li
              key={p.slug}
              className={`flex items-center justify-between px-5 py-3 ${i > 0 ? "border-t border-[var(--c-border)]" : ""}`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="w-5 text-[11px] text-[var(--c-text-faint)]">{i + 1}</span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-[var(--c-text)]">{p.title}</p>
                  <p className="truncate text-[11px] text-[var(--c-text-muted)]">/blog/{p.slug}</p>
                </div>
              </div>
              <span className="shrink-0 text-[13px] font-medium text-[var(--c-text-muted)]">
                {p.likes} ❤️
              </span>
            </li>
          ))}
        </ul>
      </InfoCard>
    </div>
  )
}
