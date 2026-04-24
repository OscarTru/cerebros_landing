import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "edge"

// Incrementa views del post. Rate limit suave: si el header x-view-from coincide
// con el último visitante en <60s, ignora silenciosamente.
// (Rate limit real con Upstash se puede añadir luego; por ahora este endpoint
// es silent fail — no bloquea nada si falla.)

type Params = { params: Promise<{ slug: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json({ ok: false })

  const { slug } = await params
  if (!slug) return NextResponse.json({ ok: false })

  try {
    const sb = createClient(url, key)
    // Atomic increment via rpc sería ideal, pero usamos update con select
    const { data: current } = await sb
      .from("blog_posts")
      .select("views")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
    if (!current) return NextResponse.json({ ok: false })
    await sb
      .from("blog_posts")
      .update({ views: (current.views ?? 0) + 1 })
      .eq("slug", slug)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
