import { getSupabase } from "@/lib/supabase"
import {
  Mail,
  Handshake,
  Heart,
  Plus,
  Send,
  MessageSquare,
} from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { Section } from "@/components/ui/Section"
import { StatCard } from "@/components/ui/StatCard"
import { ActionCard } from "@/components/ui/ActionCard"
import { InfoCard } from "@/components/ui/InfoCard"
import { FadeIn } from "@/components/ui/effects/FadeIn"
import { StaggerList } from "@/components/ui/effects/StaggerList"

async function getOverviewData() {
  const [subsRes, colabsRes, likesRes, recentSubs, recentColabs] =
    await Promise.all([
      getSupabase().from("suscriptores").select("id", { count: "exact", head: true }),
      getSupabase()
        .from("colaboraciones")
        .select("estado")
        .in("estado", ["en_negociacion", "confirmada"]),
      getSupabase().from("post_likes").select("id", { count: "exact", head: true }),
      getSupabase()
        .from("suscriptores")
        .select("email, created_at")
        .order("created_at", { ascending: false })
        .limit(3),
      getSupabase()
        .from("colaboraciones")
        .select("marca, estado, updated_at")
        .order("updated_at", { ascending: false })
        .limit(2),
    ])

  const activity = [
    ...(recentSubs.data ?? []).map((s) => ({
      kind: "sub" as const,
      text: `Nuevo suscriptor: ${s.email}`,
      date: s.created_at,
    })),
    ...(recentColabs.data ?? []).map((c) => ({
      kind: "colab" as const,
      text: `Colaboración "${c.marca}" → ${c.estado}`,
      date: c.updated_at,
    })),
  ]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 5)

  return {
    subscribers: subsRes.count ?? 0,
    colaboracionesActivas: colabsRes.data?.length ?? 0,
    totalLikes: likesRes.count ?? 0,
    activity,
  }
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const diffH = Math.floor((Date.now() - d.getTime()) / 3_600_000)
  if (diffH < 1) return "hace minutos"
  if (diffH < 24) return `hace ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return "ayer"
  if (diffD < 7) return `hace ${diffD}d`
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" })
}

export default async function OverviewPage() {
  const data = await getOverviewData()

  return (
    <>
      <PageHeader
        title="Bienvenido de vuelta"
        subtitle="Aquí tienes un resumen de tu contenido y audiencia"
      />

      <div className="flex flex-col gap-8 p-8">
        <FadeIn>
          <Section label="Acciones rápidas">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ActionCard
                title="Nueva colaboración"
                description="Registrar una marca o propuesta"
                icon={Plus}
                href="/colaboraciones/new"
              />
              <ActionCard
                title="Enviar newsletter"
                description="Compón y envía a tus suscriptores"
                icon={Send}
                href="/newsletter"
              />
              <ActionCard
                title="Preguntar a Claude"
                description="Análisis de tu contenido"
                icon={MessageSquare}
                href="/agentes"
              />
            </div>
          </Section>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Section label="Métricas clave">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                label="Suscriptores newsletter"
                value={data.subscribers}
                icon={Mail}
              />
              <StatCard
                label="Colaboraciones activas"
                value={data.colaboracionesActivas}
                sublabel="en negociación o confirmadas"
                icon={Handshake}
              />
              <StatCard
                label="Likes en blog"
                value={data.totalLikes}
                icon={Heart}
              />
            </div>
          </Section>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Section label="Actividad reciente">
            <InfoCard padded={false}>
              {data.activity.length === 0 ? (
                <p className="p-6 text-sm text-[var(--c-text-muted)]">
                  Sin actividad reciente.
                </p>
              ) : (
                <StaggerList className="divide-y divide-[var(--c-border)]">
                  {data.activity.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-5 py-3"
                    >
                      <p className="text-sm text-[var(--c-text)]">{a.text}</p>
                      <p className="text-xs text-[var(--c-text-muted)]">
                        {formatDate(a.date)}
                      </p>
                    </div>
                  ))}
                </StaggerList>
              )}
            </InfoCard>
          </Section>
        </FadeIn>
      </div>
    </>
  )
}
