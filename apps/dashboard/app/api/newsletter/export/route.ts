import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getSupabase } from "@/lib/supabase"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data } = await getSupabase()
    .from("suscriptores")
    .select("email, nombre, confirmed, created_at")
    .order("created_at", { ascending: false })

  const rows = data ?? []
  const header = "email,nombre,confirmado,fecha_suscripcion"
  const lines = rows.map((r) =>
    [
      r.email,
      r.nombre ?? "",
      r.confirmed ? "sí" : "no",
      new Date(r.created_at).toLocaleDateString("es-MX"),
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  )
  const csv = [header, ...lines].join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="suscriptores-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
