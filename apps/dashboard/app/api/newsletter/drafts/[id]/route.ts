import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/clerk"
import { getSupabase } from "@/lib/supabase"

type Params = { params: Promise<{ id: string }> }

const EDITABLE_STATUSES = ["draft", "pending_approval"] as const

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await requireRole(["owner", "editor", "viewer"])
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  const { data, error } = await getSupabase()
    .from("newsletter_drafts")
    .select("*")
    .eq("id", id)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "No existe" }, { status: 404 })
  return NextResponse.json({ draft: data })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireRole(["owner", "editor"])
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const { id } = await params
  const body = await req.json()
  const allowed = ["title", "subject", "mode", "blocks", "markdown", "html"] as const
  const payload: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) payload[key] = body[key]
  }

  const supabase = getSupabase()
  const { data: existing } = await supabase
    .from("newsletter_drafts")
    .select("status")
    .eq("id", id)
    .maybeSingle()
  if (!existing) return NextResponse.json({ error: "No existe" }, { status: 404 })
  if (!EDITABLE_STATUSES.includes(existing.status as typeof EDITABLE_STATUSES[number])) {
    return NextResponse.json({ error: "Este borrador ya no se puede editar" }, { status: 409 })
  }

  const { error, data } = await supabase
    .from("newsletter_drafts")
    .update(payload)
    .eq("id", id)
    .select("updated_at")
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, updated_at: data.updated_at })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireRole(["owner", "editor"])
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const { id } = await params
  const supabase = getSupabase()
  const { data: existing } = await supabase
    .from("newsletter_drafts")
    .select("status")
    .eq("id", id)
    .maybeSingle()
  if (!existing) return NextResponse.json({ error: "No existe" }, { status: 404 })
  if (existing.status !== "draft" && existing.status !== "cancelled") {
    return NextResponse.json({ error: "Solo se pueden borrar drafts no enviados" }, { status: 409 })
  }
  const { error } = await supabase.from("newsletter_drafts").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
