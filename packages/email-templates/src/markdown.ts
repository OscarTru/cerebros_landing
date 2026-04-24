import { escapeHtml } from "./layout"

// Minimal markdown → HTML. Soporta: párrafos, #/## headings, **bold**, *italic*,
// [text](url), listas no anidadas (-), saltos en línea simples.
// No es CommonMark completo — cubre lo que el editor genera con su toolbar.

export function markdownToHtml(md: string): string {
  if (!md.trim()) return ""
  const blocks = md.replace(/\r\n/g, "\n").split(/\n{2,}/)
  const out: string[] = []

  for (const rawBlock of blocks) {
    const block = rawBlock.trim()
    if (!block) continue

    const h2 = block.match(/^##\s+(.+)$/)
    if (h2) {
      out.push(`<h2>${inline(h2[1])}</h2>`)
      continue
    }
    const h1 = block.match(/^#\s+(.+)$/)
    if (h1) {
      out.push(`<h2>${inline(h1[1])}</h2>`)
      continue
    }

    const lines = block.split("\n")
    if (lines.every((l) => /^-\s+/.test(l))) {
      const items = lines.map((l) => `<li>${inline(l.replace(/^-\s+/, ""))}</li>`).join("")
      out.push(`<ul>${items}</ul>`)
      continue
    }

    const paragraph = lines.map((l) => inline(l)).join("<br>")
    out.push(`<p>${paragraph}</p>`)
  }

  return `<div class="free-md">${out.join("")}</div>`
}

function inline(text: string): string {
  let s = escapeHtml(text)
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, url) => {
    const safeUrl = /^https?:\/\//.test(url) ? url : "#"
    return `<a href="${safeUrl}">${label}</a>`
  })
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  s = s.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>")
  return s
}
