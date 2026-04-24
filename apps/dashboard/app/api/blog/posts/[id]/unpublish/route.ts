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
    .select("slug, status")
    .eq("id", id)
    .maybeSingle()
  if (!post) return NextResponse.json({ error: "No existe" }, { status: 404 })
  if (post.status !== "published") {
    return NextResponse.json({ error: "Solo se puede despublicar un post publicado" }, { status: 400 })
  }

  const { error } = await supabase
    .from("blog_posts")
    .update({ status: "draft" })
    .eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rev = await revalidateLanding([`/blog/${post.slug}`, "/blog"])
  return NextResponse.json({ ok: true, revalidated: rev.ok, revalidate_error: rev.error })
}
