import { PageHeader } from "@/components/ui/PageHeader"
import { NuevaColaboracionClient } from "@/components/NuevaColaboracionClient"

export default function NuevaColaboracionPage() {
  return (
    <>
      <PageHeader
        title="Nueva colaboración"
        subtitle="Registrar una nueva marca o propuesta"
      />
      <div className="p-8">
        <NuevaColaboracionClient />
      </div>
    </>
  )
}
