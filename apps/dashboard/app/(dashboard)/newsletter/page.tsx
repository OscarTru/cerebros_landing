import { Resend } from "resend"
import { getSupabase } from "@/lib/supabase"
import type { NewsletterSubscriber } from "@cerebros/lib"
import { NewsletterClient } from "./NewsletterClient"
import { NewsletterHeaderActions } from "./NewsletterHeaderActions"
import { DraftList, type DraftListItem } from "@/components/newsletter/DraftList"
import { CollapsibleDraftList } from "@/components/newsletter/CollapsibleDraftList"
import { ScheduledList, type ScheduledItem } from "./ScheduledList"

const resend = new Resend(process.env.RESEND_API_KEY)

interface AudienceData {
  subscribers: NewsletterSubscriber[]
  total: number
  confirmed: number
  newThisWeek: number
  source: "resend" | "supabase"
  error?: string
}

async function getScheduled(): Promise<ScheduledItem[]> {
  const { data } = await getSupabase()
    .from("newsletter_scheduled")
    .select("id, subject, scheduled_at")
    .is("sent_at", null)
    .order("scheduled_at", { ascending: true })
  return (data ?? []) as ScheduledItem[]
}

const ACTIVE_STATUSES = ["draft", "pending_approval"] as const
const HISTORY_STATUSES = ["approved", "sent", "cancelled"] as const

async function getLastSent(): Promise<{ title: string; subject: string; updated_at: string } | null> {
  const { data } = await getSupabase()
    .from("newsletter_drafts")
    .select("title, subject, updated_at")
    .eq("status", "sent")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  return data as { title: string; subject: string; updated_at: string } | null
}

function daysSince(iso: string): number {
  const diff = Date.now() - new Date(iso).getTime()
  return Math.floor(diff / 86400000)
}

async function getDraftsSplit(): Promise<{ active: DraftListItem[]; history: DraftListItem[] }> {
  const { data } = await getSupabase()
    .from("newsletter_drafts")
    .select("id, title, subject, status, updated_at, created_by")
    .order("updated_at", { ascending: false })
    .limit(60)
  const all = (data ?? []) as DraftListItem[]
  return {
    active: all.filter((d) => (ACTIVE_STATUSES as readonly string[]).includes(d.status)),
    history: all.filter((d) => (HISTORY_STATUSES as readonly string[]).includes(d.status)),
  }
}

async function getAudienceFromResend(): Promise<AudienceData | null> {
  const audienceId = process.env.RESEND_AUDIENCE_ID
  if (!audienceId) return null
  try {
    const res = await resend.contacts.list({ audienceId })
    if (res.error || !res.data) return null
    const contacts = res.data.data ?? []
    const weekAgo = Date.now() - 7 * 86400000
    const subscribed = contacts.filter((c) => !c.unsubscribed).length
    const newThisWeek = contacts.filter((c) => new Date(c.created_at).getTime() >= weekAgo).length

    const subscribers: NewsletterSubscriber[] = contacts
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 100)
      .map((c) => ({
        id: c.id,
        email: c.email,
        nombre: [c.first_name, c.last_name].filter(Boolean).join(" ") || null,
        confirmed: !c.unsubscribed,
        created_at: c.created_at,
      }))

    return {
      subscribers,
      total: contacts.length,
      confirmed: subscribed,
      newThisWeek,
      source: "resend",
    }
  } catch {
    return null
  }
}

