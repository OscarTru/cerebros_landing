import { auth } from "@clerk/nextjs/server"

export type DashboardRole = "owner" | "editor" | "viewer"

export async function getUserRole(): Promise<DashboardRole> {
  const { sessionClaims } = await auth()
  const metadata = sessionClaims?.metadata as { role?: string } | undefined
  const role = metadata?.role

  // TEMP debug: loguea qué llega del JWT para diagnosticar 403s
  if (process.env.NODE_ENV !== "production") {
    console.log("[getUserRole] metadata:", JSON.stringify(metadata), "role:", role)
  }

  if (role === "owner" || role === "editor" || role === "viewer") return role
  return "viewer"
}

// Overloads: acepta un minRole (jerárquico) O un array de roles permitidos.
export async function requireRole(
  minOrAllowed: DashboardRole | DashboardRole[]
): Promise<{ userId: string; role: DashboardRole }> {
  const { userId } = await auth()
  if (!userId) throw new Response("Unauthorized", { status: 401 })
  const role = await getUserRole()

  if (Array.isArray(minOrAllowed)) {
    if (!minOrAllowed.includes(role)) {
      console.warn(`[requireRole] DENIED: user role '${role}' not in [${minOrAllowed.join(", ")}]`)
      throw new Response("Forbidden", { status: 403 })
    }
  } else {
    const hierarchy: DashboardRole[] = ["viewer", "editor", "owner"]
    if (hierarchy.indexOf(role) < hierarchy.indexOf(minOrAllowed)) {
      console.warn(`[requireRole] DENIED: user role '${role}' below minimum '${minOrAllowed}'`)
      throw new Response("Forbidden", { status: 403 })
    }
  }

  return { userId, role }
}
