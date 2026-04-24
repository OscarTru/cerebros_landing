import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { PostMeta, Heading } from "@cerebros/lib"

export type { PostMeta, Heading }

// Legacy shape extendido con `content` (MDX source) para /blog/[slug] renders.
export interface BlogPost extends PostMeta {
  content: string
}

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (_client) return _client
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY requeridas")
  }
  _client = createClient(url, key, { auth: { persistSession: false } })
  return _client
}

function rowToPostMeta(row: Record<string, unknown>): PostMeta {
  const publishedAt = row.published_at as string | null
  const date = publishedAt ? publishedAt.slice(0, 10) : (row.created_at as string).slice(0, 10)
  return {
    slug: row.slug as string,
    title: (row.title as string) ?? "",
    date,
    description: (row.description as string) ?? "",
    author: (row.author as string) ?? "",
    image: (row.image as string | null) ?? undefined,
    readingTime: (row.reading_time as number | null) ?? 1,
    headings: ((row.headings as Heading[] | null) ?? []),
  }
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const { data, error } = await getClient()
    .from("blog_posts")
    .select("slug, title, description, author, image, reading_time, headings, published_at, created_at")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(500)
  if (error) {
    console.error("getAllPosts error:", error)
    return []
  }
  return (data ?? []).map(rowToPostMeta)
}

export async function getAllSlugs(): Promise<string[]> {
  const posts = await getAllPosts()
  return posts.map((p) => p.slug)
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const { data, error } = await getClient()
    .from("blog_posts")
    .select("slug, title, description, author, image, reading_time, headings, published_at, created_at, content")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle()
  if (error || !data) return undefined
  return {
    ...rowToPostMeta(data),
    content: (data.content as string) ?? "",
  }
}

export async function getAdjacentPosts(slug: string): Promise<{
  prevPost?: { slug: string; title: string }
  nextPost?: { slug: string; title: string }
}> {
  const posts = await getAllPosts()
  const slugs = posts.map((p) => p.slug)
  const idx = slugs.indexOf(slug)
  return {
    prevPost: idx > 0 ? { slug: slugs[idx - 1], title: posts[idx - 1].title } : undefined,
    nextPost:
      idx >= 0 && idx < slugs.length - 1
        ? { slug: slugs[idx + 1], title: posts[idx + 1].title }
        : undefined,
  }
}
