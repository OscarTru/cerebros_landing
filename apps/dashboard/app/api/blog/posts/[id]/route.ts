import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/clerk"
import { getSupabase } from "@/lib/supabase"
import { parseHeadings, readingTimeMinutes, slugify } from "@/lib/blog/parse-markdown"
import { revalidateLanding } from "@/lib/revalidate"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await requireRole(["owner", "editor", "viewer"])
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  const { data, error } = await getSupabase()
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "No existe" }, { status: 404 })
  return NextResponse.json({ post: data })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireRole(["owner", "editor"])
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const { id } = await params
  const body = await req.json()
  const allowed = ["title", "description", "slug", "content", "image", "author", "tags"] as const
  const payload: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) payload[key] = body[key]
  }

  const supabase = getSupabase()
  const { data: existing } = await supabase
    .from("blog_posts")
    .select("slug, status")
    .eq("id", id)
    .maybeSingle()
  if (!existing) return NextResponse.json({ error: "No existe" }, { status: 404 })

  // Normalize slug
  if (typeof payload.slug === "string") {
    const cleaned = slugify(payload.slug as string)
    if (!cleaned) return NextResponse.json({ error: "Slug vacío" }, { status: 400 })
    if (cleaned !== existing.slug) {
      const { data: conflict } = await supabase
        .from("blog_posts")
        .select("id")
        .eq("slug", cleaned)
        .neq("id", id)
        .maybeSingle()
      if (conflict) return NextResponse.json({ error: "Ya existe un post con ese slug" }, { status: 409 })
    }
    payload.slug = cleaned
  }

  // Recalcula reading_time + headings si content cambió
  if (typeof payload.content === "string") {
    const content = payload.content as string
    payload.reading_time = readingTimeMinutes(content)
    payload.headings = parseHeadings(content)
  }

  const { error, data } = await supabase
    .from("blog_posts")
    .update(payload)
    .eq("id", id)
    .select("slug, status, updated_at")
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Si el post está published, revalida el landing
  if (data.status === "published") {
    await revalidateLanding([`/blog/${data.slug}`, "/blog"])
  }

  return NextResponse.json({ ok: true, updated_at: data.updated_at, slug: data.slug })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireRole(["owner"])
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const { id } = await params
  const supabase = getSupabase()
  const { data: existing } = await supabase
    .from("blog_posts")
    .select("slug, status")
    .eq("id", id)
    .maybeSingle()
  if (!existing) return NextResponse.json({ error: "No existe" }, { status: 404 })

  const { error } = await supabase.from("blog_posts").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (existing.status === "published") {
    await revalidateLanding([`/blog/${existing.slug}`, "/blog"])
  }
  return NextResponse.json({ ok: true })
}
