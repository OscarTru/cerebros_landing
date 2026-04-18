import { Header } from "@/components/Header"
import { MetricCard } from "@/components/MetricCard"
import { getSupabase } from "@/lib/supabase"
import { Mail, Handshake, Heart } from "lucide-react"

async function getOverviewData() {
  const [subscribersRes, colaboracionesRes, likesRes] = await Promise.all([
    getSupabase().from("suscriptores").select("id", { count: "exact", head: true }),
    getSupabase()
      .from("colaboraciones")
      .select("estado")
      .in("estado", ["en_negociacion", "confirmada"]),
    getSupabase().from("post_likes").select("id", { count: "exact", head: true }),
  ])

  return {
    subscribers: subscribersRes.count ?? 0,
    colaboracionesActivas: colaboracionesRes.data?.length ?? 0,
    totalLikes: likesRes.count ?? 0,
  }
}

export default async function OverviewPage() {
  const data = await getOverviewData()

  return (
    <>
      <Header title="Overview" />
      <div className="flex-1 p-8 space-y-8 max-w-5xl">
        {/* Welcome */}
        <div>
          <h2
            className="text-xl font-semibold"
            style={{ color: "var(--c-text)", letterSpacing: "-0.02em" }}
          >
            Bienvenido de vuelta
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--c-text-muted)" }}>
            Aquí tienes un resumen de tu contenido y audiencia.
          </p>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <MetricCard
            label="Suscriptores newsletter"
            value={data.subscribers.toLocaleString("es-MX")}
            icon={Mail}
          />
          <MetricCard
            label="Colaboraciones activas"
            value={data.colaboracionesActivas}
            sublabel="en negociación o confirmadas"
            icon={Handshake}
          />
          <MetricCard
            label="Likes en blog"
            value={data.totalLikes.toLocaleString("es-MX")}
            icon={Heart}
          />
        </div>
      </div>
    </>
  )
}
