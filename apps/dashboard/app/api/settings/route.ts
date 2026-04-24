import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getSupabase } from "@/lib/supabase"

export interface UserSettings {
  user_id: string
  bio: string | null
  website: string | null
  twitter: string | null
  linkedin: string | null
  integrations: Record<string, { connected: boolean; account?: string }>
  preferences: Record<string, boolean>
}

const DEFAULTS = {
  bio: null,
  website: null,
  twitter: null,
  linkedin: null,
  integrations: {},
  preferences: {
    notify_new_subscribers: true,
    notify_colab_updates: true,
    notify_sync_errors: true,
    email_digest_weekly: false,
  },
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data } = await getSupabase()
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()

  return NextResponse.json({
    settings: data ?? { user_id: userId, ...DEFAULTS },
  })
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const allowed: (keyof typeof DEFAULTS)[] = ["bio", "website", "twitter", "linkedin", "integrations", "preferences"]
  const payload: Record<string, unknown> = { user_id: userId }
  for (const key of allowed) {
    if (key in body) payload[key] = body[key]
  }

  const { error } = await getSupabase()
    .from("user_settings")
    .upsert(payload, { onConflict: "user_id" })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
