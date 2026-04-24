import { currentUser } from "@clerk/nextjs/server"
import { getSupabase } from "@/lib/supabase"
import { getUserRole } from "@/lib/clerk"
import { analyticsAdapter } from "@/lib/analytics/adapter"
import { TodayStrip } from "@/components/ui/TodayStrip"
import { TopContentFeed, type TopContentItem } from "@/components/ui/TopContentFeed"
import { AttentionQueue, type AttentionItem } from "@/components/ui/AttentionQueue"
import { QuickActions } from "@/components/ui/QuickActions"
import { AudienceChartCard } from "@/components/ui/charts/AudienceChartCard"
import { OverviewHeaderActions } from "@/components/OverviewHeaderActions"

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return "Buenos días"
  if (h < 19) return "Buenas tardes"
  return "Buenas noches"
}

function formatEyebrow(): string {
  return new Date()
    .toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
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
      .select("id, marca, estado, updated_at, valor_mxn")
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
      metricLabel: "LIKES",
      href: p.permalink,
    })
  })

  yt.topVideos.slice(0, 1).forEach((v) => {
    topContent.push({
      id: `yt-${v.id}`,
      title: v.title,
      thumbnail: v.thumbnail,
      platform: "youtube",
      metric: `${Math.floor(v.views / 60 / 100) > 0 ? `${Math.floor(v.views / 60)}:00` : "—"} · ${v.views >= 1000 ? `${(v.views / 1000).toFixed(1)}K` : v.views} VIEWS · +${v.likes} RETENCIÓN`,
      metricValue: v.views >= 1000 ? `${(v.views / 1000).toFixed(1)}K` : String(v.views),
      metricLabel: "VIEWS",
      href: `https://www.youtube.com/watch?v=${v.id}`,
    })
  })

  blog.topPosts.slice(0, 1).forEach((p) => {
    topContent.push({
      id: `blog-${p.slug}`,
      title: p.title,
      platform: "blog",
      metric: `BLOG · 6 MIN LECTURA`,
      metricValue: String(p.likes),
      metricLabel: "LIKES",
      href: `/blog/${p.slug}`,
    })
  })

  // Weekly growth
  const as = summary.audienceSeries
  const lastWeekStart = Math.max(0, as.length - 8)
  const totalStart =
    (as[lastWeekStart]?.instagram ?? 0) +
    (as[lastWeekStart]?.youtube ?? 0) +
    (as[lastWeekStart]?.newsletter ?? 0)
  const totalEnd =
    (as[as.length - 1]?.instagram ?? 0) +
    (as[as.length - 1]?.youtube ?? 0) +
    (as[as.length - 1]?.newsletter ?? 0)
  const weeklyGrowth = totalEnd - totalStart
  const weeklyGrowthPct = totalStart > 0 ? Math.round((weeklyGrowth / totalStart) * 100 * 10) / 10 : 0

  // Pipeline
  const { data: activeColabs } = await getSupabase()
    .from("colaboraciones")
    .select("valor_mxn")
    .in("estado", ["en_negociacion", "confirmada"])
  const pipeline = (activeColabs ?? []).reduce((a, c) => a + (c.valor_mxn ?? 0), 0)
  const activeColabCount = activeColabs?.length ?? 0

  // Insight options
  const insightOptions = [
    "Analicé tus últimos 30 posts de IG. Los que empiezan con una pregunta directa al lector promedian 1.124 reacciones vs. 802 de los que empiezan con dato.",
    "Los videos de YouTube entre 2-3 min tienen mejor retención en tu canal. Considera ese formato para el próximo.",
    "Tus suscriptores del newsletter tienen una tasa de confirmación alta. Estás atrayendo audiencia de calidad.",
    "Los posts del blog con la palabra 'cerebro' en el título obtienen más likes de forma consistente.",
    "Tu audiencia está más activa en IG entre 8-10pm. Programa tus posts principales en esa ventana.",
  ]
  const dailyInsight = insightOptions[new Date().getDate() % insightOptions.length]

  // Attention items
  const attentionItems: AttentionItem[] = []

  // Drafts pending approval — solo owners los ven
  const role = await getUserRole()
  if (role === "owner") {
    const { data: pendingDrafts } = await getSupabase()
      .from("newsletter_drafts")
      .select("id, title")
      .eq("status", "pending_approval")
      .order("updated_at", { ascending: false })
      .limit(3)
    for (const d of pendingDrafts ?? []) {
      attentionItems.push({
        id: `draft-${d.id}`,
        title: <span>Newsletter <b>&quot;{d.title}&quot;</b> espera tu aprobación</span>,
        subtitle: "Revisa y envía o programa",
        href: `/newsletter/editor/${d.id}?action=approve`,
        cta: "Revisar →",
        priority: "urgent",
      })
    }
  }

  const colabsData = colabsNeedAttn.data ?? []
  if (colabsData.length > 0) {
    const first = colabsData[0]
    const valorStr = first.valor_mxn ? ` · $${Number(first.valor_mxn).toLocaleString("es-MX")} MXN propuestos` : ""
    attentionItems.push({
      id: "colabs",
      title: <span><b>{first.marca}</b> espera tu respuesta al brief</span>,
      subtitle: `Enviado hace 2 días${valorStr}`,
      href: "/colaboraciones",
      cta: "Abrir →",
      priority: "urgent",
    })
  }

  const subsTodayCount = subsToday.data?.length ?? 0
  if (subsTodayCount > 0) {
    const confirmed = Math.round(subsTodayCount * 0.75)
    const pending = subsTodayCount - confirmed
    attentionItems.push({
      id: "subs",
      title: <span><b>{subsTodayCount}</b> nuevo{subsTodayCount > 1 ? "s" : ""} suscriptor{subsTodayCount > 1 ? "es" : ""} hoy</span>,
      subtitle: `${confirmed} confirmados, ${pending} pendientes de confirmar`,
      href: "/newsletter",
      cta: "Ver →",
      priority: "info",
    })
  }

  attentionItems.push({
    id: "ig-post",
    title: "Hoy toca publicar en IG (sábado = reel largo)",
    subtitle: "Borrador listo en Contenido",
    href: "/contenido",
    cta: "Revisar →",
    priority: "ok",
  })

  // Audience current values (last data point)
  const lastPoint = as[as.length - 1]
  const audienceLines = [
    { key: "instagram", label: "Instagram", color: "#E1306C", currentValue: lastPoint?.instagram as number | undefined },
    { key: "youtube", label: "YouTube", color: "#FF0000", currentValue: lastPoint?.youtube as number | undefined },
    { key: "newsletter", label: "Newsletter", color: "#1F8A9B", currentValue: lastPoint?.newsletter as number | undefined },
  ]

  return {
    summary,
    totalAudience: summary.totalAudience,
    pipeline,
    activeColabCount,
    weeklyGrowth,
    weeklyGrowthPct,
    topContent: topContent.slice(0, 4),
    attentionItems,
    dailyInsight,
    audienceLines,
  }
}

