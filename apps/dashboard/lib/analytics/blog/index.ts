import type { BlogAnalytics, Period, TimeSeriesPoint } from "../types"
import { getSupabase } from "@/lib/supabase"
import { periodToDays } from "../period"
import { readFile } from "fs/promises"
import path from "path"

interface BlogPostsFile {
  posts?: Array<{ slug: string; title: string; date: string }>
}

async function getBlogPostsFromContent(): Promise<Array<{ slug: string; title: string; date: string }>> {
  try {
    const raw = await readFile(
      path.join(process.cwd(), "../../apps/web/public/data/content.json"),
      "utf-8"
    )
    const content = JSON.parse(raw) as { blog?: BlogPostsFile }
    return content.blog?.posts ?? []
  } catch {
    return []
  }
}

export async function getBlogAnalytics(period: Period): Promise<BlogAnalytics> {
  const days = periodToDays(period)

  const [{ data: likesData }, posts] = await Promise.all([
    getSupabase().from("post_likes").select("slug, created_at"),
    getBlogPostsFromContent(),
  ])

  const likesBySlug: Record<string, number> = {}
  const likesByDate = new Map<string, number>()

  const now = new Date()
  for (let i = days; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    likesByDate.set(d.toISOString().slice(0, 10), 0)
  }

  ;(likesData ?? []).forEach(({ slug, created_at }) => {
    likesBySlug[slug] = (likesBySlug[slug] ?? 0) + 1
    if (created_at) {
      const date = created_at.slice(0, 10)
      if (likesByDate.has(date)) {
        likesByDate.set(date, (likesByDate.get(date) ?? 0) + 1)
      }
    }
  })

  const totalLikes = likesData?.length ?? 0
  const totalPosts = posts.length

  const topPosts = posts
    .map((p) => ({ ...p, likes: likesBySlug[p.slug] ?? 0 }))
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 10)

  const likesSeries: TimeSeriesPoint[] = Array.from(likesByDate.entries()).map(
    ([date, value]) => ({ date, value })
  )

  return {
    totalLikes,
    totalPosts,
    avgLikesPerPost: totalPosts > 0 ? Math.round(totalLikes / totalPosts) : 0,
    likesSeries,
    topPosts,
  }
}
