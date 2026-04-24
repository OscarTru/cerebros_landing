import { Heart, BookOpen, TrendingUp } from "lucide-react"
import { InfoCard } from "@/components/ui/InfoCard"
import { LineChartCard } from "@/components/ui/charts/LineChartCard"
import type { BlogAnalytics } from "@/lib/analytics/types"

interface BlogPanelProps {
  data: BlogAnalytics
}

export function BlogPanel({ data }: BlogPanelProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Hero stat */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 sm:col-span-8">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">
            · BLOG · RENDIMIENTO ·
          </p>
          <div className="flex items-end gap-4">
            <span className="text-[96px] font-bold leading-none tracking-tight text-[var(--c-text)]">
              {data.totalLikes.toLocaleString("es-MX")}
            </span>
            <div className="mb-3 flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-[12px] text-[var(--c-text-muted)]">
                <Heart className="h-3.5 w-3.5" />
                likes totales
              </span>
            </div>
          </div>

          {/* Callout row */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-3">
              <p className="mb-1 text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">
                <BookOpen className="mr-1 inline h-3 w-3" />Publicados
              </p>
              <p className="text-[28px] font-bold leading-none text-[var(--c-text)]">
                {data.totalPosts}
              </p>
              <p className="mt-1 text-[11px] text-[var(--c-text-subtle)]">artículos</p>
            </div>
            <div className="rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-3">
              <p className="mb-1 text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">
                <TrendingUp className="mr-1 inline h-3 w-3" />Promedio
              </p>
              <p className="text-[28px] font-bold leading-none text-[var(--c-text)]">
                {data.avgLikesPerPost.toFixed(1)}
              </p>
              <p className="mt-1 text-[11px] text-[var(--c-text-subtle)]">likes por post</p>
            </div>
            <div className="rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-3">
              <p className="mb-1 text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">
                <Heart className="mr-1 inline h-3 w-3" />Top post
              </p>
              <p className="mt-1 truncate text-[13px] font-semibold leading-snug text-[var(--c-text)]">
                {data.topPosts[0]?.title ?? "—"}
              </p>
              <p className="mt-1 text-[11px] text-[var(--c-text-subtle)]">
                {data.topPosts[0]?.likes ?? 0} likes
              </p>
            </div>
          </div>
        </div>
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
                  <p className="truncate text-[11px] text-[var(--c-text-muted)]">
                    Publicado {p.date}
                  </p>
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
