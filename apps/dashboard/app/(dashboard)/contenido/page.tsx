import { getSupabase } from "@/lib/supabase"
import { readFile } from "fs/promises"
import path from "path"
import { PageHeader } from "@/components/ui/PageHeader"
import { ContenidoClient } from "./ContenidoClient"

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
  } catch {}

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
  const totalLikes = postsWithLikes.reduce((a, p) => a + p.likes, 0)

  return { posts: postsWithLikes, totalLikes }
}

export default async function ContenidoPage() {
  const { posts, totalLikes } = await getContenidoData()

  return (
    <>
      <PageHeader
        title="Contenido"
        subtitle={`${posts.length} artículos · ${totalLikes} likes totales`}
      />
      <div className="flex flex-col gap-6 p-8">
        <ContenidoClient posts={posts} />
      </div>
    </>
  )
}
