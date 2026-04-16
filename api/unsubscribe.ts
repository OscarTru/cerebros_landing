// Vercel Edge Function — GET /api/unsubscribe?e=EMAIL&token=HMAC
// Verifies HMAC token, then marks the contact as unsubscribed in Resend
// and deletes from Supabase subscribers table.

import { verifyToken } from "./_hmac"

export const config = { runtime: "edge" }

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const email = url.searchParams.get("e")
  const token = url.searchParams.get("token")
  const secret = process.env.UNSUBSCRIBE_SECRET

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return redirect("https://cerebrosesponjosos.com/baja?status=error")
  }

  // If UNSUBSCRIBE_SECRET is configured, require a valid token
  if (secret) {
    if (!token || !(await verifyToken(email, token, secret))) {
      return redirect("https://cerebrosesponjosos.com/baja?status=error")
    }
  }

  const resendKey = process.env.RESEND_API_KEY
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Mark unsubscribed in Resend (best-effort)
  if (resendKey) {
    await fetch("https://api.resend.com/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendKey}`,
      },
      body: JSON.stringify({ email, unsubscribed: true }),
    }).catch(() => {})
  }

  // Remove from Supabase (best-effort)
  if (supabaseUrl && supabaseKey) {
    await fetch(
      `${supabaseUrl}/rest/v1/subscribers?email=eq.${encodeURIComponent(email)}`,
      {
        method: "DELETE",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
      }
    ).catch(() => {})
  }

  return redirect(`https://cerebrosesponjosos.com/baja?status=ok`)
}

function redirect(location: string): Response {
  return new Response(null, { status: 302, headers: { Location: location } })
}
