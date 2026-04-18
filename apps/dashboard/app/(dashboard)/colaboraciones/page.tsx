import Link from "next/link"
import { Header } from "@/components/Header"
import { KanbanBoard } from "@/components/KanbanBoard"
import { getSupabase } from "@/lib/supabase"
import { Plus } from "lucide-react"
import type { Colaboracion } from "@cerebros/lib"

async function getColaboraciones(): Promise<Colaboracion[]> {
  const { data } = await getSupabase()
    .from("colaboraciones")
    .select("*")
    .order("created_at", { ascending: false })
  return (data ?? []) as Colaboracion[]
}

export default async function ColaboracionesPage() {
  const colaboraciones = await getColaboraciones()

  return (
    <>
      <Header title="Colaboraciones" />
      <div className="p-8 flex flex-col gap-6">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight text-[var(--c-text)]">
              Pipeline de marcas
            </h2>
            <p className="text-[13px] text-[var(--c-text-muted)] mt-1">
              {colaboraciones.length} colaboraciones en total
            </p>
          </div>
          <Link
            href="/colaboraciones/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium bg-[var(--c-invert)] text-[var(--c-invert-fg)] border border-[var(--c-border)] hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            Nueva
          </Link>
        </div>

        <KanbanBoard initialColaboraciones={colaboraciones} />

      </div>
    </>
  )
}
