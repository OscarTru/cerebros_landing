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

export default async function ContenidoPage() {
  const posts = await getContenidoData()

  return (
    <>
      <Header title="Contenido" />
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-[var(--c-text-muted)]" />
          <div>
            <h2 className="text-base font-semibold text-[var(--c-text)]">Posts del blog</h2>
            <p className="text-sm text-[var(--c-text-muted)]">{posts.length} artículos publicados</p>
          </div>
        </div>

        <div className="bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl overflow-hidden">
          {posts.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-[var(--c-text-muted)]">
              No hay posts disponibles. Verifica que apps/web/public/data/content.json existe.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--c-border)]">
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-[var(--c-text-muted)]">
                    Título
                  </th>
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-[var(--c-text-muted)]">
                    Fecha
                  </th>
                  <th className="px-5 py-2.5 text-right text-xs font-medium text-[var(--c-text-muted)]">
                    Likes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--c-border)]">
                {posts.map((p) => (
                  <tr key={p.slug} className="hover:bg-[var(--c-surface-2)]">
                    <td className="px-5 py-3">
                      <p className="font-medium text-[var(--c-text)]">{p.title}</p>
                      <p className="text-xs text-[var(--c-text-muted)] mt-0.5">/blog/{p.slug}</p>
                    </td>
                    <td className="px-5 py-3 text-[var(--c-text-muted)]">
                      {new Date(p.date).toLocaleDateString("es-MX", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3 text-right">
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
