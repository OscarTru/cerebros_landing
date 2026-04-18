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
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Header title="Colaboraciones" />
      <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--c-text)",
              letterSpacing: "-0.01em",
              margin: 0,
            }}>
              Pipeline de marcas
            </h2>
            <p style={{
              fontSize: "13px",
              color: "var(--c-text-muted)",
              margin: 0,
              marginTop: "4px",
            }}>
              {colaboraciones.length} colaboraciones en total
            </p>
          </div>
          <Link
            href="/colaboraciones/new"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 500,
              background: "var(--c-invert)",
              color: "var(--c-invert-fg)",
              textDecoration: "none",
              border: "1px solid var(--c-border)",
            }}
          >
            <Plus style={{ width: 14, height: 14 }} />
            Nueva
          </Link>
        </div>

        <KanbanBoard initialColaboraciones={colaboraciones} />
      </div>
    </div>
  )
}
