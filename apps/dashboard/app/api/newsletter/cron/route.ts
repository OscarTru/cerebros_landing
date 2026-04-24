import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { getSupabase } from "@/lib/supabase"
import { renderFromDraft, type DraftShape } from "@cerebros/email-templates"

function getResend() { return new Resend(process.env.RESEND_API_KEY ?? "") }

export const dynamic = "force-dynamic"
export const maxDuration = 60

type ScheduledRow = {
  id: string
  subject: string
  body: string
  scheduled_at: string
  draft_id: string | null
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  const expected = process.env.CRON_SECRET
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getSupabase()
  const now = new Date().toISOString()

  const { data: rows, error: fetchErr } = await supabase
    .from("newsletter_scheduled")
    .select("id, subject, body, scheduled_at, draft_id")
    .is("sent_at", null)
    .lte("scheduled_at", now)
    .order("scheduled_at", { ascending: true })
    .limit(10)

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 })

  const pending = (rows ?? []) as ScheduledRow[]
  if (pending.length === 0) return NextResponse.json({ processed: 0, now })

  const { data: subs } = await supabase
    .from("suscriptores")
    .select("email")
    .eq("confirmed", true)
  const emails = (subs ?? []).map((s) => s.email)
  if (emails.length === 0) {
    return NextResponse.json({ error: "No hay suscriptores confirmados" }, { status: 400 })
  }

  const results: Array<{ id: string; sent?: number; error?: string }> = []

  for (const row of pending) {
    try {
      let draftForRender: DraftShape | null = null
      if (row.draft_id) {
        const { data: draft } = await supabase
          .from("newsletter_drafts")
          .select("subject, mode, blocks, markdown, html")
          .eq("id", row.draft_id)
          .maybeSingle()
        if (draft) draftForRender = draft as DraftShape
      }

      const BATCH = 50
      let sent = 0
      for (let i = 0; i < emails.length; i += BATCH) {
        const batch = emails.slice(i, i + BATCH)
        await getResend().batch.send(
          batch.map((to) => ({
            from: "Cerebros Esponjosos <newsletter@cerebrosesponjosos.com>",
            to,
            subject: row.subject,
            html: draftForRender
              ? renderFromDraft({ email: to, draft: draftForRender })
              : row.body.replace(/\n/g, "<br>"),
          }))
        )
        sent += batch.length
      }

      await supabase
        .from("newsletter_scheduled")
        .update({ sent_at: new Date().toISOString() })
        .eq("id", row.id)

      if (row.draft_id) {
        await supabase
          .from("newsletter_drafts")
          .update({ status: "sent" })
          .eq("id", row.draft_id)
      }

      results.push({ id: row.id, sent })
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown"
      results.push({ id: row.id, error: message })
    }
  }

  return NextResponse.json({ processed: results.length, results, now })
}
