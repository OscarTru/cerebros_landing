// api/likes.ts
// Vercel Edge Function — GET /api/likes?slug=xxx  |  POST /api/likes { slug }
//
// Env vars required (same as subscribe.ts):
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "@supabase/supabase-js"
import { likesRatelimit, getIP } from "./_ratelimit"

export const config = { runtime: "edge" }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

function fingerprint(req: Request): string {
  const ua = req.headers.get("user-agent") ?? ""
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  const raw = `${ip}|${ua}`
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    hash = (Math.imul(31, hash) + raw.charCodeAt(i)) | 0
  }
  return Math.abs(hash).toString(36)
}

export default async function handler(req: Request): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return json({ error: "Not configured" }, 500)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const fp = fingerprint(req)

  // GET /api/likes?slug=xxx
  if (req.method === "GET") {
    const url = new URL(req.url)
    const slug = url.searchParams.get("slug")
    if (!slug) return json({ error: "Missing slug" }, 400)
    if (slug.length > 200) return json({ error: "Invalid slug" }, 400)

    const [{ count, error: countError }, { data: existing, error: existsError }] =
      await Promise.all([
        supabase.from("post_likes").select("*", { count: "exact", head: true }).eq("slug", slug),
        supabase.from("post_likes").select("id").eq("slug", slug).eq("fingerprint", fp).maybeSingle(),
      ])

    if (countError) {
      console.error("Supabase count error:", countError)
      return json({ error: "Could not fetch likes" }, 500)
    }
    if (existsError) {
      console.error("Supabase fingerprint check error:", existsError)
      return json({ error: "Could not fetch likes" }, 500)
    }

    return json({ count: count ?? 0, liked: existing !== null })
  }

  // POST /api/likes { slug }
  if (req.method === "POST") {
    // Rate limit: 10 like actions per IP per minute
    const rl = likesRatelimit()
    if (rl) {
      const { success } = await rl.limit(getIP(req))
      if (!success) return json({ error: "Too many requests" }, 429)
    }

    let body: { slug?: unknown }
    try {
      body = await req.json()
    } catch {
      return json({ error: "Invalid JSON" }, 400)
    }

    const slug = typeof body.slug === "string" ? body.slug.trim() : ""
    if (!slug) return json({ error: "Missing slug" }, 400)
    if (slug.length > 200) return json({ error: "Invalid slug" }, 400)

    const { error: insertError } = await supabase
      .from("post_likes")
      .insert({ slug, fingerprint: fp })

    const already = insertError?.code === "23505"
    if (insertError && !already) {
      console.error("Supabase insert error:", insertError)
      return json({ error: "Could not save like" }, 500)
    }

    const { count } = await supabase
      .from("post_likes")
      .select("*", { count: "exact", head: true })
      .eq("slug", slug)

    return json({ ok: true, count: count ?? 0, already })
  }

  return json({ error: "Method not allowed" }, 405)
}
