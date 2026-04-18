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

const sectionTitle: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: 600,
  color: "var(--c-text)",
  letterSpacing: "-0.01em",
  margin: 0,
  marginBottom: "12px",
}

const gridTwo: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "16px",
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData()

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Header title="Analytics" />
      <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "32px" }}>

        <div>
          <h2 style={sectionTitle}>Instagram</h2>
          <div style={gridTwo}>
            <MetricCard label="Seguidores" value={data.igFollowers.toLocaleString("es-MX")} icon={Camera} />
            <MetricCard label="Engagement promedio" value={data.igEngagement.toLocaleString("es-MX")} sublabel="likes + comments por post" icon={Camera} />
          </div>
        </div>

        <div>
          <h2 style={sectionTitle}>YouTube</h2>
          <div style={gridTwo}>
            <MetricCard label="Vistas totales" value={data.ytTotalViews.toLocaleString("es-MX")} icon={CirclePlay} />
            <MetricCard label="Videos" value={data.ytVideosCount} icon={CirclePlay} />
          </div>
        </div>

        <div>
          <h2 style={sectionTitle}>Blog</h2>
          <div style={gridTwo}>
            <MetricCard label="Likes totales" value={data.totalBlogLikes.toLocaleString("es-MX")} icon={Heart} />
          </div>

          {data.topPosts.length > 0 && (
            <div style={{
              marginTop: "16px",
              background: "var(--c-surface)",
              border: "1px solid var(--c-border)",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}>
              <div style={{
                padding: "14px 20px",
                borderBottom: "1px solid var(--c-border)",
              }}>
                <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--c-text)", margin: 0 }}>
                  Posts más populares
                </p>
              </div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {data.topPosts.map(({ slug, count }, i) => (
                  <li
                    key={slug}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 20px",
                      borderTop: i === 0 ? "none" : "1px solid var(--c-border)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "12px", color: "var(--c-text-faint)", width: "16px" }}>{i + 1}</span>
                      <span style={{ fontSize: "13px", color: "var(--c-text)" }}>{slug}</span>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--c-text-muted)" }}>
                      {count} ❤️
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
