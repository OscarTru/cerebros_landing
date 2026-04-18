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

  return (
    <>
      <PageHeader
        title="Colaboraciones"
        subtitle={`${colaboraciones.length} colaboraciones en total`}
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
        <FadeIn>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              label="Pipeline total"
              value={`$${pipelineTotal.toLocaleString("es-MX")}`}
              sublabel="MXN en negociación + confirmadas"
              icon={<DollarSign className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />}
              animate={false}
            />
            <StatCard
              label="Confirmadas este mes"
              value={confirmadasMes}
              icon={<CheckCircle className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />}
            />
            <StatCard
              label="Conversion rate"
              value={`${conversionRate}%`}
              sublabel="confirmadas + cerradas"
              icon={<TrendingUp className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />}
              animate={false}
            />
            <StatCard
              label="Ticket promedio"
              value={`$${avgTicket.toLocaleString("es-MX")}`}
              icon={<Briefcase className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />}
              animate={false}
            />
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <KanbanBoard initialColaboraciones={colaboraciones} />
        </FadeIn>
      </div>
    </>
  )
}
