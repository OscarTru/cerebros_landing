import { currentUser } from "@clerk/nextjs/server"
import { getSupabase } from "@/lib/supabase"
import { analyticsAdapter } from "@/lib/analytics/adapter"
import { PageHeader } from "@/components/ui/PageHeader"
import { TodayStrip } from "@/components/ui/TodayStrip"
import { TopContentFeed, type TopContentItem } from "@/components/ui/TopContentFeed"
import { AttentionQueue, type AttentionItem } from "@/components/ui/AttentionQueue"
import { QuickActions } from "@/components/ui/QuickActions"
import { LineChartCard } from "@/components/ui/charts/LineChartCard"

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return "Buenos días"
  if (h < 19) return "Buenas tardes"
  return "Buenas noches"
}

function formatEyebrow(): string {
  return new Date()
    .toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })
    .toUpperCase()
}

async function getOverviewData() {
  const [summary, ig, yt, blog, colabsNeedAttn, subsToday] = await Promise.all([
    analyticsAdapter.getSummary("30d"),
    analyticsAdapter.getInstagram("30d"),
    analyticsAdapter.getYouTube("30d"),
    analyticsAdapter.getBlog("30d"),
    getSupabase()
      .from("colaboraciones")
      .select("id, marca, estado, updated_at")
      .eq("estado", "en_negociacion")
      .order("updated_at", { ascending: true })
      .limit(5),
    getSupabase()
      .from("suscriptores")
      .select("id, created_at")
      .gte("created_at", new Date(Date.now() - 86_400_000).toISOString()),
  ])

  // Top content cross-platform
  const topContent: TopContentItem[] = []

  ig.topPosts.slice(0, 2).forEach((p) => {
    topContent.push({
      id: `ig-${p.id}`,
      title: p.caption.slice(0, 80) || "Post de Instagram",
      thumbnail: p.thumbnail,
      platform: "instagram",
      metric: `REEL · ${p.reach.toLocaleString("es-MX")} ALCANCE`,
      metricValue: p.likes.toLocaleString("es-MX"),
      href: p.permalink,
    })
  })

  yt.topVideos.slice(0, 1).forEach((v) => {
    topContent.push({
      id: `yt-${v.id}`,
      title: v.title,
      thumbnail: v.thumbnail,
      platform: "youtube",
      metric: `${v.likes.toLocaleString("es-MX")} likes`,
      metricValue: v.views >= 1000
        ? `${(v.views / 1000).toFixed(1)}K`
        : v.views.toLocaleString("es-MX"),
      href: `https://www.youtube.com/watch?v=${v.id}`,
    })
  })

  blog.topPosts.slice(0, 1).forEach((p) => {
    if (p.likes > 0) {
      topContent.push({
        id: `blog-${p.slug}`,
        title: p.title,
        platform: "blog",
        metric: `${p.readingTime ?? "—"} min lectura`,
        metricValue: String(p.likes),
        href: `/blog/${p.slug}`,
      })
    }
  })

  // Weekly growth
  const as = summary.audienceSeries
  const lastWeekStart = Math.max(0, as.length - 8)
  const totalStart =
    (as[lastWeekStart]?.instagram ?? 0) +
    (as[lastWeekStart]?.youtube ?? 0) +
    (as[lastWeekStart]?.tiktok ?? 0) +
    (as[lastWeekStart]?.newsletter ?? 0)
  const totalEnd =
    (as[as.length - 1]?.instagram ?? 0) +
    (as[as.length - 1]?.youtube ?? 0) +
    (as[as.length - 1]?.tiktok ?? 0) +
    (as[as.length - 1]?.newsletter ?? 0)
  const weeklyGrowth = totalEnd - totalStart

  // Pipeline
  const { data: activeColabs } = await getSupabase()
    .from("colaboraciones")
    .select("valor_mxn")
    .in("estado", ["en_negociacion", "confirmada"])
  const pipeline = (activeColabs ?? []).reduce((a, c) => a + (c.valor_mxn ?? 0), 0)
  const activeColabCount = activeColabs?.length ?? 0

  // Daily insight (rotativo por día)
  const insightOptions = [
    "Tus posts de Instagram con preguntas obtienen 40% más engagement. Intenta abrir con una pregunta.",
    "Los videos de YouTube entre 2-3 min tienen mejor retención en tu canal. Considera ese formato.",
    "Tus suscriptores del newsletter tienen una tasa de confirmación alta. Estás atrayendo audiencia de calidad.",
    "Los posts del blog con la palabra 'cerebro' en el título obtienen más likes.",
    "Tu audiencia está más activa en IG entre 8-10pm. Programa tus posts principales en esa ventana.",
  ]
  const dailyInsight = insightOptions[new Date().getDate() % insightOptions.length]

  // Attention items
  const attentionItems: AttentionItem[] = []
  const colabsData = colabsNeedAttn.data ?? []
  if (colabsData.length > 0) {
    attentionItems.push({
      id: "colabs",
      title: (
        <span>
          <b>{colabsData[0].marca}</b> espera tu respuesta
        </span>
      ),
      subtitle: `${colabsData.length} colab${colabsData.length > 1 ? "s" : ""} en negociación · requieren seguimiento`,
      href: "/colaboraciones",
      cta: "Abrir →",
      priority: "urgent",
    })
  }

  const subsTodayCount = subsToday.data?.length ?? 0
  if (subsTodayCount > 0) {
    attentionItems.push({
      id: "subs",
      title: (
        <span>
          <b>{subsTodayCount}</b> nuevo{subsTodayCount > 1 ? "s" : ""} suscriptor{subsTodayCount > 1 ? "es" : ""} hoy
        </span>
      ),
      subtitle: `${subsTodayCount > 1 ? "Varios" : "Uno"} pendiente de confirmar`,
      href: "/newsletter",
      cta: "Ver →",
      priority: "info",
    })
  }

  attentionItems.push({
    id: "comments",
    title: "Revisa comentarios en IG",
    subtitle: "Responder dentro de 24h mantiene tu engagement",
    href: "https://instagram.com",
    cta: "Ir →",
    priority: "neutral",
  })

  return {
    summary,
    totalAudience: summary.totalAudience,
    pipeline,
    activeColabCount,
    weeklyGrowth,
    topContent: topContent.slice(0, 4),
    attentionItems,
    dailyInsight,
  }
}

