import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/clerk"
import { getSupabase } from "@/lib/supabase"

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    await requireRole(["owner", "editor"])
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const supabase = getSupabase()
  const { data: draft } = await supabase
    .from("newsletter_drafts")
    .select("subject, mode, blocks, markdown, html, status")
    .eq("id", id)
    .maybeSingle()
  if (!draft) return NextResponse.json({ error: "No existe" }, { status: 404 })
  if (draft.status !== "draft") {
    return NextResponse.json({ error: `Estado actual '${draft.status}' no permite solicitar aprobación` }, { status: 409 })
  }

  const missing: string[] = []
  if (!draft.subject?.trim()) missing.push("subject")
  if (draft.mode === "blocks" && !(draft.blocks && draft.blocks.heroTitle)) missing.push("hero title (bloques)")
  if (draft.mode === "markdown" && !draft.markdown?.trim()) missing.push("contenido markdown")
  if (draft.mode === "html" && !draft.html?.trim()) missing.push("HTML crudo")
  if (missing.length > 0) {
    return NextResponse.json({ error: `Falta: ${missing.join(", ")}` }, { status: 400 })
  }

  const { error } = await supabase
    .from("newsletter_drafts")
    .update({ status: "pending_approval" })
    .eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
