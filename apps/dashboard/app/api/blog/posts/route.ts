import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/clerk"
import { getSupabase } from "@/lib/supabase"
import { slugify } from "@/lib/blog/parse-markdown"

export async function GET() {
  try {
    await requireRole(["owner", "editor", "viewer"])
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { data, error } = await getSupabase()
    .from("blog_posts")
    .select("id, slug, title, description, author, status, views, updated_at, published_at, created_by")
    .order("updated_at", { ascending: false })
    .limit(200)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data ?? [] })
}

export async function POST(req: NextRequest) {
  let userId: string
  try {
    const r = await requireRole(["owner", "editor"])
    userId = r.userId
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const body = await req.json().catch(() => ({}))
  const title = typeof body.title === "string" && body.title.trim() ? body.title.trim() : "Sin título"
  const baseSlug = slugify(title) || "post"

  // Genera slug único
  const supabase = getSupabase()
  let slug = baseSlug
  let suffix = 2
  while (true) {
    const { data: existing } = await supabase.from("blog_posts").select("id").eq("slug", slug).maybeSingle()
    if (!existing) break
    slug = `${baseSlug}-${suffix}`
    suffix++
    if (suffix > 100) return NextResponse.json({ error: "No se pudo generar slug único" }, { status: 500 })
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      slug,
      title,
      content: "",
      status: "draft",
      created_by: userId,
      author: "Oscar Trujillo",
    })
    .select("id, slug")
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id, slug: data.slug })
}
