// Conversión mínima markdown → HTML para cargar posts legacy en TipTap.
// Nuevos posts se guardan como HTML directo (TipTap lo genera).

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function inline(text: string): string {
  let s = escapeHtml(text)
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, url) => `<img alt="${alt}" src="${url}" />`)
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, url) => `<a href="${url}">${label}</a>`)
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  s = s.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>")
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>")
  return s
}

export function markdownToHtml(md: string): string {
  if (!md.trim()) return ""
  // Heurística: si parece HTML (tiene <p> o <h* o <div>), lo devolvemos tal cual.
  if (/<(p|h[1-6]|div|ul|ol|img|blockquote|pre)[\s>]/i.test(md)) return md

  const lines = md.replace(/\r\n/g, "\n").split("\n")
  const out: string[] = []
  let i = 0
  let inList = false
  let inCode = false
  let codeBuf: string[] = []

  const flushList = () => { if (inList) { out.push("</ul>"); inList = false } }

  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith("```")) {
      if (inCode) {
        out.push(`<pre><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`)
        codeBuf = []
        inCode = false
      } else {
        flushList()
        inCode = true
      }
      i++
      continue
    }
    if (inCode) { codeBuf.push(line); i++; continue }

    if (line.trim() === "---") { flushList(); out.push("<hr />"); i++; continue }

    const h = line.match(/^(#{1,3})\s+(.+)$/)
    if (h) {
      flushList()
      const level = h[1].length
      out.push(`<h${level}>${inline(h[2])}</h${level}>`)
      i++
      continue
    }

    const li = line.match(/^-\s+(.+)$/)
    if (li) {
      if (!inList) { out.push("<ul>"); inList = true }
      out.push(`<li>${inline(li[1])}</li>`)
      i++
      continue
    }

    const q = line.match(/^>\s+(.+)$/)
    if (q) { flushList(); out.push(`<blockquote>${inline(q[1])}</blockquote>`); i++; continue }

    if (line.trim() === "") { flushList(); i++; continue }

    flushList()
    const buf: string[] = [line]
    i++
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].match(/^(#{1,3}|---|-\s|>\s|```)/)) {
      buf.push(lines[i])
      i++
    }
    out.push(`<p>${buf.map(inline).join("<br>")}</p>`)
  }
  flushList()
  return out.join("\n")
}
