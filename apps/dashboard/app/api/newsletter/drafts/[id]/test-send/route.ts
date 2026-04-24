import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { auth, currentUser } from "@clerk/nextjs/server"
import { requireRole } from "@/lib/clerk"
import { getSupabase } from "@/lib/supabase"
import { renderFromDraft, type DraftShape } from "@cerebros/email-templates"

function getResend() { return new Resend(process.env.RESEND_API_KEY ?? "") }

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    await requireRole(["owner", "editor"])
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const user = await currentUser()
  const to = user?.primaryEmailAddress?.emailAddress
  if (!to) return NextResponse.json({ error: "No tienes email verificado en tu cuenta" }, { status: 400 })

  const { id } = await params
  const { data, error } = await getSupabase()
    .from("newsletter_drafts")
    .select("subject, mode, blocks, markdown, html")
    .eq("id", id)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "No existe" }, { status: 404 })

  const draft = data as DraftShape
  if (!draft.subject.trim()) {
    return NextResponse.json({ error: "El draft no tiene subject" }, { status: 400 })
  }

  const html = renderFromDraft({ email: to, draft })
  try {
    await getResend().emails.send({
      from: "Cerebros Esponjosos <newsletter@cerebrosesponjosos.com>",
      to,
      subject: `[PRUEBA] ${draft.subject}`,
      html,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ error: `Resend: ${msg}` }, { status: 500 })
  }

  return NextResponse.json({ ok: true, to })
}
