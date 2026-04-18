import { getSupabase } from "@/lib/supabase"
import { readFile } from "fs/promises"
import path from "path"
import { PageHeader } from "@/components/ui/PageHeader"
import { FadeIn } from "@/components/ui/effects/FadeIn"
import { AnalyticsTabsClient } from "./AnalyticsTabsClient"

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
  } catch {}

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
    ytVideos,
  }
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData()

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Métricas de redes sociales y blog"
      />
      <div className="flex flex-col gap-6 p-8">
        <FadeIn>
          <AnalyticsTabsClient data={data} />
        </FadeIn>
      </div>
    </>
  )
}
