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
  return {
    subscribers: (data ?? []) as NewsletterSubscriber[],
    total: count ?? 0,
    confirmed,
  }
}

const thClass =
  "px-5 py-3 text-left text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--c-text-muted)] border-b border-[var(--c-border)]"

const tdClass = "px-5 py-3.5 text-[13px] border-t border-[var(--c-border)]"

export default async function NewsletterPage() {
  const { subscribers, total, confirmed } = await getSubscribers()

  return (
    <>
      <Header title="Newsletter" />
      <div className="p-8 flex flex-col gap-6">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        <div className="rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <div className="px-5 py-3.5 border-b border-[var(--c-border)] flex items-center justify-between">
            <p className="text-[13px] font-medium text-[var(--c-text)]">Suscriptores recientes</p>
            <p className="text-xs text-[var(--c-text-muted)]">Últimos {subscribers.length}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={thClass}>Email</th>
                  <th className={thClass}>Nombre</th>
                  <th className={thClass}>Estado</th>
                  <th className={thClass}>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s.id}>
                    <td className={`${tdClass} text-[var(--c-text)]`}>{s.email}</td>
                    <td className={`${tdClass} text-[var(--c-text-muted)]`}>{s.nombre ?? "—"}</td>
                    <td className={tdClass}>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                          s.confirmed
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/25"
                            : "bg-[var(--c-surface-2)] text-[var(--c-text-muted)] border-[var(--c-border)]"
                        }`}
                      >
                        {s.confirmed ? "Confirmado" : "Pendiente"}
                      </span>
                    </td>
                    <td className={`${tdClass} text-[var(--c-text-muted)]`}>
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
    </>
  )
}