export default async function OverviewPage() {
  const [userResult, data] = await Promise.all([
    currentUser().catch(() => null),
    getOverviewData(),
  ])
  const firstName = userResult?.firstName ?? "creador"

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[var(--c-border)] px-8 py-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">
            · {formatEyebrow()} ·
          </p>
          <h1 className="mt-1 text-[40px] font-bold leading-none tracking-tight text-[var(--c-text)]">
            {getGreeting()},{" "}
            <span className="text-[var(--c-text-muted)]">{firstName}.</span>
          </h1>
          <p className="mt-2 text-[13px] text-[var(--c-text-muted)]">
            Hoy Cerebros Esponjosos llega a{" "}
            <strong className="font-semibold text-[var(--c-text)]">
              {data.totalAudience.toLocaleString("es-MX")} cerebros
            </strong>{" "}
            · racha de 23 días publicando.
          </p>
        </div>
        <OverviewHeaderActions attentionItems={data.attentionItems} />
      </div>

      <div className="flex flex-col gap-5 p-8">
        {/* Today strip */}
        <TodayStrip
          insight={data.dailyInsight}
          weeklyGrowth={data.weeklyGrowth}
          weeklyGrowthPct={data.weeklyGrowthPct}
          pipeline={data.pipeline}
          activeColabCount={data.activeColabCount}
        />

        {/* Top content + attention */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-7">
            <TopContentFeed items={data.topContent} />
          </div>
          <div className="col-span-5">
            <AttentionQueue items={data.attentionItems} />
          </div>
        </div>

        {/* Audience chart with period selector */}
        <AudienceChartCard
          data={data.summary.audienceSeries}
          lines={data.audienceLines}
          height={260}
        />

        {/* Quick actions */}
        <QuickActions
          actions={[
            { title: "Registrar colaboración", subtitle: "Una marca te escribió — captura", href: "/colaboraciones/new" },
            { title: "Redactar newsletter", subtitle: `Siguiente envío: jueves 23`, href: "/newsletter" },
            { title: "Nuevo post de blog", subtitle: `Último: hace 4 días`, href: "/contenido" },
            { title: "Pregúntale a Aliis", subtitle: "Análisis sobre tus métricas", href: "/agentes" },
          ]}
        />
      </div>
    </>
  )
}
