// Next.js App Router Route Handler — POST /api/subscribe
// Saves email to Supabase and sends welcome + first edition emails via Resend.
//
// Env vars required:
//   RESEND_API_KEY            — API key from resend.com
//   SUPABASE_URL              — Project URL from Supabase → Settings → API
//   SUPABASE_SERVICE_ROLE_KEY — Service role key from Supabase → Settings → API

import { createClient } from "@supabase/supabase-js"
import { renderWelcome, renderEdition } from "@cerebros/email-templates"

export const runtime = "edge"

export async function POST(req: Request): Promise<Response> {
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

  const supabase = createClient(supabaseUrl, supabaseKey)
  const { error: dbError } = await supabase
    .from("subscribers")
    .insert({ email })

  if (dbError) {
    if (dbError.code === "23505") {
      console.log("Already subscribed")
      return json({ ok: true })
    }
    console.error("Supabase insert error:", dbError)
    return json({ error: "No pudimos guardar tu suscripción" }, 500)
  }

  console.log("Subscribed successfully")

  const resendHeaders = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${resendKey}`,
  }

  // Add contact to Resend audience (for broadcasts/marketing emails)
  const audienceId = process.env.RESEND_AUDIENCE_ID
  if (audienceId) {
    const contactRes = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: "POST",
      headers: resendHeaders,
      body: JSON.stringify({ email, unsubscribed: false }),
    })
    if (!contactRes.ok) {
      console.error("Resend contact error:", contactRes.status, await contactRes.text())
    }
  } else {
    console.warn("RESEND_AUDIENCE_ID not set, skipping Resend audience sync")
  }

  // Welcome email — render via shared package
  const welcomeRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: resendHeaders,
    body: JSON.stringify({
      from: "Cerebros Esponjosos <hola@cerebrosesponjosos.com>",
      to: email,
      subject: "Bienvenido a Esponjosos — Cerebros Esponjosos",
      html: renderWelcome({ email }),
    }),
  })
  if (!welcomeRes.ok) {
    console.error("Resend welcome error:", welcomeRes.status, await welcomeRes.text())
  }

  // First edition — scheduled 5 minutes after signup, built with shared edition template
  const sendAt = new Date(Date.now() + 5 * 60_000).toISOString()
  const editionRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: resendHeaders,
    body: JSON.stringify({
      from: "Cerebros Esponjosos <hola@cerebrosesponjosos.com>",
      to: email,
      subject: "Tu cerebro no descansa cuando duermes — Esponjosos #1",
      html: renderEdition({
        email,
        blocks: {
          heroLabel: "Tu primera edición",
          heroTitle: "Esto es lo que",
          heroSubtitle: "no cabe en 60 segundos.",
          article: {
            label: "Artículo de fondo",
            title: "Tu cerebro no descansa cuando duermes",
            url: "https://cerebrosesponjosos.com/blog/sueno-glinfatico",
            excerpt:
              "Durante el sueño profundo, el sistema glinfático drena metabolitos acumulados durante el día.\n\nEs limpieza activa, no reposo. Perderla tiene consecuencias que apenas empezamos a entender.",
            byline: "Por Oscar Trujillo · 8 min de lectura",
          },
          news: [
            {
              publication: "Nature, 2026",
              title: "Nuevas evidencias sobre memoria y sueño REM",
              url: "https://cerebrosesponjosos.com",
              description:
                "Un estudio de Harvard confirma que ciertos tipos de memoria emocional se consolidan exclusivamente durante REM.",
            },
            {
              publication: "Science, 2026",
              title: "El hipocampo se reorganiza cada noche",
              url: "https://cerebrosesponjosos.com",
              description:
                "Nueva técnica de imagen muestra reorganización activa del hipocampo durante sueño profundo.",
            },
            {
              publication: "Cell, 2026",
              title: "Glía: más que soporte, arquitectura cognitiva",
              url: "https://cerebrosesponjosos.com",
              description:
                "Los astrocitos participan activamente en la modulación sináptica, no solo en mantenimiento.",
            },
          ],
          quote:
            "El sueño no es el intervalo entre dos días. Es donde ocurre el día siguiente.",
          signature: "— Oscar & Stephanie",
        },
      }),
      scheduled_at: sendAt,
    }),
  })
  if (!editionRes.ok) {
    console.error("Resend edition error:", editionRes.status, await editionRes.text())
  }

  return json({ ok: true })
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}
