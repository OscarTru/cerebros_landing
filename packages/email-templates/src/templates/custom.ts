import { layout } from "../layout"

// Si el HTML ya es un documento completo (contiene <html>), se envía tal cual
// tras reemplazar placeholders y forzar links negros.
// Si es un fragmento, se envuelve con el layout estándar.
export function renderCustom(ctx: { email: string; html: string; subject: string }): string {
  const isFullDocument = /<html[\s>]/i.test(ctx.html)
  const unsubscribeUrl = `https://cerebrosesponjosos.com/baja?e=${encodeURIComponent(ctx.email)}`

  const processed = forceBlackLinks(
    ctx.html
      .replace(/\{\{\s*unsubscribe_url\s*\}\}/g, unsubscribeUrl)
      .replace(/\{\{\s*email\s*\}\}/g, ctx.email)
  )

  if (isFullDocument) return processed

  // Fragmento: envolver con layout para inyectar BASE_CSS + footer.
  return layout({
    title: ctx.subject,
    email: ctx.email,
    preheader: ctx.subject,
    bodyHtml: processed,
  })
}

// Para cada <a>, garantiza que tenga style="color:#1a1a1a;text-decoration:none;".
// Gmail ignora CSS de <style> en <a>, solo respeta inline styles.
// - Si el <a> no tiene style → se añade completo.
// - Si el <a> tiene style pero sin color → se añade color al inicio del style.
// - Si el <a> tiene style con color ya definido → se respeta (tú decidiste ese color).
// Clases conocidas (footer-link, footer-unsub, cta-dark-btn) mantienen sus colores específicos.
function forceBlackLinks(html: string): string {
  return html.replace(/<a\b([^>]*)>/gi, (match, attrs) => {
    const classMatch = attrs.match(/class\s*=\s*["']([^"']+)["']/i)
    const classes = classMatch ? classMatch[1] : ""

    let color = "#1a1a1a"
    let textDecoration = "none"
    if (classes.includes("footer-link")) {
      color = "#AAAAAA"
    } else if (classes.includes("footer-unsub")) {
      color = "#C4C4C4"
      textDecoration = "underline"
    } else if (classes.includes("cta-dark-btn")) {
      color = "#1a1a1a"
    } else if (classes.includes("article-cta")) {
      color = "#1a1a1a"
      // note: border-bottom ya está en la clase
    }

    const styleMatch = attrs.match(/\bstyle\s*=\s*(["'])([\s\S]*?)\1/i)
    if (styleMatch) {
      const existing = styleMatch[2]
      // Si ya define color explícito, respetar.
      if (/\bcolor\s*:/i.test(existing)) return match
      // Inyectar color al inicio.
      const newStyle = `color:${color};text-decoration:${textDecoration};${existing}`
      const newAttrs = attrs.replace(/\bstyle\s*=\s*(["'])[\s\S]*?\1/i, `style="${newStyle}"`)
      return `<a${newAttrs}>`
    }

    // No tiene style → añadir uno.
    return `<a${attrs} style="color:${color};text-decoration:${textDecoration};">`
  })
}
