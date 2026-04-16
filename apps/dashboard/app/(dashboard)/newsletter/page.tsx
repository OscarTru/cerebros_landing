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

export default async function NewsletterPage() {
  const { subscribers, total, confirmed } = await getSubscribers()

  return (
    <>
      <Header title="Newsletter" />
      <div className="p-6 space-y-6">
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

        <div className="bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--c-border)] flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--c-text)]">Suscriptores recientes</p>
            <p className="text-xs text-[var(--c-text-muted)]">Últimos {subscribers.length}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--c-border)]">
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-[var(--c-text-muted)]">Email</th>
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-[var(--c-text-muted)]">Nombre</th>
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-[var(--c-text-muted)]">Estado</th>
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-[var(--c-text-muted)]">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--c-border)]">
                {subscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-[var(--c-surface-2)]">
                    <td className="px-5 py-3 text-[var(--c-text)]">{s.email}</td>
                    <td className="px-5 py-3 text-[var(--c-text-muted)]">{s.nombre ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          s.confirmed
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {s.confirmed ? "Confirmado" : "Pendiente"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[var(--c-text-muted)]">
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
