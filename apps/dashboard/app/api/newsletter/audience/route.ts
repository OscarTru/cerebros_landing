import { NextResponse } from "next/server"
import { Resend } from "resend"
import { requireRole } from "@/lib/clerk"

function getResend() { return new Resend(process.env.RESEND_API_KEY ?? "") }

export const revalidate = 60

export async function GET() {
  try {
    await requireRole(["owner", "editor", "viewer"])
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID
  if (!audienceId) {
    return NextResponse.json({ error: "Falta RESEND_AUDIENCE_ID" }, { status: 500 })
  }

  try {
    const res = await getResend().contacts.list({ audienceId })
    if (res.error) {
      return NextResponse.json({ error: res.error.message }, { status: 500 })
    }
    const contacts = res.data?.data ?? []
    const total = contacts.length
    const subscribed = contacts.filter((c) => !c.unsubscribed).length
    const unsubscribed = total - subscribed

    const weekAgo = Date.now() - 7 * 86400000
    const newThisWeek = contacts.filter((c) => new Date(c.created_at).getTime() >= weekAgo).length

    // Return lightweight contact list (sorted by created_at desc)
    const items = contacts
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 100)
      .map((c) => ({
        id: c.id,
        email: c.email,
        first_name: c.first_name,
        last_name: c.last_name,
        unsubscribed: c.unsubscribed,
        created_at: c.created_at,
      }))

    return NextResponse.json({
      total,
      subscribed,
      unsubscribed,
      newThisWeek,
      items,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ error: `Resend: ${msg}` }, { status: 500 })
  }
}
