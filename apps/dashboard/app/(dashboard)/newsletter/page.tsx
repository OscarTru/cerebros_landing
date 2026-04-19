import { getSupabase } from "@/lib/supabase"
import type { NewsletterSubscriber } from "@cerebros/lib"
import { PageHeader } from "@/components/ui/PageHeader"
import { NewsletterClient } from "./NewsletterClient"

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

export default async function NewsletterPage() {
  const { subscribers, total, confirmed } = await getSubscribers()
  return (
    <>
      <PageHeader
        variant="editorial"
        eyebrow="· AUDIENCIA · NEWSLETTER ·"
        title="Newsletter, tu línea directa."
        subtitle={`${total.toLocaleString("es-MX")} suscriptores · ${confirmed.toLocaleString("es-MX")} confirmados`}
      />
      <div className="flex flex-col gap-6 p-8">
        <NewsletterClient subscribers={subscribers} total={total} confirmed={confirmed} />
      </div>
    </>
  )
}
