import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { Resend } from "resend"
import { getSupabase } from "@/lib/supabase"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { subject, body, scheduled_at } = await req.json()
  if (!subject || !body) {
    return NextResponse.json({ error: "Falta subject o body" }, { status: 400 })
  }

  if (scheduled_at) {
    const when = new Date(scheduled_at)
    if (Number.isNaN(when.getTime())) {
      return NextResponse.json({ error: "Fecha inválida" }, { status: 400 })
    }
    if (when.getTime() <= Date.now()) {
      return NextResponse.json({ error: "La fecha debe ser futura" }, { status: 400 })
    }
    const { error } = await getSupabase()
      .from("newsletter_scheduled")
      .insert({ subject, body, scheduled_at: when.toISOString() })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    // TODO: worker que procese newsletter_scheduled no implementado aún.
    return NextResponse.json({ scheduled: true, scheduled_at: when.toISOString() })
  }

  const { data: subs } = await getSupabase()
    .from("suscriptores")
    .select("email")
    .eq("confirmed", true)

  const emails = (subs ?? []).map((s) => s.email)
  if (emails.length === 0) {
    return NextResponse.json({ error: "No hay suscriptores confirmados" }, { status: 400 })
  }

  const BATCH = 50
  let sent = 0
  for (let i = 0; i < emails.length; i += BATCH) {
    const batch = emails.slice(i, i + BATCH)
    await resend.batch.send(
      batch.map((to) => ({
        from: "Cerebros Esponjosos <newsletter@cerebrosesponjosos.com>",
        to,
        subject,
        html: body.replace(/\n/g, "<br>"),
      }))
    )
    sent += batch.length
  }

  return NextResponse.json({ sent })
}
