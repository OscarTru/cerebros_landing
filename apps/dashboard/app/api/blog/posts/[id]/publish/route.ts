import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/clerk"
import { getSupabase } from "@/lib/supabase"
import { revalidateLanding } from "@/lib/revalidate"

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    await requireRole(["owner"])
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const { id } = await params
  const supabase = getSupabase()
  const { data: post } = await supabase
    .from("blog_posts")
    .select("slug, title, content")
    .eq("id", id)
    .maybeSingle()
  if (!post) return NextResponse.json({ error: "No existe" }, { status: 404 })

  const missing: string[] = []
  if (!post.slug?.trim()) missing.push("slug")
  if (!post.title?.trim()) missing.push("título")
  if (!post.content?.trim()) missing.push("contenido")
  if (missing.length > 0) {
    return NextResponse.json({ error: `Falta: ${missing.join(", ")}` }, { status: 400 })
  }

  // Slug duplicado con otro post
  const { data: conflict } = await supabase
    .from("blog_posts")
    .select("id")
    .eq("slug", post.slug)
    .neq("id", id)
    .maybeSingle()
  if (conflict) return NextResponse.json({ error: "Ya existe otro post con ese slug" }, { status: 409 })

  const { error } = await supabase
    .from("blog_posts")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rev = await revalidateLanding([`/blog/${post.slug}`, "/blog"])
  return NextResponse.json({ ok: true, slug: post.slug, revalidated: rev.ok, revalidate_error: rev.error })
}
