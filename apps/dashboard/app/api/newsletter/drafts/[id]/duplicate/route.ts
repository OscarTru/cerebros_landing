import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/clerk"
import { getSupabase } from "@/lib/supabase"

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  let userId: string
  try {
    const r = await requireRole(["owner", "editor"])
    userId = r.userId
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const supabase = getSupabase()
  const { data: src } = await supabase
    .from("newsletter_drafts")
    .select("title, subject, mode, blocks, markdown, html")
    .eq("id", id)
    .maybeSingle()
  if (!src) return NextResponse.json({ error: "No existe" }, { status: 404 })

  const { data: inserted, error } = await supabase
    .from("newsletter_drafts")
    .insert({
      title: `${src.title} (copia)`,
      subject: src.subject,
      mode: src.mode,
      blocks: src.blocks,
      markdown: src.markdown,
      html: src.html,
      status: "draft",
      created_by: userId,
    })
    .select("id")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: inserted.id })
}
