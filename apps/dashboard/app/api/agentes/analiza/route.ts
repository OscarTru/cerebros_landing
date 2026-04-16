import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import Anthropic from "@anthropic-ai/sdk"
import { getSupabase } from "@/lib/supabase"

export const runtime = "nodejs"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { pregunta } = await req.json()
  if (!pregunta || typeof pregunta !== "string") {
    return NextResponse.json({ error: "Falta pregunta" }, { status: 400 })
  }

  const [subsRes, colabRes, likesRes] = await Promise.all([
    getSupabase().from("suscriptores").select("id", { count: "exact", head: true }),
    getSupabase().from("colaboraciones").select("marca, tipo, estado, valor_mxn"),
    getSupabase().from("post_likes").select("slug"),
  ])

  const totalSubs = subsRes.count ?? 0
  const colaboraciones = colabRes.data ?? []
  const likesBySlugs: Record<string, number> = {}
  likesRes.data?.forEach(({ slug }) => {
    likesBySlugs[slug] = (likesBySlugs[slug] ?? 0) + 1
  })
  const topPosts = Object.entries(likesBySlugs)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const contexto = `Eres el asistente de análisis de Cerebros Esponjosos — un podcast y blog de neurología en español.

DATOS ACTUALES:
- Suscriptores newsletter: ${totalSubs}
- Colaboraciones en pipeline: ${colaboraciones.length}
${colaboraciones.map((c) => `  • ${c.marca} (${c.tipo}) — ${c.estado} — ${c.valor_mxn ? `$${c.valor_mxn} MXN` : "sin valor"}`).join("\n")}
- Top posts por likes:
${topPosts.map(([slug, count]) => `  • /blog/${slug}: ${count} likes`).join("\n")}

PREGUNTA DEL USUARIO:
${pregunta}

Responde en español, de forma concisa y accionable. Máximo 200 palabras.`

  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 512,
    messages: [{ role: "user", content: contexto }],
  })

  const output =
    message.content[0].type === "text" ? message.content[0].text : ""

  await getSupabase().from("agent_logs").insert({
    tipo: "analisis_metricas",
    input: pregunta,
    output,
    modelo: message.model,
    tokens_input: message.usage.input_tokens,
    tokens_output: message.usage.output_tokens,
  })

  return NextResponse.json({ respuesta: output })
}
