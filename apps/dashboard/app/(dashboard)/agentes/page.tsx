import { PageHeader } from "@/components/ui/PageHeader"
import { AgentesClient } from "@/components/AgentesClient"

export default function AgentesPage() {
  return (
    <>
      <PageHeader
        variant="editorial"
        eyebrow="· IA · AGENTES ·"
        title="Agentes, tus analistas 24/7."
        subtitle="Pregúntale a Claude sobre tus métricas, audiencia y estrategia"
      />
      <div className="flex min-h-0 flex-1 p-8">
        <AgentesClient />
      </div>
    </>
  )
}
