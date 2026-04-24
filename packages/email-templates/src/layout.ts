import { BASE_CSS } from "./styles"

function unsubscribeUrl(email: string): string {
  const base = "https://cerebrosesponjosos.com/baja"
  return `${base}?e=${encodeURIComponent(email)}`
}

export interface LayoutOpts {
  title: string
  email: string
  bodyHtml: string
  preheader?: string
  issueDate?: string
  footerLinks?: Array<{ label: string; url: string }>
}

const DEFAULT_FOOTER_LINKS = [
  { label: "Web", url: "https://www.cerebrosesponjosos.com" },
  { label: "Blog", url: "https://www.cerebrosesponjosos.com/blog" },
  { label: "Instagram", url: "https://instagram.com/cerebros.esponjosos" },
  { label: "TikTok", url: "https://tiktok.com/@cerebros.esponjosos" },
]

export function layout(opts: LayoutOpts): string {
  const preheader = opts.preheader ?? ""
  const issueDate = opts.issueDate ?? formatTodayEs()
  const footerLinks = opts.footerLinks ?? DEFAULT_FOOTER_LINKS

  const headerRow = `<table width="100%" cellpadding="0" cellspacing="0" border="0" class="header-row">
    <tr>
      <td style="vertical-align:middle;"></td>
      <td style="text-align:right;vertical-align:middle;">
        <span class="header-date">${escapeHtml(issueDate)}</span>
      </td>
    </tr>
  </table>`

  const footerLinksHtml = footerLinks
    .map((l) => `<a href="${escapeHtml(l.url)}" class="footer-link" style="color:#AAAAAA;text-decoration:none;">${escapeHtml(l.label)}</a>`)
    .join(" ")

  const footer = `<div class="footer">
    <div>${footerLinksHtml}</div>
    <p class="footer-fine">
      Recibiste este correo porque te suscribiste a Esponjosos.<br/>
      <a href="${escapeHtml(unsubscribeUrl(opts.email))}" class="footer-unsub" style="color:#C4C4C4;text-decoration:underline;">Darse de baja</a> &nbsp;·&nbsp; Cerebros Esponjosos
    </p>
  </div>`

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
<title>${escapeHtml(opts.title)}</title>
<style>${BASE_CSS}</style>
</head>
<body>
<div style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">${escapeHtml(preheader)}</div>
<div class="wrapper"><div class="container">
${headerRow}
${opts.bodyHtml}
${footer}
</div></div>
</body>
</html>`
}

function formatTodayEs(): string {
  const d = new Date()
  const months = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ]
  return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
