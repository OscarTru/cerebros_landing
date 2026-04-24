// One-off script: migra suscriptores de Supabase (tabla `suscriptores` o `subscribers`)
// a la audiencia de Resend configurada en RESEND_AUDIENCE_ID.
//
// Ejecutar desde apps/dashboard:
//   npx tsx scripts/migrate-subscribers-to-resend.ts
//
// Idempotente: si el contacto ya existe en Resend, Resend responde 409 y el script lo ignora.
//
// Env vars requeridas (leídas de .env.local):
//   - RESEND_API_KEY
//   - RESEND_AUDIENCE_ID
//   - SUPABASE_URL
//   - SUPABASE_SERVICE_ROLE_KEY

import { readFileSync } from "node:fs"
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

const RESEND_API_KEY = process.env.RESEND_API_KEY
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!RESEND_API_KEY || !AUDIENCE_ID || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Faltan env vars: RESEND_API_KEY, RESEND_AUDIENCE_ID, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

type SupaRow = { email: string; nombre?: string | null; confirmed?: boolean | null }

async function fetchSupabaseRows(table: string): Promise<SupaRow[]> {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=email,nombre,confirmed&limit=5000`
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY!,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase ${table} ${res.status}: ${text}`)
  }
  return res.json()
}

async function addToResend(email: string, firstName: string | null): Promise<"added" | "exists" | "error"> {
  const res = await fetch(`https://api.resend.com/audiences/${AUDIENCE_ID}/contacts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      email,
      first_name: firstName,
      unsubscribed: false,
    }),
  })
  if (res.ok) return "added"
  const text = await res.text()
  if (text.includes("already") || res.status === 409) return "exists"
  console.error(`  ⚠ ${email}: ${res.status} ${text}`)
  return "error"
}

async function main() {
  console.log(`Target audience: ${AUDIENCE_ID}`)

  // Try 'suscriptores' first (spanish), fallback 'subscribers'
  let rows: SupaRow[] = []
  try {
    rows = await fetchSupabaseRows("suscriptores")
    console.log(`Loaded ${rows.length} from 'suscriptores'`)
  } catch {
    console.log("Table 'suscriptores' not found, trying 'subscribers'...")
  }
  if (rows.length === 0) {
    try {
      rows = await fetchSupabaseRows("subscribers")
      console.log(`Loaded ${rows.length} from 'subscribers'`)
    } catch (e) {
      console.error("No subscriber table found")
      process.exit(1)
    }
  }

  let added = 0, exists = 0, errors = 0
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    const firstName = r.nombre?.split(" ")[0] ?? null
    const result = await addToResend(r.email, firstName)
    if (result === "added") added++
    else if (result === "exists") exists++
    else errors++
    if ((i + 1) % 50 === 0) {
      console.log(`  ${i + 1}/${rows.length} — ${added} added, ${exists} existed, ${errors} errors`)
    }
    // Light rate limit: 100ms between calls
    await new Promise((r) => setTimeout(r, 100))
  }

  console.log(`\nDone: ${added} added, ${exists} already existed, ${errors} errors out of ${rows.length} total`)
}

main().catch((e) => { console.error(e); process.exit(1) })
