import Link from "next/link"
import { Header } from "@/components/Header"
import { KanbanBoard } from "@/components/KanbanBoard"
import { getSupabase } from "@/lib/supabase"
import { Button } from "@cerebros/ui"
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
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[var(--c-text)]">Pipeline de marcas</h2>
            <p className="text-sm text-[var(--c-text-muted)] mt-0.5">
              {colaboraciones.length} colaboraciones en total
            </p>
          </div>
          <Link href="/colaboraciones/new">
            <Button size="sm">
              <Plus className="w-4 h-4" />
              Nueva
            </Button>
          </Link>
        </div>

        <KanbanBoard initialColaboraciones={colaboraciones} />
      </div>
    </>
  )
}
