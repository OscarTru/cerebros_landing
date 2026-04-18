import { Header } from "@/components/Header"
import { OrganizationProfile } from "@clerk/nextjs"
import { getUserRole } from "@/lib/clerk"
import { redirect } from "next/navigation"

export default async function EquipoPage() {
  const role = await getUserRole()
  if (role !== "owner") redirect("/")

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Header title="Equipo" />
      <div style={{ padding: "32px" }}>
        <OrganizationProfile
          appearance={{
            elements: {
              card: {
                background: "var(--c-surface)",
                border: "1px solid var(--c-border)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                borderRadius: "16px",
              },
              navbar: { display: "none" },
              pageScrollBox: { padding: 0 },
            },
          }}
        />
      </div>
    </div>
  )
}
