// One-off script: migra MDX de apps/web/content/blog/ a la tabla blog_posts.
//
// Ejecutar desde apps/dashboard:
//   npx tsx scripts/migrate-blog-to-db.ts
//
// Idempotente: usa INSERT ON CONFLICT (slug) DO NOTHING.
//
// Env vars (lee .env.local automáticamente):
//   - SUPABASE_URL
//   - SUPABASE_SERVICE_ROLE_KEY

import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

function loadEnv() {
  try {
    const envFile = readFileSync(join(process.cwd(), ".env.local"), "utf-8")
    for (const line of envFile.split("\n")) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
    }
  } catch {
    // ignore
  }
}
loadEnv()

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

// Ruta al directorio de MDX en apps/web
const BLOG_DIR = join(process.cwd(), "..", "web", "content", "blog")

interface Heading { id: string; text: string; level: number }

function parseFrontmatter(content: string): { yaml: string; body: string; meta: Record<string, string | number | boolean> } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { yaml: "", body: content, meta: {} }
  const yaml = match[1]
  const body = match[2]
  const meta: Record<string, string | number | boolean> = {}
  // Parse scalar keys only (headings se maneja aparte)
  let inHeadings = false
  for (const line of yaml.split("\n")) {
    if (line.startsWith("headings:")) { inHeadings = true; continue }
    if (inHeadings) {
      if (/^\s+-\s+/.test(line) || /^\s+/.test(line)) continue
      else inHeadings = false
    }
    const colonIdx = line.indexOf(":")
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    const raw = line.slice(colonIdx + 1).trim()
    if (!key) continue
    if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
      meta[key] = raw.slice(1, -1)
    } else if (raw === "true") meta[key] = true
    else if (raw === "false") meta[key] = false
    else if (!isNaN(Number(raw)) && raw !== "") meta[key] = Number(raw)
    else meta[key] = raw
  }
  return { yaml, body, meta }
}

function parseHeadings(yaml: string): Heading[] {
  const headingsMatch = yaml.match(/^headings:\s*\n((?:\s+-\s+\{[^\n]+\}\n?)*)/m)
  if (!headingsMatch) return []
  const lines = headingsMatch[1].split("\n").filter(Boolean)
  return lines
    .map((line) => {
      const m = line.match(/\{\s*id:\s*"([^"]+)",\s*text:\s*"([^"]+)",\s*level:\s*(\d+)\s*\}/)
      if (!m) return null
      return { id: m[1], text: m[2], level: Number(m[3]) }
    })
    .filter((h): h is Heading => h !== null)
}

async function main() {
  console.log(`Reading from: ${BLOG_DIR}`)
  const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"))
  console.log(`Found ${files.length} MDX files`)

  let inserted = 0
  let skipped = 0
  let errors = 0

  for (const file of files) {
    const slug = file.replace(".mdx", "")
    const raw = readFileSync(join(BLOG_DIR, file), "utf8")
    const { yaml, body, meta } = parseFrontmatter(raw)
    const headings = parseHeadings(yaml)

    const row = {
      slug: (meta.slug as string) || slug,
      title: (meta.title as string) || slug,
      description: (meta.description as string) || null,
      author: (meta.author as string) || "Oscar Trujillo",
      image: (meta.image as string) || null,
      content: body.trim(),
      reading_time: (meta.readingTime as number) || null,
      headings,
      status: "published",
      published_at: meta.date ? new Date(meta.date as string).toISOString() : new Date().toISOString(),
      created_by: "system-migration",
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY!,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal,resolution=ignore-duplicates",
      },
      body: JSON.stringify(row),
    })

    if (res.status === 201) {
      console.log(`  + ${row.slug}`)
      inserted++
    } else if (res.status === 200 || res.status === 409) {
      console.log(`  = ${row.slug} (ya existía)`)
      skipped++
    } else {
      const text = await res.text()
      console.error(`  ! ${row.slug} — ${res.status}: ${text.slice(0, 200)}`)
      errors++
    }
  }

  console.log(`\nResult: ${inserted} inserted, ${skipped} skipped, ${errors} errors from ${files.length} files`)
}

main().catch((e) => { console.error(e); process.exit(1) })