export default async function OverviewPage() {
  const [user, data] = await Promise.all([currentUser(), getOverviewData()])
  const firstName = user?.firstName ?? "creador"

  return (
    <>
      <PageHeader
        variant="editorial"
        eyebrow={`· ${formatEyebrow()} ·`}
        title={`${getGreeting()}, ${firstName}.`}
        subtitle={`Cerebros Esponjosos llega a ${data.totalAudience.toLocaleString("es-MX")} cerebros hoy.`}
      />

      <div className="flex flex-col gap-5 p-8">
        {/* Today strip */}
        <TodayStrip
          insight={data.dailyInsight}
          weeklyGrowth={data.weeklyGrowth}
          pipeline={data.pipeline}
          activeColabCount={data.activeColabCount}
        />

        {/* 7/5 grid: top content + attention */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-7">
            <TopContentFeed items={data.topContent} />
          </div>
          <div className="col-span-5">
            <AttentionQueue items={data.attentionItems} />
          </div>
        </div>

        {/* Growth chart */}
        <LineChartCard
          title="Crecimiento de audiencia · últimos 30 días"
          data={data.summary.audienceSeries}
          lines={[
            { key: "instagram", label: "Instagram", color: "#E1306C" },
            { key: "youtube", label: "YouTube", color: "#FF0000" },
            { key: "tiktok", label: "TikTok", color: "#000000" },
            { key: "newsletter", label: "Newsletter", color: "#1F8A9B" },
          ]}
          height={240}
        />

        {/* Quick actions */}
        <QuickActions
          actions={[
            { title: "Registrar colaboración", subtitle: "Una marca te escribió — captúrala", href: "/colaboraciones/new" },
            { title: "Redactar newsletter", subtitle: "Siguiente envío: próximo jueves", href: "/newsletter" },
            { title: "Nuevo post de blog", subtitle: "Añade contenido a tu blog", href: "/contenido" },
            { title: "Pregúntale a Claude", subtitle: "Análisis sobre tus métricas", href: "/agentes" },
          ]}
        />
      </div>
    </>
  )
}
