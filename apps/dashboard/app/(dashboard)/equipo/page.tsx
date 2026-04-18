import { OrganizationProfile } from "@clerk/nextjs"
import { getUserRole } from "@/lib/clerk"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/ui/PageHeader"

export default async function EquipoPage() {
  const role = await getUserRole()
  if (role !== "owner") redirect("/")

  return (
    <>
      <PageHeader
        title="Equipo"
        subtitle="Administra los miembros de tu organización"
      />
      <div className="p-8">
        <OrganizationProfile
          appearance={{
            elements: {
              rootBox: "w-full",
              card: {
                background: "var(--c-surface)",
                border: "1px solid var(--c-border)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                borderRadius: "16px",
                width: "100%",
              },
              navbar: { display: "none" },
              pageScrollBox: { padding: "24px" },
              headerTitle: { color: "var(--c-text)", fontSize: "15px" },
              headerSubtitle: { color: "var(--c-text-muted)", fontSize: "13px" },
              profileSectionTitleText: { color: "var(--c-text)" },
              profileSectionContent: { color: "var(--c-text-muted)" },
            },
          }}
        />
      </div>
    </>
  )
}
