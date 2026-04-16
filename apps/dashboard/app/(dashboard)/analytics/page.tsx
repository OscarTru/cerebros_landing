import { Header } from "@/components/Header"
import { MetricCard } from "@/components/MetricCard"
import { getSupabase } from "@/lib/supabase"
import { readFile } from "fs/promises"
import path from "path"
import { Camera, CirclePlay, Heart } from "lucide-react"

interface ContentData {
  instagram?: {
    followers?: number
    posts?: Array<{ id: string; likes: number; comments: number; plays?: number }>
  }
  youtube?: {
    videos?: Array<{ id: string; title: string; views: number; likes: number }>
  }
}

async function getAnalyticsData() {
  let content: ContentData = {}
  try {
    const contentPath = path.join(process.cwd(), "../../apps/web/public/data/content.json")
    const raw = await readFile(contentPath, "utf-8")
    content = JSON.parse(raw)
  } catch {
    // continue with empty data
  }

  const { data: likesData } = await getSupabase().from("post_likes").select("slug")
  const likesBySlugs: Record<string, number> = {}
  likesData?.forEach(({ slug }) => {
    likesBySlugs[slug] = (likesBySlugs[slug] ?? 0) + 1
  })
  const topPosts = Object.entries(likesBySlugs)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([slug, count]) => ({ slug, count }))

  const igPosts = content.instagram?.posts ?? []
  const igFollowers = content.instagram?.followers ?? 0
  const igEngagement =
    igPosts.length > 0
      ? Math.round(
          igPosts.reduce((acc, p) => acc + p.likes + p.comments, 0) / igPosts.length
        )
      : 0

  const ytVideos = content.youtube?.videos ?? []
  const ytTotalViews = ytVideos.reduce((acc, v) => acc + v.views, 0)

  return {
    igFollowers,
    igEngagement,
    ytTotalViews,
    ytVideosCount: ytVideos.length,
    totalBlogLikes: likesData?.length ?? 0,
    topPosts,
  }
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData()

  return (
    <>
      <Header title="Analytics" />
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-base font-semibold text-[var(--c-text)]">Instagram</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <MetricCard
              label="Seguidores"
              value={data.igFollowers.toLocaleString("es-MX")}
              icon={Camera}
            />
            <MetricCard
              label="Engagement promedio"
              value={data.igEngagement.toLocaleString("es-MX")}
              sublabel="likes + comments por post"
              icon={Camera}
            />
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold text-[var(--c-text)]">YouTube</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <MetricCard
              label="Vistas totales"
              value={data.ytTotalViews.toLocaleString("es-MX")}
              icon={CirclePlay}
            />
            <MetricCard
              label="Videos"
              value={data.ytVideosCount}
              icon={CirclePlay}
            />
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold text-[var(--c-text)]">Blog</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <MetricCard
              label="Likes totales"
              value={data.totalBlogLikes.toLocaleString("es-MX")}
              icon={Heart}
            />
          </div>

          {data.topPosts.length > 0 && (
            <div className="mt-4 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-[var(--c-border)]">
                <p className="text-sm font-medium text-[var(--c-text)]">Posts más populares</p>
              </div>
              <ul className="divide-y divide-[var(--c-border)]">
                {data.topPosts.map(({ slug, count }, i) => (
                  <li key={slug} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[var(--c-text-faint)] w-4">{i + 1}</span>
                      <span className="text-sm text-[var(--c-text)]">{slug}</span>
                    </div>
                    <span className="text-sm font-medium text-[var(--c-text-muted)]">
                      {count} ❤️
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
