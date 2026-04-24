import { getSupabase } from "@/lib/supabase"
import { ContenidoClient } from "./ContenidoClient"

interface BlogPost {
  id?: string
  slug: string
  title: string
  date: string
  excerpt?: string
  readingTime?: number
  category?: string
  views?: number
  status?: "draft" | "published" | "archived"
}

export interface CalendarEvent {
  id: string
  fecha: string
  plataforma: "instagram" | "youtube" | "blog" | "newsletter"
  titulo: string
  descripcion?: string
  estado: "borrador" | "listo" | "publicado"
}

async function getContenidoData() {
  const supabase = getSupabase()
  const [postsRes, likesRes, calendarRes, draftsRes] = await Promise.all([
    // Solo publicados aquí (los drafts viven en /blog del dashboard)
    supabase
      .from("blog_posts")
      .select("id, slug, title, description, published_at, created_at, reading_time, views, status")
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(200),
    supabase.from("post_likes").select("slug"),
    supabase
      .from("contenido_calendario")
      .select("*")
      .order("fecha", { ascending: true }),
    supabase
      .from("blog_posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft"),
  ])

  const likesBySlugs: Record<string, number> = {}
  likesRes.data?.forEach(({ slug }) => {
    likesBySlugs[slug] = (likesBySlugs[slug] ?? 0) + 1
  })

  const rawPosts = postsRes.data ?? []
  const posts: (BlogPost & { likes: number })[] = rawPosts.map((p) => ({
    id: p.id as string,
    slug: p.slug as string,
    title: (p.title as string) ?? "",
    date: ((p.published_at as string | null) ?? (p.created_at as string)).slice(0, 10),
    excerpt: (p.description as string | null) ?? undefined,
    readingTime: (p.reading_time as number | null) ?? undefined,
    views: (p.views as number) ?? 0,
    status: (p.status as BlogPost["status"]) ?? "published",
    likes: likesBySlugs[p.slug as string] ?? 0,
  }))

  // Orden primario: por likes desc; si empatan, por views desc; si empatan, fecha.
  posts.sort((a, b) => (b.likes - a.likes) || ((b.views ?? 0) - (a.views ?? 0)) || (a.date < b.date ? 1 : -1))

  const totalLikes = posts.reduce((a, p) => a + p.likes, 0)
  const totalViews = posts.reduce((a, p) => a + (p.views ?? 0), 0)
  const calendarEvents = (calendarRes.data ?? []) as CalendarEvent[]
  const draftsCount = draftsRes.count ?? 0

  return { posts, totalLikes, totalViews, calendarEvents, draftsCount }
}

function getStreakDays(posts: BlogPost[]): number {
  if (posts.length === 0) return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const sorted = [...posts]
    .map((p) => { const d = new Date(p.date); d.setHours(0, 0, 0, 0); return d })
    .sort((a, b) => b.getTime() - a.getTime())
  let streak = 0
  let cursor = new Date(today)
  for (const d of sorted) {
    const diff = Math.round((cursor.getTime() - d.getTime()) / 86400000)
    if (diff === 0 || diff === 1) { streak++; cursor = d } else break
  }
  return streak
}

export default async function ContenidoPage() {
  const { posts, totalLikes, totalViews, calendarEvents, draftsCount } = await getContenidoData()
  const streak = getStreakDays(posts)
  const topPost = posts[0] ?? null

  return (
    <ContenidoClient
      posts={posts}
      totalLikes={totalLikes}
      totalViews={totalViews}
      streak={streak}
      topPost={topPost ?? undefined}
      calendarEvents={calendarEvents}
      draftsCount={draftsCount}
    />
  )
}
