import { auth } from "@clerk/nextjs/server"
import { getSupabase } from "@/lib/supabase"
import { SettingsClient } from "./SettingsClient"
import type { UserSettings } from "@/app/api/settings/route"

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

async function getSettings(userId: string): Promise<UserSettings> {
  const { data } = await getSupabase()
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()
  return (data ?? { user_id: userId, ...DEFAULTS }) as UserSettings
}

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) return null
  const settings = await getSettings(userId)

  return (
    <>
      <div className="flex items-start justify-between border-b border-[var(--c-border)] px-8 py-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">
            · AJUSTES ·
          </p>
          <h1 className="mt-1 text-[40px] font-bold leading-none tracking-tight text-[var(--c-text)]">
            Configuración{" "}
            <span className="text-[var(--c-text-muted)]">de tu cuenta.</span>
          </h1>
          <p className="mt-2 text-[13px] text-[var(--c-text-muted)]">
            Perfil, plataformas conectadas, preferencias de notificaciones.
          </p>
        </div>
      </div>

      <div className="p-8">
        <SettingsClient initialSettings={settings} />
      </div>
    </>
  )
}
