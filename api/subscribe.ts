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
      subject: "Bienvenido a El Privado — Cerebros Esponjosos",
      html: welcomeHtml(),
    }),
  })

  if (!resendRes.ok) {
    const err = await resendRes.text()
    console.error("Resend error:", resendRes.status, err)
    // Don't fail the subscription if email fails — they're already saved
  }

  return json({ ok: true })
}

function welcomeHtml(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Bienvenido a El Privado &mdash; Cerebros Esponjosos</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { background-color:#fafaf9; font-family:'Inter',-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif; -webkit-font-smoothing:antialiased; color:#18181b; }
    @media only screen and (max-width:480px) {
      .hero-title { font-size:32px !important; }
      .body-card { padding:32px 24px !important; }
      .intro-quote { font-size:19px !important; }
      .item-num { font-size:28px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#fafaf9;">

  <!-- WRAPPER -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fafaf9;">
    <tr><td align="center" style="padding:40px 16px;">

      <!-- CONTAINER -->
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%;">

        <!-- HEADER -->
        <tr><td align="center" style="padding:32px 0 28px; border-bottom:1px solid rgba(0,0,0,0.08);">
          <a href="https://www.cerebrosesponjosos.com" style="font-family:'Instrument Serif',Georgia,serif; font-size:22px; font-weight:400; color:#18181b; text-decoration:none; letter-spacing:-0.02em;">Cerebros Esponjosos</a>
        </td></tr>

        <!-- BADGE -->
        <tr><td align="center" style="padding:40px 0 16px;">
          <span style="display:inline-block; border:1px solid rgba(0,0,0,0.18); border-radius:9999px; padding:5px 20px; font-family:'Inter',sans-serif; font-size:10px; font-weight:500; letter-spacing:0.25em; text-transform:uppercase; color:#71717a;">&middot; El Privado &middot;</span>
        </td></tr>

        <!-- HERO -->
        <tr><td align="center" style="padding:8px 24px 44px;">
          <h1 class="hero-title" style="font-family:'Instrument Serif',Georgia,serif; font-size:44px; font-weight:400; line-height:1.1; letter-spacing:-0.03em; color:#18181b; margin:0 0 8px;">
            Bienvenido.<br/><span style="font-style:italic; color:#a1a1aa;">Ya eres parte.</span>
          </h1>
          <p style="font-family:'Inter',sans-serif; font-size:15px; font-weight:300; color:#71717a; line-height:1.6; margin-top:16px;">
            Una vez por semana. Lo que tu cerebro necesita saber.
          </p>
        </td></tr>

        <!-- DIVIDER -->
        <tr><td style="border-top:1px solid rgba(0,0,0,0.08); font-size:0; line-height:0;">&nbsp;</td></tr>

        <!-- BODY CARD -->
        <tr><td class="body-card" style="background-color:#f4f4f5; padding:48px 44px;">

          <!-- Intro label -->
          <p style="font-family:'Inter',sans-serif; font-size:10px; font-weight:500; letter-spacing:0.25em; text-transform:uppercase; color:#a1a1aa; margin-bottom:20px;">Una nota personal</p>

          <!-- Intro quote -->
          <p class="intro-quote" style="font-family:'Instrument Serif',Georgia,serif; font-size:22px; font-weight:400; line-height:1.5; color:#18181b; margin-bottom:32px;">
            Esto no es una newsletter de salud. Es una conversaci&oacute;n que deber&iacute;a haber existido desde hace mucho.
          </p>

          <!-- Body paragraphs -->
          <p style="font-family:'Inter',sans-serif; font-size:15px; font-weight:300; line-height:1.75; color:#52525b; margin-bottom:20px;">
            Cada semana te traemos algo que cambia c&oacute;mo entiendes lo que te pasa por dentro &mdash; no desde arriba, no como una clase, sino como dos m&eacute;dicos que acaban de encontrar algo y no pueden guard&aacute;rselo.
          </p>
          <p style="font-family:'Inter',sans-serif; font-size:15px; font-weight:300; line-height:1.75; color:#52525b; margin-bottom:20px;">
            El nombre es <strong style="font-weight:500; color:#18181b;">El Privado</strong> porque es exactamente eso: lo que no cabe en un Reel de 60 segundos. Las ideas que necesitan espacio para respirar. La ciencia que merece m&aacute;s de una frase.
          </p>
          <p style="font-family:'Inter',sans-serif; font-size:15px; font-weight:300; line-height:1.75; color:#52525b; margin-bottom:0;">
            Nos alegra que est&eacute;s aqu&iacute;.
          </p>

          <!-- DIVIDER -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:40px 0;">
            <tr><td style="border-top:1px solid rgba(0,0,0,0.08);"></td></tr>
          </table>

          <!-- WHAT TO EXPECT -->
          <p style="font-family:'Inter',sans-serif; font-size:10px; font-weight:500; letter-spacing:0.25em; text-transform:uppercase; color:#a1a1aa; margin-bottom:28px;">Qu&eacute; encontrar&aacute;s cada semana</p>

          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="width:44px; vertical-align:top; padding-top:2px;">
                <span class="item-num" style="font-family:'Instrument Serif',Georgia,serif; font-size:32px; font-style:italic; color:#a1a1aa; letter-spacing:-0.02em;">01</span>
              </td>
              <td style="vertical-align:top; padding-left:8px;">
                <p style="font-family:'Inter',sans-serif; font-size:14px; font-weight:500; color:#18181b; margin-bottom:4px;">Art&iacute;culo de fondo</p>
                <p style="font-family:'Inter',sans-serif; font-size:13px; font-weight:300; color:#71717a; line-height:1.6;">Un tema del cerebro explicado con profundidad real. Sin atajos, sin simplificaciones vac&iacute;as.</p>
              </td>
            </tr>
            <tr><td colspan="2" style="height:22px;"></td></tr>
            <tr>
              <td style="width:44px; vertical-align:top; padding-top:2px;">
                <span class="item-num" style="font-family:'Instrument Serif',Georgia,serif; font-size:32px; font-style:italic; color:#a1a1aa; letter-spacing:-0.02em;">02</span>
              </td>
              <td style="vertical-align:top; padding-left:8px;">
                <p style="font-family:'Inter',sans-serif; font-size:14px; font-weight:500; color:#18181b; margin-bottom:4px;">Noticias que importan</p>
                <p style="font-family:'Inter',sans-serif; font-size:13px; font-weight:300; color:#71717a; line-height:1.6;">Las 2 o 3 publicaciones y hallazgos de la semana que realmente vale la pena conocer.</p>
              </td>
            </tr>
            <tr><td colspan="2" style="height:22px;"></td></tr>
            <tr>
              <td style="width:44px; vertical-align:top; padding-top:2px;">
                <span class="item-num" style="font-family:'Instrument Serif',Georgia,serif; font-size:32px; font-style:italic; color:#a1a1aa; letter-spacing:-0.02em;">03</span>
              </td>
              <td style="vertical-align:top; padding-left:8px;">
                <p style="font-family:'Inter',sans-serif; font-size:14px; font-weight:500; color:#18181b; margin-bottom:4px;">Una idea para llevar</p>
                <p style="font-family:'Inter',sans-serif; font-size:13px; font-weight:300; color:#71717a; line-height:1.6;">Algo concreto. Una frase, un dato, una forma distinta de ver algo cotidiano.</p>
              </td>
            </tr>
          </table>

          <!-- DIVIDER -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:40px 0 0;">
            <tr><td style="border-top:1px solid rgba(0,0,0,0.08);"></td></tr>
          </table>

          <!-- SIGNATURE -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
            <tr><td>
              <p style="font-family:'Instrument Serif',Georgia,serif; font-size:16px; font-style:italic; color:#71717a; line-height:1.7; margin-bottom:20px;">
                &ldquo;Hacemos esto porque creemos que entender tu cerebro cambia c&oacute;mo vives. Y porque nadie lo estaba contando bien en espa&ntilde;ol.&rdquo;
              </p>
              <p style="font-family:'Inter',sans-serif; font-size:13px; font-weight:500; color:#18181b;">Oscar &amp; Stephanie</p>
              <p style="font-family:'Inter',sans-serif; font-size:12px; font-weight:300; color:#a1a1aa; margin-top:2px;">Cerebros Esponjosos</p>
            </td></tr>
          </table>

        </td></tr>

        <!-- CTA -->
        <tr><td align="center" style="padding:40px 24px;">
          <p style="font-family:'Inter',sans-serif; font-size:13px; font-weight:300; color:#71717a; margin-bottom:20px; line-height:1.6;">
            Mientras tanto, expl&oacute;ranos por aqu&iacute;:
          </p>
          <a href="https://www.cerebrosesponjosos.com" style="display:inline-block; background-color:#18181b; color:#ffffff; text-decoration:none; font-family:'Inter',sans-serif; font-size:13px; font-weight:400; letter-spacing:0.04em; padding:14px 36px; border-radius:9999px;">
            Visitar la web &rarr;
          </a>
        </td></tr>

        <!-- DIVIDER -->
        <tr><td style="border-top:1px solid rgba(0,0,0,0.08); font-size:0; line-height:0;">&nbsp;</td></tr>

        <!-- FOOTER -->
        <tr><td align="center" style="padding:32px 24px 40px;">

          <!-- Social icons (monochrome inline SVG) -->
          <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:20px;">
            <tr>
              <!-- Instagram -->
              <td style="padding:0 12px;">
                <a href="https://www.instagram.com/cerebros.esponjosos/" target="_blank" style="text-decoration:none;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="#a1a1aa" stroke="none"/>
                  </svg>
                </a>
              </td>
              <!-- TikTok -->
              <td style="padding:0 12px;">
                <a href="https://www.tiktok.com/@cerebros.esponjosos" target="_blank" style="text-decoration:none;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#a1a1aa" style="display:block;">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.74a4.85 4.85 0 0 1-1.01-.05z"/>
                  </svg>
                </a>
              </td>
              <!-- YouTube -->
              <td style="padding:0 12px;">
                <a href="https://www.youtube.com/@CerebrosEsponjosos" target="_blank" style="text-decoration:none;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
                    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#a1a1aa" stroke="none"/>
                  </svg>
                </a>
              </td>
            </tr>
          </table>

          <!-- Text links -->
          <p style="font-family:'Inter',sans-serif; font-size:12px; color:#a1a1aa; margin-bottom:16px;">
            <a href="https://www.instagram.com/cerebros.esponjosos/" style="color:#71717a; text-decoration:none; margin:0 10px;">Instagram</a>
            <span style="color:#d4d4d8;">&middot;</span>
            <a href="https://www.tiktok.com/@cerebros.esponjosos" style="color:#71717a; text-decoration:none; margin:0 10px;">TikTok</a>
            <span style="color:#d4d4d8;">&middot;</span>
            <a href="https://www.youtube.com/@CerebrosEsponjosos" style="color:#71717a; text-decoration:none; margin:0 10px;">YouTube</a>
            <span style="color:#d4d4d8;">&middot;</span>
            <a href="https://www.cerebrosesponjosos.com" style="color:#71717a; text-decoration:none; margin:0 10px;">Web</a>
          </p>

          <!-- Fine print -->
          <p style="font-family:'Inter',sans-serif; font-size:11px; font-weight:300; color:#a1a1aa; line-height:1.7;">
            Recibiste este email porque te suscribiste a El Privado.<br/>
            &copy; Cerebros Esponjosos
          </p>
        </td></tr>

      </table>
      <!-- /CONTAINER -->

    </td></tr>
  </table>
  <!-- /WRAPPER -->

</body>
</html>`
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}
