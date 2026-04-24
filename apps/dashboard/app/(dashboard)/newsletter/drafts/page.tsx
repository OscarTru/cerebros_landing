import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getSupabase } from "@/lib/supabase"
import { DraftList, type DraftListItem } from "@/components/newsletter/DraftList"

const ACTIVE_STATUSES = ["draft", "pending_approval"] as const
const HISTORY_STATUSES = ["approved", "sent", "cancelled"] as const

type Filter = "active" | "history" | "all"

async function getAllDrafts(): Promise<DraftListItem[]> {
  const { data } = await getSupabase()
    .from("newsletter_drafts")
    .select("id, title, subject, status, updated_at, created_by")
    .order("updated_at", { ascending: false })
    .limit(500)
  return (data ?? []) as DraftListItem[]
}

export default async function DraftsFullListPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const { filter: filterRaw } = await searchParams
  const filter: Filter = filterRaw === "history" ? "history" : filterRaw === "all" ? "all" : "active"

  const all = await getAllDrafts()
  const active = all.filter((d) => (ACTIVE_STATUSES as readonly string[]).includes(d.status))
  const history = all.filter((d) => (HISTORY_STATUSES as readonly string[]).includes(d.status))

  const shown = filter === "active" ? active : filter === "history" ? history : all
  const variant = filter === "history" ? "history" : "active"

  return (
    <>
      <div className="flex items-start justify-between border-b border-[var(--c-border)] px-8 py-6">
        <div className="flex items-start gap-3">
          <Link
            href="/newsletter"
            className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--c-border)] text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)]"
            aria-label="Volver"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">
              · NEWSLETTER · BORRADORES ·
            </p>
            <h1 className="mt-1 text-[32px] font-bold leading-none tracking-tight text-[var(--c-text)]">
              Todos los borradores
            </h1>
            <p className="mt-2 text-[13px] text-[var(--c-text-muted)]">
              {active.length} activos · {history.length} en historial · {all.length} total
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 p-8">
        <div className="flex gap-2">
          {(["active", "history", "all"] as const).map((f) => {
            const label = f === "active" ? "En curso" : f === "history" ? "Historial" : "Todos"
            const count = f === "active" ? active.length : f === "history" ? history.length : all.length
            const isActive = filter === f
            return (
              <Link
                key={f}
                href={`/newsletter/drafts?filter=${f}`}
                className={
                  isActive
                    ? "inline-flex items-center gap-1.5 h-8 px-4 rounded-full bg-[var(--c-invert)] text-[var(--c-invert-fg)] text-[12px] font-medium"
                    : "inline-flex items-center gap-1.5 h-8 px-4 rounded-full border border-[var(--c-border)] bg-[var(--c-surface)] text-[12px] font-medium text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)]"
                }
              >
                {label} <span className="opacity-60">({count})</span>
              </Link>
            )
          })}
        </div>

        <DraftList items={shown} variant={variant} />
      </div>
    </>
  )
}
