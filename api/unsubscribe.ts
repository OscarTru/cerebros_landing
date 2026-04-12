// Vercel Edge Function — GET /api/unsubscribe?e=EMAIL
// Marks the contact as unsubscribed in Resend and deletes from Supabase subscribers table.

export const config = { runtime: "edge" }

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const email = url.searchParams.get("e")

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return redirect("https://cerebrosesponjosos.com/baja?status=error")
  }

  const resendKey = process.env.RESEND_API_KEY
  const resendAudienceId = process.env.RESEND_AUDIENCE_ID
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Mark unsubscribed in Resend (best-effort)
  if (resendKey && resendAudienceId) {
    await fetch(`https://api.resend.com/audiences/${resendAudienceId}/contacts`, {
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
