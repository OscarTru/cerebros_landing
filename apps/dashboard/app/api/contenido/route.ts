import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getSupabase } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  let query = getSupabase()
    .from("contenido_calendario")
    .select("*")
    .order("fecha", { ascending: true })

  if (from) query = query.gte("fecha", from)
  if (to) query = query.lte("fecha", to)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const { fecha, plataforma, titulo, descripcion, estado } = body

  if (!fecha || !plataforma || !titulo) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
  }

  const { data, error } = await getSupabase()
    .from("contenido_calendario")
    .insert({ fecha, plataforma, titulo, descripcion, estado: estado ?? "borrador" })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 })

  const { error } = await getSupabase()
    .from("contenido_calendario")
    .delete()
    .eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
