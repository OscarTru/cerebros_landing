// Vercel Serverless Function — POST /api/subscribe
// Subscribes an email to ConvertKit (Kit) via the v4 API.
//
// Env vars required (set in Vercel → Project Settings → Environment Variables):
//   KIT_API_KEY     — API key v4 from kit.com → Settings → Developer
//   KIT_FORM_ID     — the inline form ID (numeric, e.g. 9308636)

interface KitErrorResponse {
  errors?: string[]
  message?: string
}

export default async function handler(
  req: Request
): Promise<Response> {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405)
  }

  const apiKey = process.env.KIT_API_KEY
  const formId = process.env.KIT_FORM_ID
  if (!apiKey || !formId) {
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

  try {
    const res = await fetch(
      `https://api.kit.com/v4/forms/${formId}/subscribers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Kit-Api-Key": apiKey,
        },
        body: JSON.stringify({ email_address: email }),
      }
    )

    if (!res.ok) {
      const text = await res.text()
      let parsed: KitErrorResponse = {}
      try {
        parsed = JSON.parse(text) as KitErrorResponse
      } catch {
        /* ignore */
      }
      console.error("Kit subscribe failed:", res.status, text.slice(0, 300))
      const msg =
        parsed.errors?.[0] ??
        parsed.message ??
        "No pudimos procesar tu suscripción"
      return json({ error: msg }, res.status === 429 ? 429 : 502)
    }

    return json({ ok: true })
  } catch (err) {
    console.error("Kit subscribe exception:", (err as Error).message)
    return json({ error: "Error de red" }, 502)
  }
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}
