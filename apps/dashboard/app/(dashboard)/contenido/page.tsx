import { Header } from "@/components/Header"
import { getSupabase } from "@/lib/supabase"
import { readFile } from "fs/promises"
import path from "path"
import { BookOpen, Heart } from "lucide-react"

interface BlogPost {
  slug: string
  title: string
  date: string
}

async function getContenidoData() {
  let posts: BlogPost[] = []
  try {
    const raw = await readFile(
      path.join(process.cwd(), "../../apps/web/public/data/content.json"),
      "utf-8"
    )
    const content = JSON.parse(raw)
    posts = content.blog?.posts ?? []
  } catch {
    // no data
  }

  const { data: likesData } = await getSupabase().from("post_likes").select("slug")
  const likesBySlugs: Record<string, number> = {}
  likesData?.forEach(({ slug }) => {
    likesBySlugs[slug] = (likesBySlugs[slug] ?? 0) + 1
  })

  const postsWithLikes = posts.map((p) => ({
    ...p,
    likes: likesBySlugs[p.slug] ?? 0,
  }))

  postsWithLikes.sort((a, b) => b.likes - a.likes)

  return postsWithLikes
}

const thStyle: React.CSSProperties = {
  padding: "12px 20px",
  textAlign: "left",
  fontSize: "11px",
  fontWeight: 500,
  color: "var(--c-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  borderBottom: "1px solid var(--c-border)",
}

const tdStyle: React.CSSProperties = {
  padding: "14px 20px",
  fontSize: "13px",
  borderTop: "1px solid var(--c-border)",
}

export default async function ContenidoPage() {
  const posts = await getContenidoData()

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Header title="Contenido" />
      <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: "10px",
            background: "var(--c-surface)",
            border: "1px solid var(--c-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <BookOpen style={{ width: 16, height: 16, color: "var(--c-text-muted)" }} />
          </div>
          <div>
            <h2 style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--c-text)",
              letterSpacing: "-0.01em",
              margin: 0,
            }}>
              Posts del blog
            </h2>
            <p style={{ fontSize: "13px", color: "var(--c-text-muted)", margin: 0, marginTop: "2px" }}>
              {posts.length} artículos publicados
            </p>
          </div>
        </div>

        <div style={{
          background: "var(--c-surface)",
          border: "1px solid var(--c-border)",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}>
          {posts.length === 0 ? (
            <div style={{
              padding: "40px 20px",
              textAlign: "center",
              fontSize: "13px",
              color: "var(--c-text-muted)",
            }}>
              No hay posts disponibles. Verifica que apps/web/public/data/content.json existe.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Título</th>
                  <th style={thStyle}>Fecha</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Likes</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.slug}>
                    <td style={tdStyle}>
                      <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--c-text)", margin: 0 }}>
                        {p.title}
                      </p>
                      <p style={{ fontSize: "11px", color: "var(--c-text-muted)", margin: 0, marginTop: "2px" }}>
                        /blog/{p.slug}
                      </p>
                    </td>
                    <td style={{ ...tdStyle, color: "var(--c-text-muted)" }}>
                      {new Date(p.date).toLocaleDateString("es-MX", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        color: "var(--c-text-muted)",
                      }}>
                        <Heart style={{ width: 14, height: 14 }} />
                        {p.likes}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  )
}
