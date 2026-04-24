import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/clerk"
import { getSupabase } from "@/lib/supabase"

type Params = { params: Promise<{ id: string }> }

// Render mínimo de markdown a HTML para el preview iframe del editor.
// No pretende ser production-grade (el landing usa MDXRemote); solo visualiza el contenido.
function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function renderInline(text: string): string {
  let s = escapeHtml(text)
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, url) => `<a href="${url}">${label}</a>`)
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, url) => {
    const isCloudinaryId = !url.startsWith("http")
    const src = isCloudinaryId
      ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo"}/image/upload/q_auto,f_auto,w_1200/${url}`
      : url
    return `<img src="${src}" alt="${alt}" style="max-width:100%;height:auto;margin:24px 0;border-radius:8px;" />`
  })
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  s = s.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>")
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>")
  return s
}

function markdownToHtml(md: string): string {
  if (!md.trim()) return '<p style="color:#9ca3af;">Empieza a escribir...</p>'
  // Si ya es HTML (TipTap), devolverlo tal cual
  if (/<(p|h[1-6]|ul|ol|div|blockquote|pre|img|hr)[\s>]/i.test(md)) return md
  const lines = md.replace(/\r\n/g, "\n").split("\n")
  const out: string[] = []
  let i = 0
  let inList = false
  let inCode = false
  let codeBuf: string[] = []

  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith("```")) {
      if (inCode) {
        out.push(`<pre><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`)
        codeBuf = []
        inCode = false
      } else {
        inCode = true
      }
      i++
      continue
    }
    if (inCode) {
      codeBuf.push(line)
      i++
      continue
    }

    if (line.trim() === "---") {
      if (inList) { out.push("</ul>"); inList = false }
      out.push('<hr />')
      i++
      continue
    }

    const h = line.match(/^(#{1,3})\s+(.+)$/)
    if (h) {
      if (inList) { out.push("</ul>"); inList = false }
      const level = h[1].length
      out.push(`<h${level}>${renderInline(h[2])}</h${level}>`)
      i++
      continue
    }

    const li = line.match(/^-\s+(.+)$/)
    if (li) {
      if (!inList) { out.push("<ul>"); inList = true }
      out.push(`<li>${renderInline(li[1])}</li>`)
      i++
      continue
    }

    const q = line.match(/^>\s+(.+)$/)
    if (q) {
      if (inList) { out.push("</ul>"); inList = false }
      out.push(`<blockquote>${renderInline(q[1])}</blockquote>`)
      i++
      continue
    }

    if (line.trim() === "") {
      if (inList) { out.push("</ul>"); inList = false }
      i++
      continue
    }

    // Paragraph — junta líneas consecutivas hasta línea vacía
    if (inList) { out.push("</ul>"); inList = false }
    const buf: string[] = [line]
    i++
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].match(/^(#{1,3}|---|-\s|>\s|```)/)) {
      buf.push(lines[i])
      i++
    }
    out.push(`<p>${buf.map(renderInline).join("<br>")}</p>`)
  }
  if (inList) out.push("</ul>")
  return out.join("\n")
}

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    await requireRole(["owner", "editor", "viewer"])
  } catch (e) {
    return e instanceof Response ? e : NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  const { data, error } = await getSupabase()
    .from("blog_posts")
    .select("title, description, content, image, author")
    .eq("id", id)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "No existe" }, { status: 404 })

  const heroImage = data.image
    ? `<img src="https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo"}/image/upload/q_auto,f_auto,w_1200/${data.image}" alt="" style="width:100%;max-height:380px;object-fit:cover;border-radius:12px;margin-bottom:32px;" />`
    : ""

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 48px 24px; background: #f8f7f5; color: #1a1a1a; font-family: 'Inter', -apple-system, sans-serif; font-weight: 300; line-height: 1.78; }
  .wrap { max-width: 680px; margin: 0 auto; }
  h1 { font-family: 'Instrument Serif', Georgia, serif; font-size: 42px; font-weight: 400; line-height: 1.12; margin: 0 0 12px; }
  h2 { font-family: 'Instrument Serif', Georgia, serif; font-size: 28px; font-weight: 400; line-height: 1.2; margin: 40px 0 12px; }
  h3 { font-family: 'Instrument Serif', Georgia, serif; font-size: 22px; font-weight: 400; margin: 32px 0 8px; }
  p { font-size: 17px; line-height: 1.78; margin: 16px 0; color: #2a2a2a; }
  .desc { font-size: 18px; color: #555; font-style: italic; margin-bottom: 24px; }
  .meta { font-size: 12px; color: #999; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 32px; }
  hr { border: 0; border-top: 1px solid #e5e5e5; margin: 40px 0; }
  a { color: #1a1a1a; text-decoration: underline; }
  strong { font-weight: 500; }
  em { font-style: italic; }
  ul { padding-left: 24px; }
  li { margin: 8px 0; }
  blockquote { border-left: 3px solid #1a1a1a; padding-left: 20px; margin: 24px 0; font-style: italic; color: #555; }
  pre { background: #1a1a1a; color: #f0f0f0; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 13px; font-family: ui-monospace, monospace; }
  code { background: #eee; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-family: ui-monospace, monospace; }
  pre code { background: transparent; padding: 0; }
  img { max-width: 100%; height: auto; }
</style>
</head>
<body>
<div class="wrap">
  <p class="meta">${data.author ? escapeHtml(data.author) : ""}</p>
  <h1>${escapeHtml(data.title || "Sin título")}</h1>
  ${data.description ? `<p class="desc">${escapeHtml(data.description)}</p>` : ""}
  ${heroImage}
  ${markdownToHtml(data.content || "")}
</div>
</body>
</html>`

  return NextResponse.json({ html })
}
