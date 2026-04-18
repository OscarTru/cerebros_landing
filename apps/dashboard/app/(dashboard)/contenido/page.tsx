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

const thClass =
  "px-5 py-3 text-left text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--c-text-muted)] border-b border-[var(--c-border)]"

const tdClass = "px-5 py-3.5 text-[13px] border-t border-[var(--c-border)]"

export default async function ContenidoPage() {
  const posts = await getContenidoData()

  return (
    <>
      <Header title="Contenido" />
      <div className="p-8 flex flex-col gap-6">

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--c-surface)] border border-[var(--c-border)]">
            <BookOpen className="w-4 h-4 text-[var(--c-text-muted)]" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight text-[var(--c-text)]">
              Posts del blog
            </h2>
            <p className="text-[13px] text-[var(--c-text-muted)] mt-0.5">
              {posts.length} artículos publicados
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          {posts.length === 0 ? (
            <div className="px-5 py-10 text-center text-[13px] text-[var(--c-text-muted)]">
              No hay posts disponibles. Verifica que apps/web/public/data/content.json existe.
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={thClass}>Título</th>
                  <th className={thClass}>Fecha</th>
                  <th className={`${thClass} text-right`}>Likes</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.slug}>
                    <td className={tdClass}>
                      <p className="text-[13px] font-medium text-[var(--c-text)]">{p.title}</p>
                      <p className="text-[11px] text-[var(--c-text-muted)] mt-0.5">/blog/{p.slug}</p>
                    </td>
                    <td className={`${tdClass} text-[var(--c-text-muted)]`}>
                      {new Date(p.date).toLocaleDateString("es-MX", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className={`${tdClass} text-right`}>
                      <span className="inline-flex items-center gap-1 text-[var(--c-text-muted)]">
                        <Heart className="w-3.5 h-3.5" />
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
    </>
  )
}
