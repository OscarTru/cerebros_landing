import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

// Invocado desde el dashboard al publicar/despublicar/actualizar un post.
// Autenticado con REVALIDATE_SECRET compartido.
export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) {
    return NextResponse.json({ error: "Revalidate no configurado" }, { status: 500 })
  }

  let body: { path?: unknown; secret?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (body.secret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (typeof body.path !== "string" || !body.path.startsWith("/")) {
    return NextResponse.json({ error: "path inválido" }, { status: 400 })
  }

  revalidatePath(body.path)
  return NextResponse.json({ revalidated: true, path: body.path })
}
