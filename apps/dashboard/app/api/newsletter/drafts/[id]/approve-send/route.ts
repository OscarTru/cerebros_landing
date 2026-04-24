import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { requireRole } from "@/lib/clerk"
import { getSupabase } from "@/lib/supabase"
import { renderFromDraft, type DraftShape } from "@cerebros/email-templates"

function getResend() { return new Resend(process.env.RESEND_API_KEY ?? "") }

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  let userId: string
  try {
    const r = await requireRole(["owner"])
    userId = r.userId
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID
  if (!audienceId) {
    return NextResponse.json({ error: "Falta RESEND_AUDIENCE_ID en env" }, { status: 500 })
  }

  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const mode: "now" | "schedule" = body.mode === "schedule" ? "schedule" : "now"
  const scheduledAt: string | undefined = typeof body.scheduled_at === "string" ? body.scheduled_at : undefined

  const supabase = getSupabase()
  const { data: draft } = await supabase
    .from("newsletter_drafts")
    .select("title, subject, mode, blocks, markdown, html, status")
    .eq("id", id)
    .maybeSingle()
  if (!draft) return NextResponse.json({ error: "No existe" }, { status: 404 })
  if (draft.status !== "pending_approval" && draft.status !== "draft") {
    return NextResponse.json({ error: `Estado actual '${draft.status}' no permite aprobar` }, { status: 409 })
  }
  if (!draft.subject?.trim()) {
    return NextResponse.json({ error: "Subject vacío" }, { status: 400 })
  }

  if (mode === "schedule" && !scheduledAt) {
    return NextResponse.json({ error: "Falta scheduled_at" }, { status: 400 })
  }
  if (mode === "schedule") {
    const when = new Date(scheduledAt!)
    if (Number.isNaN(when.getTime())) return NextResponse.json({ error: "Fecha inválida" }, { status: 400 })
    if (when.getTime() <= Date.now()) return NextResponse.json({ error: "La fecha debe ser futura" }, { status: 400 })
  }

  // Render HTML usando el paquete compartido (mismo template que el landing).
  // Usamos placeholder email ya que Resend hace el fan-out a la audiencia.
  const html = renderFromDraft({
    email: "{{{RESEND_EMAIL}}}",
    draft: draft as DraftShape,
  })

  try {
    const createRes = await getResend().broadcasts.create({
      audienceId,
      name: draft.title || draft.subject,
      from: "Cerebros Esponjosos <newsletter@cerebrosesponjosos.com>",
      subject: draft.subject,
      html,
      previewText: draft.subject,
      send: true,
      ...(mode === "schedule" ? { scheduledAt: new Date(scheduledAt!).toISOString() } : {}),
    })

    if (createRes.error) {
      return NextResponse.json({ error: `Resend: ${createRes.error.message}` }, { status: 500 })
    }

    const broadcastId = createRes.data?.id ?? null

    // Update draft status + save broadcast_id for webhooks linkage
    const newStatus = mode === "schedule" ? "approved" : "sent"
    await supabase
      .from("newsletter_drafts")
      .update({ status: newStatus, approved_by: userId, broadcast_id: broadcastId })
      .eq("id", id)

    if (mode === "schedule") {
      return NextResponse.json({ scheduled_at: scheduledAt, broadcast_id: broadcastId })
    }
    return NextResponse.json({ sent: true, broadcast_id: broadcastId })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ error: `Resend: ${msg}` }, { status: 500 })
  }
}
