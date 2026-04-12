// Vercel Serverless Function — POST /api/subscribe
// Saves email to Supabase and sends welcome email via Resend.
//
// Env vars required (set in Vercel → Project Settings → Environment Variables):
//   RESEND_API_KEY          — API key from resend.com
//   SUPABASE_URL            — Project URL from Supabase → Settings → API
//   SUPABASE_SERVICE_ROLE_KEY — Service role key from Supabase → Settings → API

import { createClient } from "@supabase/supabase-js"

export const config = { runtime: "edge" }

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405)
  }

  const resendKey = process.env.RESEND_API_KEY
  const resendAudienceId = process.env.RESEND_AUDIENCE_ID
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

  // Add contact to Resend for broadcasts
  const contactRes = await fetch("https://api.resend.com/contacts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${resendKey}`,
    },
    body: JSON.stringify({ email, unsubscribed: false, ...(resendAudienceId ? { audience_id: resendAudienceId } : {}) }),
  })
  if (!contactRes.ok) {
    console.error("Resend contact error:", contactRes.status, await contactRes.text())
  }

  // Send welcome email via Resend
  const sendEmail = (subject: string, html: string) =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "Cerebros Esponjosos <hola@cerebrosesponjosos.com>",
        to: email,
        subject,
        html,
        ...(resendAudienceId ? { audience_id: resendAudienceId } : {}),
      }),
    })

  const welcomeRes = await sendEmail(
    "Bienvenido a Esponjosos — Cerebros Esponjosos",
    welcomeHtml(),
  )
  if (!welcomeRes.ok) {
    console.error("Resend welcome error:", welcomeRes.status, await welcomeRes.text())
  }

  // Schedule first newsletter edition 5 minutes after signup via Resend's scheduled_at
  const sendAt = new Date(Date.now() + 5 * 60_000).toISOString()
  const editionRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${resendKey}`,
    },
    body: JSON.stringify({
      from: "Cerebros Esponjosos <hola@cerebrosesponjosos.com>",
      to: email,
      subject: "Tu cerebro no descansa cuando duermes — Esponjosos #1",
      html: firstEditionHtml(),
      scheduled_at: sendAt,
      ...(resendAudienceId ? { audience_id: resendAudienceId } : {}),
    }),
  })
  if (!editionRes.ok) {
    console.error("Resend edition error:", editionRes.status, await editionRes.text())
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
  <title>Bienvenido a Esponjosos &mdash; Cerebros Esponjosos</title>
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
          <span style="display:inline-block; border:1px solid rgba(0,0,0,0.18); border-radius:9999px; padding:5px 20px; font-family:'Inter',sans-serif; font-size:10px; font-weight:500; letter-spacing:0.25em; text-transform:uppercase; color:#71717a;">&middot; Esponjosos &middot;</span>
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
            Le llamamos <strong style="font-weight:500; color:#18181b;">Esponjosos</strong> porque as&iacute; es como queremos que se sienta: tu cerebro absorbiendo algo bueno, sin presi&oacute;n, sin formato acad&eacute;mico, solo dos residentes que encontraron algo y no pueden guard&aacute;rselo.
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
            Recibiste este email porque te suscribiste a Esponjosos.<br/>
            &copy; Cerebros Esponjosos &nbsp;&middot;&nbsp;
            <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#71717a; text-decoration:underline;">Cancelar suscripción</a>
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

function firstEditionHtml(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Tu cerebro no descansa cuando duermes &mdash; Esponjosos #1</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { background-color:#fafaf9; font-family:'Inter',-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif; -webkit-font-smoothing:antialiased; color:#18181b; }
    @media only screen and (max-width:480px) {
      .cover-title { font-size:28px !important; }
      .section-pad { padding-left:24px !important; padding-right:24px !important; }
      .article-title { font-size:22px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#fafaf9;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fafaf9;">
    <tr><td align="center" style="padding:40px 16px;">

      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%;">

        <!-- HEADER -->
        <tr><td style="padding:28px 0; border-bottom:1px solid rgba(0,0,0,0.08);">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td><a href="https://www.cerebrosesponjosos.com" style="font-family:'Instrument Serif',Georgia,serif; font-size:18px; font-weight:400; color:#18181b; text-decoration:none; letter-spacing:-0.02em;">Cerebros Esponjosos</a></td>
              <td style="text-align:right;"><span style="font-family:'Inter',sans-serif; font-size:11px; font-weight:300; color:#a1a1aa; letter-spacing:0.05em;">Primera edici&oacute;n</span></td>
            </tr>
          </table>
        </td></tr>

        <!-- COVER (dark) -->
        <tr><td style="background-color:#18181b; padding:52px 48px 48px;" class="section-pad">
          <p style="font-family:'Inter',sans-serif; font-size:9px; font-weight:500; letter-spacing:0.22em; text-transform:uppercase; color:rgba(255,255,255,0.35); margin-bottom:10px;">Tu primera edici&oacute;n</p>
          <span style="display:inline-block; border:1px solid rgba(255,255,255,0.2); border-radius:9999px; padding:5px 16px; font-family:'Inter',sans-serif; font-size:9px; font-weight:500; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.45); margin-bottom:32px;">&middot; Esponjosos &middot;</span>
          <h1 class="cover-title" style="font-family:'Instrument Serif',Georgia,serif; font-size:38px; font-weight:400; line-height:1.18; color:#ffffff; margin-bottom:8px; letter-spacing:-0.03em;">
            Esto es lo que<br/><span style="font-style:italic; color:rgba(255,255,255,0.45);">no cabe en 60 segundos.</span>
          </h1>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0;">
            <tr><td style="border-top:1px solid rgba(255,255,255,0.1);"></td></tr>
          </table>
          <p style="font-family:'Inter',sans-serif; font-size:14px; font-weight:300; line-height:1.8; color:rgba(255,255,255,0.6);">
            Cada semana seleccionamos un tema del cerebro que merece m&aacute;s de un Reel. Lo analizamos, lo sustentamos con ciencia real, y te lo traemos aqu&iacute;.<br/><br/>
            Esta es tu primera edici&oacute;n de <strong style="color:rgba(255,255,255,0.85); font-weight:400;">Esponjosos</strong>. Sin publicidad. Sin relleno. Solo lo que vale la pena leer.
          </p>
        </td></tr>

        <!-- BODY -->
        <tr><td style="background-color:#ffffff;">

          <!-- ART&Iacute;CULO PRINCIPAL -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td class="section-pad" style="padding:44px 48px 40px; border-bottom:1px solid rgba(0,0,0,0.06);">
              <p style="font-family:'Inter',sans-serif; font-size:9px; font-weight:500; letter-spacing:0.2em; text-transform:uppercase; color:#a1a1aa; margin-bottom:18px;">Art&iacute;culo de fondo</p>
              <a href="https://www.cerebrosesponjosos.com/blog/tu-cerebro-no-descansa-cuando-duermes" class="article-title" style="font-family:'Instrument Serif',Georgia,serif; font-size:26px; font-weight:400; line-height:1.28; color:#18181b; text-decoration:none; display:block; margin-bottom:18px; letter-spacing:-0.02em;">
                Tu cerebro no descansa cuando duermes
              </a>
              <p style="font-family:'Inter',sans-serif; font-size:14px; font-weight:300; line-height:1.8; color:#52525b; margin-bottom:10px;">
                Piensa en la &uacute;ltima vez que te acostaste tarde. Te despertaste sintiendo que algo faltaba. Ten&iacute;as raz&oacute;n &mdash; solo que lo que perdiste no fue descanso.
              </p>
              <p style="font-family:'Inter',sans-serif; font-size:14px; font-weight:300; line-height:1.8; color:#52525b; margin-bottom:10px;">
                En 2018, el NIH mantuvo a personas sanas despiertas una sola noche y midi&oacute; los niveles de beta-amiloide en su cerebro &mdash; la prote&iacute;na del Alzheimer. Despu&eacute;s de una noche, hab&iacute;an subido un 5% en el hipocampo y el t&aacute;lamo. Eso es solo el principio de lo que pasa mientras duermes: tu cerebro archiva, edita emociones y hace una limpieza activa. <strong style="font-weight:500; color:#18181b;">Ninguna de esas tres cosas puede hacerlas de d&iacute;a.</strong>
              </p>
              <p style="font-family:'Inter',sans-serif; font-size:11px; font-weight:300; color:#a1a1aa; margin-bottom:24px;">Por Oscar Trujillo &nbsp;&middot;&nbsp; 8 min de lectura</p>
              <a href="https://www.cerebrosesponjosos.com/blog/tu-cerebro-no-descansa-cuando-duermes" style="font-family:'Inter',sans-serif; font-size:12px; font-weight:500; color:#18181b; text-decoration:none; border-bottom:1px solid #18181b; padding-bottom:2px; letter-spacing:0.02em;">Leer art&iacute;culo completo &rarr;</a>
            </td></tr>

            <!-- NOTICIAS -->
            <tr><td class="section-pad" style="padding:40px 48px; border-bottom:1px solid rgba(0,0,0,0.06);">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td><span style="font-family:'Inter',sans-serif; font-size:9px; font-weight:500; letter-spacing:0.2em; text-transform:uppercase; color:#a1a1aa;">Lo que pas&oacute; esta semana</span></td>
                  <td style="text-align:right;"><span style="font-family:'Instrument Serif',Georgia,serif; font-size:13px; font-style:italic; color:#a1a1aa;">3 noticias</span></td>
                </tr>
              </table>

              <!-- Noticia 1 -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr><td>
                  <p style="font-family:'Inter',sans-serif; font-size:9px; font-weight:500; letter-spacing:0.14em; text-transform:uppercase; color:#a1a1aa; margin-bottom:7px;">Nature Communications &middot; 2026</p>
                  <a href="https://www.nature.com/articles/s41467-026-68374-8" style="font-family:'Instrument Serif',Georgia,serif; font-size:17px; font-weight:400; color:#18181b; line-height:1.38; text-decoration:none; display:block; margin-bottom:8px; letter-spacing:-0.01em;">Confirmado en humanos: el sistema glinf&aacute;tico elimina las prote&iacute;nas del Alzheimer solo cuando dormimos</a>
                  <p style="font-family:'Inter',sans-serif; font-size:13px; font-weight:300; line-height:1.72; color:#71717a;">Por primera vez en sujetos humanos, el equipo de Maiken Nedergaard demostr&oacute; que el l&iacute;quido cefalorraqu&iacute;deo arrastra activamente beta-amiloide y tau fosforilada fuera del cerebro durante el sue&ntilde;o. El hallazgo convierte la privaci&oacute;n cr&oacute;nica de sue&ntilde;o en un factor de riesgo de Alzheimer directamente modificable.</p>
                </td></tr>
              </table>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr><td style="border-top:1px solid rgba(0,0,0,0.04);"></td></tr>
              </table>

              <!-- Noticia 2 -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr><td>
                  <p style="font-family:'Inter',sans-serif; font-size:9px; font-weight:500; letter-spacing:0.14em; text-transform:uppercase; color:#a1a1aa; margin-bottom:7px;">Cell &middot; enero 2025</p>
                  <a href="https://www.cell.com/cell/fulltext/S0092-8674(24)01343-6" style="font-family:'Instrument Serif',Georgia,serif; font-size:17px; font-weight:400; color:#18181b; line-height:1.38; text-decoration:none; display:block; margin-bottom:8px; letter-spacing:-0.01em;">Descubierto el mecanismo exacto que impulsa la limpieza cerebral durante el sue&ntilde;o profundo</a>
                  <p style="font-family:'Inter',sans-serif; font-size:13px; font-weight:300; line-height:1.72; color:#71717a;">El laboratorio de Nedergaard identific&oacute; que durante el sue&ntilde;o NREM el tronco cerebral libera peque&ntilde;as ondas de norepinefrina cada 50 segundos. Esas ondas contraen los vasos sangu&iacute;neos y generan pulsaciones r&iacute;tmicas que act&uacute;an como una bomba, empujando el l&iacute;quido a trav&eacute;s del sistema glinf&aacute;tico. Adem&aacute;s, el zolpidem &mdash; uno de los somn&iacute;feros m&aacute;s recetados del mundo &mdash; suprime estas oscilaciones.</p>
                </td></tr>
              </table>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr><td style="border-top:1px solid rgba(0,0,0,0.04);"></td></tr>
              </table>

              <!-- Noticia 3 -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td>
                  <p style="font-family:'Inter',sans-serif; font-size:9px; font-weight:500; letter-spacing:0.14em; text-transform:uppercase; color:#a1a1aa; margin-bottom:7px;">JAMA Network Open &middot; 2024</p>
                  <a href="https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2841638" style="font-family:'Instrument Serif',Georgia,serif; font-size:17px; font-weight:400; color:#18181b; line-height:1.38; text-decoration:none; display:block; margin-bottom:8px; letter-spacing:-0.01em;">Ejercicio en la mediana edad reduce el riesgo de demencia hasta en un 45%</a>
                  <p style="font-family:'Inter',sans-serif; font-size:13px; font-weight:300; line-height:1.72; color:#71717a;">Un estudio del Framingham Heart Study encontr&oacute; que quienes hac&iacute;an ejercicio regular entre los 45 y 64 a&ntilde;os reduc&iacute;an su riesgo de demencia en un 41%, y quienes lo manten&iacute;an despu&eacute;s de los 65 llegaban a un 45%. El mecanismo: el ejercicio aer&oacute;bico aumenta el BDNF, promueve la neurog&eacute;nesis hipocampal y reduce la neuroinflamaci&oacute;n cr&oacute;nica.</p>
                </td></tr>
              </table>
            </td></tr>

            <!-- IDEA PARA LLEVAR -->
            <tr><td class="section-pad" style="padding:40px 48px; background-color:#f4f4f5; border-bottom:1px solid rgba(0,0,0,0.06);">
              <p style="font-family:'Inter',sans-serif; font-size:9px; font-weight:500; letter-spacing:0.2em; text-transform:uppercase; color:#a1a1aa; margin-bottom:20px;">Una idea para llevar</p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width:3px; background-color:#18181b;"></td>
                  <td style="padding-left:20px;">
                    <p style="font-family:'Instrument Serif',Georgia,serif; font-size:19px; font-style:italic; font-weight:400; line-height:1.6; color:#18181b;">
                      &ldquo;El sue&ntilde;o no es el intervalo entre d&iacute;as productivos. Es el proceso que hace posible que los d&iacute;as productivos ocurran.&rdquo;
                    </p>
                  </td>
                </tr>
              </table>
            </td></tr>

            <!-- FIRMA -->
            <tr><td class="section-pad" style="padding:40px 48px 44px;">
              <p style="font-family:'Inter',sans-serif; font-size:14px; font-weight:300; color:#71717a; line-height:1.78; margin-bottom:24px;">
                Esto es Esponjosos. Una vez por semana, en tu correo, sin ruido.<br/><br/>
                Si esta edici&oacute;n te hizo pensar diferente sobre algo que das por sentado cada noche, ya hicimos nuestro trabajo. La pr&oacute;xima semana seguimos.
              </p>
              <p style="font-family:'Instrument Serif',Georgia,serif; font-size:16px; font-weight:400; color:#18181b;">Oscar &amp; Stephanie</p>
              <p style="font-family:'Inter',sans-serif; font-size:12px; font-weight:300; color:#a1a1aa; margin-top:3px;">Cerebros Esponjosos</p>
            </td></tr>
          </table>

        </td></tr>

        <!-- DIVIDER -->
        <tr><td style="border-top:1px solid rgba(0,0,0,0.08); font-size:0; line-height:0;">&nbsp;</td></tr>

        <!-- FOOTER -->
        <tr><td align="center" style="padding:32px 24px 40px;">
          <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:20px;">
            <tr>
              <td style="padding:0 12px;">
                <a href="https://www.instagram.com/cerebros.esponjosos/" target="_blank" style="text-decoration:none;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="#a1a1aa" stroke="none"/></svg>
                </a>
              </td>
              <td style="padding:0 12px;">
                <a href="https://www.tiktok.com/@cerebros.esponjosos" target="_blank" style="text-decoration:none;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#a1a1aa" style="display:block;"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.74a4.85 4.85 0 0 1-1.01-.05z"/></svg>
                </a>
              </td>
              <td style="padding:0 12px;">
                <a href="https://www.youtube.com/@CerebrosEsponjosos" target="_blank" style="text-decoration:none;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#a1a1aa" stroke="none"/></svg>
                </a>
              </td>
            </tr>
          </table>
          <p style="font-family:'Inter',sans-serif; font-size:12px; color:#a1a1aa; margin-bottom:16px;">
            <a href="https://www.instagram.com/cerebros.esponjosos/" style="color:#71717a; text-decoration:none; margin:0 10px;">Instagram</a>
            <span style="color:#d4d4d8;">&middot;</span>
            <a href="https://www.tiktok.com/@cerebros.esponjosos" style="color:#71717a; text-decoration:none; margin:0 10px;">TikTok</a>
            <span style="color:#d4d4d8;">&middot;</span>
            <a href="https://www.youtube.com/@CerebrosEsponjosos" style="color:#71717a; text-decoration:none; margin:0 10px;">YouTube</a>
            <span style="color:#d4d4d8;">&middot;</span>
            <a href="https://www.cerebrosesponjosos.com" style="color:#71717a; text-decoration:none; margin:0 10px;">Web</a>
          </p>
          <p style="font-family:'Inter',sans-serif; font-size:11px; font-weight:300; color:#a1a1aa; line-height:1.7;">
            Recibiste este email porque te suscribiste a Esponjosos.<br/>
            &copy; Cerebros Esponjosos &nbsp;&middot;&nbsp;
            <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#71717a; text-decoration:underline;">Cancelar suscripción</a>
          </p>
        </td></tr>

      </table>

    </td></tr>
  </table>

</body>
</html>`
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}
