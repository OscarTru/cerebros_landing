"use client"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { User, Plug, Bell, Users, Check, Loader2, BookOpen, Mic, Camera, Play } from "lucide-react"
import { cn } from "@cerebros/lib"
import type { UserSettings } from "@/app/api/settings/route"
import { OrganizationProfile } from "@clerk/nextjs"

type Tab = "profile" | "integrations" | "notifications" | "team"

const PLATFORMS = [
  { key: "instagram", label: "Instagram", description: "Métricas, posts, stories" },
  { key: "youtube", label: "YouTube", description: "Analytics, uploads" },
  { key: "resend", label: "Resend", description: "Envío de newsletter" },
] as const

interface Props {
  initialSettings: UserSettings
}

const VALID_TABS: Tab[] = ["profile", "integrations", "notifications", "team"]

export function SettingsClient({ initialSettings }: Props) {
  const searchParams = useSearchParams()
  const initialTab = (() => {
    const t = searchParams.get("tab") as Tab | null
    return t && VALID_TABS.includes(t) ? t : "profile"
  })()
  const [tab, setTab] = useState<Tab>(initialTab)
  const [settings, setSettings] = useState<UserSettings>(initialSettings)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const t = searchParams.get("tab") as Tab | null
    if (t && VALID_TABS.includes(t)) {
      queueMicrotask(() => setTab(t))
    }
  }, [searchParams])

  async function save(partial: Partial<UserSettings>) {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      })
      if (res.ok) {
        setSettings((prev) => ({ ...prev, ...partial }))
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex gap-8">
      <aside className="w-52 shrink-0">
        <nav className="flex flex-col gap-1">
          {[
            { key: "profile" as const, label: "Perfil", icon: User },
            { key: "integrations" as const, label: "Plataformas", icon: Plug },
            { key: "notifications" as const, label: "Notificaciones", icon: Bell },
            { key: "team" as const, label: "Equipo", icon: Users },
          ].map((item) => {
            const Icon = item.icon
            const active = tab === item.key
            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-left transition-colors",
                  active
                    ? "bg-[var(--c-invert)] font-medium text-[var(--c-invert-fg)]"
                    : "text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)] hover:text-[var(--c-text)]"
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 max-w-3xl">
        {tab === "profile" && <ProfileTab settings={settings} save={save} saving={saving} saved={saved} />}
        {tab === "integrations" && <IntegrationsTab settings={settings} save={save} />}
        {tab === "notifications" && <NotificationsTab settings={settings} save={save} saving={saving} saved={saved} />}
        {tab === "team" && <TeamTab />}
      </div>
    </div>
  )
}

function SaveIndicator({ saving, saved }: { saving: boolean; saved: boolean }) {
  if (saving) return <span className="inline-flex items-center gap-1.5 text-[12px] text-[var(--c-text-muted)]"><Loader2 className="h-3 w-3 animate-spin" /> Guardando...</span>
  if (saved) return <span className="inline-flex items-center gap-1.5 text-[12px] text-teal-600"><Check className="h-3 w-3" /> Guardado</span>
  return null
}

function Field({ label, value, onChange, placeholder, multiline }: {
  label: string
  value: string | null
  onChange: (v: string) => void
  placeholder?: string
  multiline?: boolean
}) {
  const common = "w-full rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-3 text-[14px] text-[var(--c-text)] placeholder:text-[var(--c-text-faint)] outline-none focus:border-[var(--c-text-subtle)] transition-colors"
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--c-text-subtle)]">{label}</label>
      {multiline ? (
        <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className={cn(common, "resize-none")} />
      ) : (
        <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={common} />
      )}
    </div>
  )
}

