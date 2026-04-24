import Link from "next/link"
import { KanbanBoard } from "@/components/KanbanBoard"
import { getSupabase } from "@/lib/supabase"
import { Plus, Briefcase, CheckCircle, TrendingUp, DollarSign } from "lucide-react"
import type { Colaboracion } from "@cerebros/lib"
import { PageHeader } from "@/components/ui/PageHeader"
import { StatCard } from "@/components/ui/StatCard"
import { FadeIn } from "@/components/ui/effects/FadeIn"

async function getColaboraciones(): Promise<Colaboracion[]> {
  const { data } = await getSupabase()
    .from("colaboraciones")
    .select("*")
    .order("created_at", { ascending: false })
  return (data ?? []) as Colaboracion[]
}

function currentMonthStart() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export default async function ColaboracionesPage() {
  const colaboraciones = await getColaboraciones()

  const activas = colaboraciones.filter(
    (c) => c.estado === "en_negociacion" || c.estado === "confirmada"
  )
  const pipelineTotal = activas.reduce((acc, c) => acc + (c.valor_mxn ?? 0), 0)

  const monthStart = currentMonthStart()
  const confirmadasMes = colaboraciones.filter(
    (c) => c.estado === "confirmada" && new Date(c.created_at) >= monthStart
  ).length

  const confirmadas = colaboraciones.filter((c) => c.estado === "confirmada").length
  const cerradas = colaboraciones.filter((c) => c.estado === "cerrada").length
  const conversionRate =
    colaboraciones.length > 0
      ? Math.round(((confirmadas + cerradas) / colaboraciones.length) * 100)
      : 0

  const withValue = colaboraciones.filter((c) => c.valor_mxn)
  const avgTicket =
    withValue.length > 0
      ? Math.round(withValue.reduce((a, c) => a + (c.valor_mxn ?? 0), 0) / withValue.length)
      : 0

  const prospectos = colaboraciones.filter((c) => c.estado === "prospecto").length
  const enNegociacion = colaboraciones.filter((c) => c.estado === "en_negociacion").length
  const confirmadas2 = colaboraciones.filter((c) => c.estado === "confirmada").length
  const cerradas2 = colaboraciones.filter((c) => c.estado === "cerrada").length

  const funnelStages = [
    { label: "Prospecto", count: prospectos, color: "bg-[var(--c-border-strong,#3f3f46)]", barColor: "bg-zinc-500/40" },
    { label: "Negociación", count: enNegociacion, color: "bg-amber-400/60", barColor: "bg-amber-400/40" },
    { label: "Confirmada", count: confirmadas2, color: "bg-emerald-400/70", barColor: "bg-emerald-400/40" },
    { label: "Cerrada", count: cerradas2, color: "bg-[var(--c-text-subtle)]", barColor: "bg-zinc-600/30" },
  ]
  const funnelMax = Math.max(...funnelStages.map((s) => s.count), 1)

  return (
    <>
      <PageHeader
        variant="editorial"
        eyebrow="· COLABORACIONES · 2026 Q2 ·"
        title={`$${pipelineTotal.toLocaleString("es-MX")} MXN en camino.`}
        actions={
          <Link
            href="/colaboraciones/new"
            className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl text-[12px] font-medium bg-[var(--c-invert)] text-[var(--c-invert-fg)] hover:opacity-90 transition-opacity"
          >
            <Plus className="h-3.5 w-3.5" />
            Nueva
          </Link>
        }
      />
      <div className="flex flex-col gap-6 p-8">
        {/* Pipeline funnel */}
        <FadeIn>
          <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-2)] p-6">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">
              · PIPELINE · FUNNEL ·
            </p>
            <div className="grid grid-cols-4 gap-3 items-end h-32">
              {funnelStages.map((stage, i) => {
                const heightPct = funnelMax > 0 ? (stage.count / funnelMax) * 100 : 8
                return (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <span className="text-[11px] font-semibold text-[var(--c-text)]">{stage.count}</span>
                    <div className="w-full rounded-t-lg overflow-hidden" style={{ height: "80px" }}>
                      <div
                        className={`w-full rounded-t-lg ${stage.barColor} transition-all`}
                        style={{ height: `${Math.max(heightPct, 8)}%`, marginTop: `${100 - Math.max(heightPct, 8)}%` }}
                      />
                    </div>
                    <div className={`h-0.5 w-full rounded-full ${stage.color}`} />
                    <span className="text-[10px] text-[var(--c-text-muted)]">{stage.label}</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 border-t border-[var(--c-border)] pt-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--c-text-subtle)]">Conversion rate</p>
                <p className="mt-0.5 text-[20px] font-bold leading-none text-[var(--c-text)]">{conversionRate}%</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--c-text-subtle)]">Ticket promedio</p>
                <p className="mt-0.5 text-[20px] font-bold leading-none text-[var(--c-text)]">${avgTicket.toLocaleString("es-MX")}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--c-text-subtle)]">Confirmadas este mes</p>
                <p className="mt-0.5 text-[20px] font-bold leading-none text-[var(--c-text)]">{confirmadasMes}</p>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <KanbanBoard initialColaboraciones={colaboraciones} />
        </FadeIn>
      </div>
    </>
  )
}
