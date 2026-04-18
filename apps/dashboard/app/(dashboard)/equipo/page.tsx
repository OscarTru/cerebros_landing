import { Header } from "@/components/Header"
import { OrganizationProfile } from "@clerk/nextjs"
import { getUserRole } from "@/lib/clerk"
import { redirect } from "next/navigation"

export default async function EquipoPage() {
  const role = await getUserRole()
  if (role !== "owner") redirect("/")

  return (
    <>
      <Header title="Equipo" />
      <div className="p-8">
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
    </>
  )
}
