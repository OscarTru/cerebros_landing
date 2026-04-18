import { PageHeader } from "@/components/ui/PageHeader"
import { AgentesClient } from "@/components/AgentesClient"

export default function AgentesPage() {
  return (
    <>
      <PageHeader title="Agentes IA" subtitle="Análisis de métricas con Claude" />
      <div className="flex min-h-0 flex-1 p-8">
        <AgentesClient />
      </div>
    </>
  )
}
