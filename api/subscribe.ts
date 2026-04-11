// Vercel Serverless Function — POST /api/subscribe
// Saves email to Supabase and sends welcome email via Resend.
//
// Env vars required (set in Vercel → Project Settings → Environment Variables):
//   RESEND_API_KEY          — API key from resend.com
//   SUPABASE_URL            — Project URL from Supabase → Settings → API
//   SUPABASE_SERVICE_ROLE_KEY — Service role key from Supabase → Settings → API

import { createClient } from "@supabase/supabase-js"

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405)
  }

  const resendKey = process.env.RESEND_API_KEY
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!resendKey || !supabaseUrl || !supabaseKey) {
    console.error("Missing env vars: RESEND_API_KEY, SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY")
    return json({ error: "Newsletter not configured" }, 500)
  }

  let body: { email?: unknown; consent?: unknown }
  try {
    body = await req.json()
  } catch {
    return json({ error: "Invalid JSON" }, 400)
  }

  const email = typeof body.email === "string" ? body.email.trim() : ""
  const consent = body.consent === true

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Email inválido" }, 400)
  }
  if (!consent) {
    return json({ error: "Debes aceptar la política de privacidad" }, 400)
  }

  // Save to Supabase
  const supabase = createClient(supabaseUrl, supabaseKey)
  const { error: dbError } = await supabase
    .from("subscribers")
    .insert({ email })

  if (dbError) {
    if (dbError.code === "23505") {
      // Unique violation — already subscribed, treat as success
      console.log(`Already subscribed: ${email}`)
      return json({ ok: true })
    }
    console.error("Supabase insert error:", dbError)
    return json({ error: "No pudimos guardar tu suscripción" }, 500)
  }

  console.log(`Subscribed: ${email}`)

  // Send welcome email via Resend
  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${resendKey}`,
    },
    body: JSON.stringify({
      from: "Cerebros Esponjosos <hola@cerebrosesponjosos.com>",
      to: email,
      subject: "¡Bienvenido a Cerebros Esponjosos!",
      html: `
        <p>Hola,</p>
        <p>Gracias por suscribirte a <strong>Cerebros Esponjosos</strong>.</p>
        <p>Pronto recibirás nuestras notas sobre neurociencia: directas, claras y aplicables.</p>
        <p>— Oscar & Steph</p>
      `,
    }),
  })

  if (!resendRes.ok) {
    const err = await resendRes.text()
    console.error("Resend error:", resendRes.status, err)
    // Don't fail the subscription if email fails — they're already saved
  }

  return json({ ok: true })
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}