async function getAudienceFromSupabase(): Promise<AudienceData> {
  const { data, count } = await getSupabase()
    .from("suscriptores")
    .select("id, email, nombre, confirmed, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(100)

  const confirmed = data?.filter((s) => s.confirmed).length ?? 0
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
  const newThisWeek = data?.filter((s) => s.created_at >= weekAgo).length ?? 0

  return {
    subscribers: (data ?? []) as NewsletterSubscriber[],
    total: count ?? 0,
    confirmed,
    newThisWeek,
    source: "supabase",
  }
}

async function getAudience(): Promise<AudienceData> {
  const resendData = await getAudienceFromResend()
  if (resendData) return resendData
  const fallback = await getAudienceFromSupabase()
  return { ...fallback, error: "Resend no disponible, mostrando datos de Supabase" }
}

function nextThursday(): string {
  const today = new Date()
  const dow = today.getDay()
  const daysUntilThursday = (4 - dow + 7) % 7 || 7
  const next = new Date(today)
  next.setDate(today.getDate() + daysUntilThursday)
  return next.toLocaleDateString("es-MX", { day: "numeric", month: "long" })
}

export default async function NewsletterPage() {
  const [audience, scheduled, draftsSplit, lastSent] = await Promise.all([
    getAudience(),
    getScheduled(),
    getDraftsSplit(),
    getLastSent(),
  ])
  const { active: activeDrafts, history: historyDrafts } = draftsSplit
  const { subscribers, total, confirmed, newThisWeek, source, error } = audience
  const confirmRate = total > 0 ? Math.round((confirmed / total) * 100) : 0
  const nextSend = nextThursday()

  return (
    <>
      <div className="flex items-start justify-between border-b border-[var(--c-border)] px-8 py-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">
            · NEWSLETTER · ESPONJOSOS ·
          </p>
          <h1 className="mt-1 text-[40px] font-bold leading-none tracking-tight text-[var(--c-text)]">
            {total.toLocaleString("es-MX")} personas te leen{" "}
            <span className="text-[var(--c-text-muted)]">los jueves.</span>
          </h1>
          <p className="mt-2 text-[13px] text-[var(--c-text-muted)]">
            {confirmRate}% confirm rate · próximo envío en {nextSend} · +{newThisWeek} nuevos esta semana
            <span className="ml-2 inline-flex items-center rounded-full border border-[var(--c-border)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--c-text-subtle)]">
              fuente: {source}
            </span>
          </p>
        </div>
        <NewsletterHeaderActions />
      </div>

      <div className="flex flex-col gap-6 p-8">
        {error && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[12px] text-amber-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-5 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--c-text-subtle)]">Total suscriptores</p>
            <p className="mt-1 text-[48px] font-bold leading-none text-[var(--c-text)]">
              {total.toLocaleString("es-MX")}
            </p>
            {newThisWeek > 0 && (
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-2 py-0.5 text-[11px] font-medium text-teal-600">
                ▲ +{newThisWeek} · 7d
              </span>
            )}
          </div>
          <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-5 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--c-text-subtle)]">Activos</p>
            <p className="mt-1 text-[48px] font-bold leading-none text-[var(--c-text)]">
              {confirmRate}<span className="text-[24px] text-[var(--c-text-muted)]"> %</span>
            </p>
            <p className="mt-1 text-[12px] text-[var(--c-text-muted)]">
              {confirmed.toLocaleString("es-MX")} de {total.toLocaleString("es-MX")} {source === "resend" ? "suscritos" : "confirmados"}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-5 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--c-text-subtle)]">Último envío</p>
            {lastSent ? (
              <>
                <p className="mt-1 text-[28px] font-bold leading-tight text-[var(--c-text)] line-clamp-1">
                  {lastSent.title}
                </p>
                <p className="mt-1 text-[12px] text-[var(--c-text-muted)]">
                  Hace {daysSince(lastSent.updated_at)} {daysSince(lastSent.updated_at) === 1 ? "día" : "días"} · Open rate se habilitará con webhooks
                </p>
              </>
            ) : (
              <>
                <p className="mt-1 text-[28px] font-bold leading-tight text-[var(--c-text-muted)]">
                  Aún sin envíos
                </p>
                <p className="mt-1 text-[12px] text-[var(--c-text-muted)]">
                  Cuando envíes tu primer newsletter aparecerá aquí
                </p>
              </>
            )}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <p className="text-[13px] font-medium text-[var(--c-text)]">Borradores en curso</p>
            {activeDrafts.length > 0 && (
              <p className="text-[11px] text-[var(--c-text-muted)]">{activeDrafts.length} activos</p>
            )}
          </div>
          <CollapsibleDraftList
            items={activeDrafts}
            variant="active"
            seeAllHref="/newsletter/drafts?filter=active"
          />
        </div>

        <ScheduledList items={scheduled} />

        {historyDrafts.length > 0 && (
          <div>
            <div className="mb-3 flex items-baseline justify-between">
              <p className="text-[13px] font-medium text-[var(--c-text)]">Historial</p>
              <p className="text-[11px] text-[var(--c-text-muted)]">{historyDrafts.length} envíos pasados</p>
            </div>
            <CollapsibleDraftList
              items={historyDrafts}
              variant="history"
              seeAllHref="/newsletter/drafts?filter=history"
            />
          </div>
        )}

        <NewsletterClient subscribers={subscribers} total={total} confirmed={confirmed} />
      </div>
    </>
  )
}
