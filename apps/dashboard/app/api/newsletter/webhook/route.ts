import { NextRequest, NextResponse } from "next/server"
import crypto from "node:crypto"
import { getSupabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"
export const maxDuration = 30

// Resend webhook event types that we store.
const TRACKED_EVENTS = new Set([
  "email.sent",
  "email.delivered",
  "email.delivery_delayed",
  "email.complained",
  "email.bounced",
  "email.opened",
  "email.clicked",
  "email.failed",
])

// Verifies Svix signature used by Resend.
// Signature header format: "v1,base64sig v1,base64sig ..." (space-separated versions).
function verifySvixSignature(opts: {
  secret: string
  id: string
  timestamp: string
  signatureHeader: string
  body: string
}): boolean {
  // Strip `whsec_` prefix if present.
  const secret = opts.secret.startsWith("whsec_") ? opts.secret.slice(6) : opts.secret
  const secretBytes = Buffer.from(secret, "base64")
  const toSign = `${opts.id}.${opts.timestamp}.${opts.body}`
  const expected = crypto.createHmac("sha256", secretBytes).update(toSign).digest("base64")

  // Header can contain multiple versions separated by spaces.
  const parts = opts.signatureHeader.split(" ")
  for (const part of parts) {
    const [version, sig] = part.split(",")
    if (version === "v1" && sig === expected) return true
  }
  return false
}

export async function POST(req: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
  }

  const id = req.headers.get("svix-id") ?? req.headers.get("webhook-id")
  const timestamp = req.headers.get("svix-timestamp") ?? req.headers.get("webhook-timestamp")
  const signature = req.headers.get("svix-signature") ?? req.headers.get("webhook-signature")
  const body = await req.text()

  if (!id || !timestamp || !signature) {
    return NextResponse.json({ error: "Missing signature headers" }, { status: 400 })
  }

  const ok = verifySvixSignature({ secret, id, timestamp, signatureHeader: signature, body })
  if (!ok) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  let payload: {
    type?: string
    created_at?: string
    data?: {
      email_id?: string
      broadcast_id?: string
      to?: string | string[]
      subject?: string
    }
  }
  try {
    payload = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const eventType = payload.type ?? "unknown"
  if (!TRACKED_EVENTS.has(eventType)) {
    return NextResponse.json({ ok: true, skipped: eventType })
  }

  const data = payload.data ?? {}
  const email = Array.isArray(data.to) ? data.to[0] : data.to ?? ""
  const broadcastId = data.broadcast_id ?? null
  const emailId = data.email_id ?? null

  const { error } = await getSupabase()
    .from("newsletter_events")
    .insert({
      broadcast_id: broadcastId,
      email_id: emailId,
      email,
      event_type: eventType,
      payload,
    })

  if (error) {
    console.error("Webhook insert error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
