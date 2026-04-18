import { Header } from "@/components/Header"
import { getSupabase } from "@/lib/supabase"
import { MetricCard } from "@/components/MetricCard"
import { Mail, CheckCircle } from "lucide-react"
import type { NewsletterSubscriber } from "@cerebros/lib"

async function getSubscribers() {
  const { data, count } = await getSupabase()
    .from("suscriptores")
    .select("id, email, nombre, confirmed, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(100)

  const confirmed = data?.filter((s) => s.confirmed).length ?? 0
  return { subscribers: (data ?? []) as NewsletterSubscriber[], total: count ?? 0, confirmed }
}

const thStyle: React.CSSProperties = {
  padding: "12px 20px",
  textAlign: "left",
  fontSize: "11px",
  fontWeight: 500,
  color: "var(--c-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  borderBottom: "1px solid var(--c-border)",
}

const tdStyle: React.CSSProperties = {
  padding: "14px 20px",
  fontSize: "13px",
  borderTop: "1px solid var(--c-border)",
}

export default async function NewsletterPage() {
  const { subscribers, total, confirmed } = await getSubscribers()

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Header title="Newsletter" />
      <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
          <MetricCard
            label="Total suscriptores"
            value={total.toLocaleString("es-MX")}
            icon={Mail}
          />
          <MetricCard
            label="Confirmados"
            value={confirmed.toLocaleString("es-MX")}
            sublabel={`${Math.round((confirmed / Math.max(total, 1)) * 100)}% del total`}
            icon={CheckCircle}
          />
        </div>

        <div style={{
          background: "var(--c-surface)",
          border: "1px solid var(--c-border)",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}>
          <div style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--c-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--c-text)", margin: 0 }}>
              Suscriptores recientes
            </p>
            <p style={{ fontSize: "12px", color: "var(--c-text-muted)", margin: 0 }}>
              Últimos {subscribers.length}
            </p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Nombre</th>
                  <th style={thStyle}>Estado</th>
                  <th style={thStyle}>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s.id}>
                    <td style={{ ...tdStyle, color: "var(--c-text)" }}>{s.email}</td>
                    <td style={{ ...tdStyle, color: "var(--c-text-muted)" }}>{s.nombre ?? "—"}</td>
                    <td style={tdStyle}>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "3px 10px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: 500,
                        background: s.confirmed ? "rgba(16,185,129,0.12)" : "var(--c-surface-2)",
                        color: s.confirmed ? "#10b981" : "var(--c-text-muted)",
                        border: s.confirmed ? "1px solid rgba(16,185,129,0.25)" : "1px solid var(--c-border)",
                      }}>
                        {s.confirmed ? "Confirmado" : "Pendiente"}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: "var(--c-text-muted)" }}>
                      {new Date(s.created_at).toLocaleDateString("es-MX", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