function ProfileTab({ settings, save, saving, saved }: { settings: UserSettings; save: (p: Partial<UserSettings>) => Promise<void>; saving: boolean; saved: boolean }) {
  const [local, setLocal] = useState({
    bio: settings.bio,
    website: settings.website,
    twitter: settings.twitter,
    linkedin: settings.linkedin,
  })
  const dirty = JSON.stringify(local) !== JSON.stringify({
    bio: settings.bio, website: settings.website, twitter: settings.twitter, linkedin: settings.linkedin,
  })

  return (
    <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-[18px] font-semibold text-[var(--c-text)]">Perfil público</h2>
        <SaveIndicator saving={saving} saved={saved} />
      </div>
      <div className="flex flex-col gap-4">
        <Field label="Bio" value={local.bio} onChange={(v) => setLocal({ ...local, bio: v })} placeholder="Neurólogo. Divulgación cerebral en español." multiline />
        <Field label="Sitio web" value={local.website} onChange={(v) => setLocal({ ...local, website: v })} placeholder="https://cerebrosesponjosos.com" />
        <Field label="Twitter" value={local.twitter} onChange={(v) => setLocal({ ...local, twitter: v })} placeholder="@tuuser" />
        <Field label="LinkedIn" value={local.linkedin} onChange={(v) => setLocal({ ...local, linkedin: v })} placeholder="linkedin.com/in/..." />
        <div className="flex justify-end border-t border-[var(--c-border)] pt-4">
          <button
            onClick={() => save(local)}
            disabled={!dirty || saving}
            className="inline-flex h-9 items-center px-5 rounded-full bg-[var(--c-invert)] text-[var(--c-invert-fg)] text-[12px] font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  )
}

function IntegrationsTab({ settings, save }: { settings: UserSettings; save: (p: Partial<UserSettings>) => Promise<void> }) {
  async function toggle(key: string) {
    const current = settings.integrations?.[key]
    const next = { ...settings.integrations, [key]: { connected: !current?.connected } }
    await save({ integrations: next })
  }

  return (
    <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6">
      <h2 className="mb-1 text-[18px] font-semibold text-[var(--c-text)]">Plataformas conectadas</h2>
      <p className="mb-5 text-[13px] text-[var(--c-text-muted)]">
        Estado de cada integración. Las conexiones OAuth reales se habilitan pronto — por ahora solo registras el estado.
      </p>
      <div className="flex flex-col gap-2">
        {PLATFORMS.map((p) => {
          const connected = settings.integrations?.[p.key]?.connected ?? false
          return (
            <div key={p.key} className="flex items-center justify-between rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] p-4">
              <div>
                <p className="text-[14px] font-medium text-[var(--c-text)]">{p.label}</p>
                <p className="text-[12px] text-[var(--c-text-muted)]">{p.description}</p>
              </div>
              <button
                onClick={() => toggle(p.key)}
                className={cn(
                  "inline-flex h-8 items-center px-4 rounded-full text-[12px] font-medium transition-colors",
                  connected
                    ? "bg-teal-500/10 text-teal-600 border border-teal-500/20 hover:bg-teal-500/20"
                    : "border border-[var(--c-border)] text-[var(--c-text-muted)] hover:bg-[var(--c-surface-3)]"
                )}
              >
                {connected ? "Conectado" : "Conectar"}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function NotificationsTab({ settings, save, saving, saved }: { settings: UserSettings; save: (p: Partial<UserSettings>) => Promise<void>; saving: boolean; saved: boolean }) {
  const prefs = settings.preferences ?? {}
  const items = [
    { key: "notify_new_subscribers", label: "Nuevos suscriptores", description: "Avisarme cuando alguien se suscriba al newsletter" },
    { key: "notify_colab_updates", label: "Cambios en colaboraciones", description: "Avisarme cuando una colab cambie de estado" },
    { key: "notify_sync_errors", label: "Errores de sincronización", description: "Avisarme si falla la sync de analytics" },
    { key: "email_digest_weekly", label: "Resumen semanal por email", description: "Recibir un email los lunes con métricas de la semana" },
  ]

  async function toggle(key: string) {
    await save({ preferences: { ...prefs, [key]: !prefs[key] } })
  }

  return (
    <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-[18px] font-semibold text-[var(--c-text)]">Notificaciones</h2>
        <SaveIndicator saving={saving} saved={saved} />
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const on = !!prefs[item.key]
          return (
            <div key={item.key} className="flex items-center justify-between rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] p-4">
              <div>
                <p className="text-[14px] font-medium text-[var(--c-text)]">{item.label}</p>
                <p className="text-[12px] text-[var(--c-text-muted)]">{item.description}</p>
              </div>
              <button
                onClick={() => toggle(item.key)}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  on ? "bg-teal-500" : "bg-[var(--c-surface-3)]"
                )}
                aria-pressed={on}
              >
                <span className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                  on ? "translate-x-5" : "translate-x-0.5"
                )} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const FOUNDERS = [
  {
    name: "Oscar Trujillo",
    role: "Neurólogo residente · Co-founder",
    quote: "Hacemos neurología accesible, sin sacrificar la profundidad.",
    focus: "Analytics, colaboraciones y estrategia de contenido.",
    platforms: [
      { icon: Play, label: "YouTube" },
      { icon: BookOpen, label: "Blog" },
    ],
    initials: "OT",
  },
  {
    name: "Stephanie",
    role: "Neurólogo residente · Co-founder",
    quote: "Cada post es una oportunidad de cambiar cómo alguien entiende su cerebro.",
    focus: "Contenido clínico, Instagram y comunidad.",
    platforms: [
      { icon: Camera, label: "Instagram" },
      { icon: Mic, label: "Podcast" },
    ],
    initials: "SR",
  },
]

function TeamTab() {
  return (
    <div className="flex flex-col gap-4">
      {/* Founders */}
      <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6">
        <h2 className="mb-4 text-[18px] font-semibold text-[var(--c-text)]">Fundadores</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FOUNDERS.map((f) => (
            <div
              key={f.name}
              className="flex flex-col gap-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--c-border)] bg-[var(--c-surface-3)] text-[12px] font-bold text-[var(--c-text-muted)]">
                  {f.initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-[var(--c-text)]">{f.name}</p>
                  <p className="truncate text-[11.5px] text-[var(--c-text-muted)]">{f.role}</p>
                </div>
              </div>
              <p className="text-[12px] leading-relaxed text-[var(--c-text-muted)]">&ldquo;{f.quote}&rdquo;</p>
              <div className="flex flex-wrap gap-1.5 border-t border-[var(--c-border)] pt-3">
                {f.platforms.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-1.5 rounded-md border border-[var(--c-border)] bg-[var(--c-surface-3)] px-2 py-1"
                  >
                    <Icon className="h-3 w-3 text-[var(--c-text-muted)]" />
                    <span className="text-[10.5px] text-[var(--c-text-muted)]">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invites & members */}
      <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6">
        <h2 className="mb-1 text-[18px] font-semibold text-[var(--c-text)]">Miembros e invitaciones</h2>
        <p className="mb-5 text-[13px] text-[var(--c-text-muted)]">
          Invita a editores o viewers. Gestionado con Clerk Organizations.
        </p>
        <div className="rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] overflow-hidden">
          <OrganizationProfile
            appearance={{
              elements: {
                rootBox: "w-full",
                cardBox: "shadow-none bg-transparent",
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}
