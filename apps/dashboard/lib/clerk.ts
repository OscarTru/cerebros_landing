import { auth } from "@clerk/nextjs/server"

export type DashboardRole = "owner" | "editor" | "viewer"

export async function getUserRole(): Promise<DashboardRole> {
  const { sessionClaims } = await auth()
  const role = (sessionClaims?.metadata as { role?: string })?.role
  if (role === "owner" || role === "editor" || role === "viewer") return role
  return "viewer"
}

export async function requireRole(minRole: DashboardRole): Promise<void> {
  const role = await getUserRole()
  const hierarchy: DashboardRole[] = ["viewer", "editor", "owner"]
  if (hierarchy.indexOf(role) < hierarchy.indexOf(minRole)) {
    throw new Error(`Acceso denegado: se requiere rol ${minRole}`)
  }
}
