// Vercel Edge Function — POST /api/contact
// Receives sponsor/collaboration inquiries and forwards to contacto@cerebrosesponjosos.com via Resend.
//
// Env vars required:
//   RESEND_API_KEY — API key from resend.com

import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { getIP } from "./_ratelimit"

export const config = { runtime: "edge" }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

function contactRatelimit(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    prefix: "rl:contact",
  })
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405)

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return json({ error: "Email not configured" }, 500)

  // Rate limit: 5 contact attempts per IP per hour
  const rl = contactRatelimit()
  if (rl) {
    const { success } = await rl.limit(getIP(req))
    if (!success) return json({ error: "Demasiados intentos. Inténtalo más tarde." }, 429)
  }

  let body: {
    name?: unknown
    email?: unknown
    brand?: unknown
    message?: unknown
    package?: unknown
    website?: unknown // honeypot
  }

  try {
    body = await req.json()
  } catch {
    return json({ error: "Invalid JSON" }, 400)
  }

  // Honeypot
  if (body.website) return json({ ok: true })

  const name = typeof body.name === "string" ? body.name.trim() : ""
  const email = typeof body.email === "string" ? body.email.trim() : ""
  const brand = typeof body.brand === "string" ? body.brand.trim() : ""
  const message = typeof body.message === "string" ? body.message.trim() : ""
  const pkg = typeof body.package === "string" ? body.package.trim() : ""

  if (!name || name.length < 2) return json({ error: "Nombre requerido" }, 400)
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Email inválido" }, 400)
  if (!message || message.length < 10) return json({ error: "Mensaje muy corto" }, 400)
  if (message.length > 2000) return json({ error: "Mensaje demasiado largo" }, 400)

  const subject = pkg
    ? `Colaboración · ${pkg} — ${brand || name}`
    : `Contacto de ${brand || name}`

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; color: #18181b;">
      <h2 style="font-size: 1.25rem; margin-bottom: 1rem;">Nuevo mensaje de contacto</h2>
      <table style="width:100%; border-collapse: collapse; font-size: 0.9rem;">
        <tr>
          <td style="padding: 8px 0; color: #71717a; width: 120px;">Nombre</td>
          <td style="padding: 8px 0; font-weight: 500;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #71717a;">Email</td>
          <td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td>
        </tr>
        ${brand ? `
        <tr>
          <td style="padding: 8px 0; color: #71717a;">Marca / empresa</td>
          <td style="padding: 8px 0;">${brand}</td>
        </tr>` : ""}
        ${pkg ? `
        <tr>
          <td style="padding: 8px 0; color: #71717a;">Paquete</td>
          <td style="padding: 8px 0;">${pkg}</td>
        </tr>` : ""}
      </table>
      <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid #e4e4e7;" />
      <p style="color: #71717a; font-size: 0.8rem; margin-bottom: 0.5rem;">Mensaje:</p>
      <p style="white-space: pre-wrap; line-height: 1.6;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
      <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid #e4e4e7;" />
      <p style="font-size: 0.75rem; color: #a1a1aa;">Enviado desde cerebrosesponjosos.com/media-kit</p>
    </div>
  `

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendKey}`,
    },
    body: JSON.stringify({
      from: "Cerebros Esponjosos <hola@cerebrosesponjosos.com>",
      to: ["contacto@cerebrosesponjosos.com"],
      reply_to: email,
      subject,
      html,
    }),
  })

  if (!res.ok) {
    console.error("Resend error:", await res.text())
    return json({ error: "Error al enviar. Inténtalo de nuevo." }, 500)
  }

  return json({ ok: true })
}
