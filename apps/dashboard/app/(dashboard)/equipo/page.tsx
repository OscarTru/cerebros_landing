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
      <div className="p-6">
        <OrganizationProfile
          appearance={{
            elements: {
              card: "bg-[var(--c-surface)] border border-[var(--c-border)] shadow-none rounded-2xl",
              navbar: "hidden",
              pageScrollBox: "p-0",
            },
          }}
        />
      </div>
    </>
  )
}
