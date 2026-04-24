import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/clerk"
import { getSupabase } from "@/lib/supabase"
import { renderFromDraft, type DraftShape } from "@cerebros/email-templates"

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    await requireRole(["owner", "editor", "viewer"])
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  const { data, error } = await getSupabase()
    .from("newsletter_drafts")
    .select("subject, mode, blocks, markdown, html")
    .eq("id", id)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "No existe" }, { status: 404 })

  const html = renderFromDraft({
    email: "preview@cerebrosesponjosos.com",
    draft: data as DraftShape,
  })
  return NextResponse.json({ html })
}
