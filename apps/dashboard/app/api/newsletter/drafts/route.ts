import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/clerk"
import { getSupabase } from "@/lib/supabase"

export async function GET() {
  try {
    await requireRole(["owner", "editor", "viewer"])
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { data, error } = await getSupabase()
    .from("newsletter_drafts")
    .select("id, title, subject, mode, status, created_by, approved_by, updated_at, created_at")
    .order("updated_at", { ascending: false })
    .limit(50)
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
  const { data, error } = await getSupabase()
    .from("newsletter_drafts")
    .insert({ title, created_by: userId, mode: "blocks", blocks: { heroTitle: "" } })
    .select("id")
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id })
}
