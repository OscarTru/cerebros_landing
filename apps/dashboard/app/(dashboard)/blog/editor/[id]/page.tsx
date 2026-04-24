import { notFound } from "next/navigation"
import { getSupabase } from "@/lib/supabase"
import { getUserRole } from "@/lib/clerk"
import { BlogEditorClient, type BlogPostRow } from "./BlogEditorClient"

export default async function BlogEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [role, post] = await Promise.all([
    getUserRole(),
    loadPost(id),
  ])
  if (!post) notFound()
  return <BlogEditorClient initialPost={post} role={role} />
}

async function loadPost(id: string): Promise<BlogPostRow | null> {
  const { data } = await getSupabase()
    .from("blog_posts")
    .select("id, slug, title, description, author, image, content, tags, status, views, reading_time, published_at, updated_at, created_by")
    .eq("id", id)
    .maybeSingle()
  return (data as BlogPostRow | null) ?? null
}
