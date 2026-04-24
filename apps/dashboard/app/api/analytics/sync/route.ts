import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST() {
  revalidatePath("/analytics")
  return NextResponse.json({ syncedAt: new Date().toISOString() })
}
