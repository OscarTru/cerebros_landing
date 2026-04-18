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
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Header title="Overview" />
      <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "32px" }}>
        {/* Welcome */}
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--c-text)", letterSpacing: "-0.02em", margin: 0 }}>
            Bienvenido de vuelta
          </h2>
          <p style={{ fontSize: "14px", color: "var(--c-text-muted)", marginTop: "4px" }}>
            Aquí tienes un resumen de tu contenido y audiencia.
          </p>
        </div>

        {/* Metric cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
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
    </div>
  )
}
