import { currentUser } from "@clerk/nextjs/server"
import { getSupabase } from "@/lib/supabase"
import { analyticsAdapter } from "@/lib/analytics/adapter"
import {
  Users,
  TrendingUp,
  DollarSign,
  Sparkles,
  Plus,
  Send,
  MessageSquare,
  AlertCircle,
  Mail,
  MessageCircle,
  ArrowRight,
  Play,
} from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { Section } from "@/components/ui/Section"
import { StatCard } from "@/components/ui/StatCard"
import { ActionCard } from "@/components/ui/ActionCard"
import { InfoCard } from "@/components/ui/InfoCard"
import { FadeIn } from "@/components/ui/effects/FadeIn"
import { LineChartCard } from "@/components/ui/charts/LineChartCard"
import Link from "next/link"

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return "Buenos días"
  if (h < 19) return "Buenas tardes"
  return "Buenas noches"
}

function formatFullDate(): string {
  return new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
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

  // Top content esta semana cross-platform (IG posts + YT videos + blog posts)
  const oneWeekAgo = Date.now() - 7 * 86_400_000
  const topContent: Array<{
    id: string
    title: string
    thumbnail?: string
    platform: "instagram" | "youtube" | "blog"
    metric: string
    href: string
  }> = []

  // IG top post de la semana
  const recentIgPosts = ig.topPosts.slice(0, 3)
  recentIgPosts.forEach((p) => {
    topContent.push({
      id: `ig-${p.id}`,
      title: p.caption.slice(0, 60) || "Post de Instagram",
      thumbnail: p.thumbnail,
      platform: "instagram",
      metric: `${p.likes.toLocaleString("es-MX")} likes · ${p.reach.toLocaleString("es-MX")} reach`,
      href: p.permalink,
    })
  })

  // YT top video de la semana
  const ytWeek = yt.topVideos.filter((v) => new Date(v.publishedAt).getTime() > oneWeekAgo)
  const ytToShow = ytWeek.length > 0 ? ytWeek : yt.topVideos.slice(0, 1)
  ytToShow.slice(0, 1).forEach((v) => {
    topContent.push({
      id: `yt-${v.id}`,
      title: v.title,
      thumbnail: v.thumbnail,
      platform: "youtube",
      metric: `${v.views.toLocaleString("es-MX")} views · ${v.likes.toLocaleString("es-MX")} likes`,
      href: `https://www.youtube.com/watch?v=${v.id}`,
    })
  })

  // Blog top post
  blog.topPosts.slice(0, 1).forEach((p) => {
    if (p.likes > 0) {
      topContent.push({
        id: `blog-${p.slug}`,
        title: p.title,
        platform: "blog",
        metric: `${p.likes} likes`,
        href: `/blog/${p.slug}`,
      })
    }
  })

  // Ordenamos simple: IG primero (más impacto numérico), YT, Blog
  const rankedContent = topContent.slice(0, 3)

  // Weekly growth (sum of last 7 points in audienceSeries — diff first vs last)
  const as = summary.audienceSeries
  const lastWeekStart = Math.max(0, as.length - 8)
  const totalStart = (as[lastWeekStart]?.instagram ?? 0) +
    (as[lastWeekStart]?.youtube ?? 0) +
    (as[lastWeekStart]?.tiktok ?? 0) +
    (as[lastWeekStart]?.newsletter ?? 0)
  const totalEnd = (as[as.length - 1]?.instagram ?? 0) +
    (as[as.length - 1]?.youtube ?? 0) +
    (as[as.length - 1]?.tiktok ?? 0) +
    (as[as.length - 1]?.newsletter ?? 0)
  const weeklyGrowth = totalEnd - totalStart

  // Pipeline using real colaboraciones
  const { data: activeColabs } = await getSupabase()
    .from("colaboraciones")
    .select("valor_mxn")
    .in("estado", ["en_negociacion", "confirmada"])
  const pipeline = (activeColabs ?? []).reduce((a, c) => a + (c.valor_mxn ?? 0), 0)
  const activeColabCount = activeColabs?.length ?? 0

  // Pick insight message (mock, para futuro lo genera Claude)
  const insightOptions = [
    "Tus posts de Instagram con preguntas obtienen 40% más engagement. Intenta abrir con una pregunta.",
    "Los videos de YouTube entre 2-3 min tienen mejor retención en tu canal. Considera ese formato.",
    "Tus suscriptores del newsletter tienen una tasa de confirmación alta. Estás atrayendo audiencia de calidad.",
    "Los posts del blog con la palabra 'cerebro' en el título obtienen más likes. Úsala estratégicamente.",
    "Tu audiencia está más activa en IG entre 8-10pm. Programa tus posts principales en esa ventana.",
  ]
  const dailyInsight = insightOptions[new Date().getDate() % insightOptions.length]

  return {
    summary,
    totalAudience: summary.totalAudience,
    avgEngagement: summary.avgEngagementRate,
    pipeline,
    activeColabCount,
    weeklyGrowth,
    topContent: rankedContent,
    colabsNeedingAttention: colabsNeedAttn.data ?? [],
    subsTodayCount: subsToday.data?.length ?? 0,
    dailyInsight,
  }
}

export default async function OverviewPage() {
  const [user, data] = await Promise.all([currentUser(), getOverviewData()])
  const firstName = user?.firstName ?? "creador"

  const platformIconBg: Record<"instagram" | "youtube" | "blog", string> = {
    instagram: "bg-pink-500/10 text-pink-500",
    youtube: "bg-red-500/10 text-red-500",
    blog: "bg-emerald-500/10 text-emerald-500",
  }

  const platformLabel: Record<"instagram" | "youtube" | "blog", string> = {
    instagram: "Instagram",
    youtube: "YouTube",
    blog: "Blog",
  }

  return (
    <>
      <PageHeader
        title={`${getGreeting()}, ${firstName} 👋`}
        subtitle={`Hoy es ${formatFullDate()}`}
      />

      <div className="flex flex-col gap-8 p-8">
        {/* Row 1: 4 hero stats */}
        <FadeIn>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Audiencia total"
              value={data.totalAudience}
              sublabel="cross-platform"
              icon={<Users className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />}
              trend={{ value: 2.1, label: "últimos 30d" }}
            />
            <StatCard
              label="Engagement promedio"
              value={`${data.avgEngagement}%`}
              sublabel="todas las redes"
              icon={<TrendingUp className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />}
              animate={false}
            />
            <StatCard
              label="Pipeline activo"
              value={`$${data.pipeline.toLocaleString("es-MX")}`}
              sublabel={`${data.activeColabCount} colaboraciones`}
              icon={<DollarSign className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />}
              animate={false}
            />
            <StatCard
              label="Esta semana"
              value={data.weeklyGrowth >= 0 ? `+${data.weeklyGrowth}` : `${data.weeklyGrowth}`}
              sublabel="nuevos fans totales"
              icon={<Sparkles className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />}
            />
          </div>
        </FadeIn>

        {/* Row 2: Top content + Attention + Insight */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
          <FadeIn delay={0.1}>
            <InfoCard
              title="Lo que mejor funcionó esta semana"
              action={
                <Link
                  href="/analytics"
                  className="flex items-center gap-1 text-[12px] text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors"
                >
                  Ver más <ArrowRight className="h-3 w-3" />
                </Link>
              }
              padded={false}
            >
              {data.topContent.length === 0 ? (
                <div className="p-8 text-center text-sm text-[var(--c-text-muted)]">
                  Aún no hay suficiente data esta semana.
                </div>
              ) : (
                <ul className="divide-y divide-[var(--c-border)]">
                  {data.topContent.map((c) => (
                    <li key={c.id}>
                      <a
                        href={c.href}
                        target={c.href.startsWith("http") ? "_blank" : undefined}
                        rel="noopener"
                        className="group flex items-center gap-4 px-5 py-3 transition-colors hover:bg-[var(--c-surface-2)]"
                      >
                        {c.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={c.thumbnail}
                            alt=""
                            className="h-12 w-12 shrink-0 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--c-surface-2)]">
                            <Play className="h-4 w-4 text-[var(--c-text-muted)]" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${platformIconBg[c.platform]}`}
                            >
                              {platformLabel[c.platform]}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-[13px] font-medium text-[var(--c-text)]">
                            {c.title}
                          </p>
                          <p className="truncate text-[11px] text-[var(--c-text-muted)]">
                            {c.metric}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-[var(--c-text-subtle)] opacity-0 transition-opacity group-hover:opacity-100" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </InfoCard>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="flex flex-col gap-4">
              <InfoCard title="Necesita tu atención">
                <ul className="flex flex-col gap-3">
                  {data.colabsNeedingAttention.length > 0 && (
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-500/10">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href="/colaboraciones"
                          className="text-[13px] text-[var(--c-text)] hover:underline"
                        >
                          {data.colabsNeedingAttention.length} colab
                          {data.colabsNeedingAttention.length > 1 ? "es" : ""} en negociación
                        </Link>
                        <p className="text-[11px] text-[var(--c-text-muted)]">
                          Requieren respuesta o seguimiento
                        </p>
                      </div>
                    </li>
                  )}

                  {data.subsTodayCount > 0 && (
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-500/10">
                        <Mail className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href="/newsletter"
                          className="text-[13px] text-[var(--c-text)] hover:underline"
                        >
                          {data.subsTodayCount} nuevo{data.subsTodayCount > 1 ? "s" : ""} suscriptor
                          {data.subsTodayCount > 1 ? "es" : ""} hoy
                        </Link>
                        <p className="text-[11px] text-[var(--c-text-muted)]">
                          Audiencia creciendo
                        </p>
                      </div>
                    </li>
                  )}

                  <li className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-500/10">
                      <MessageCircle className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] text-[var(--c-text)]">
                        Revisa comentarios en IG
                      </p>
                      <p className="text-[11px] text-[var(--c-text-muted)]">
                        Responder dentro de 24h sube engagement
                      </p>
                    </div>
                  </li>

                  {data.colabsNeedingAttention.length === 0 && data.subsTodayCount === 0 && (
                    <li className="text-[12px] text-[var(--c-text-muted)]">
                      Nada urgente hoy. 🎉
                    </li>
                  )}
                </ul>
              </InfoCard>

              <InfoCard title="💡 Insight del día">
                <p className="text-[13px] leading-relaxed text-[var(--c-text)]">
                  {data.dailyInsight}
                </p>
                <Link
                  href="/agentes"
                  className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-[var(--c-text)] hover:underline"
                >
                  Analizar con Claude <ArrowRight className="h-3 w-3" />
                </Link>
              </InfoCard>
            </div>
          </FadeIn>
        </div>

        {/* Row 3: Growth chart */}
        <FadeIn delay={0.2}>
          <LineChartCard
            title="Crecimiento de audiencia · últimos 30 días"
            data={data.summary.audienceSeries}
            lines={[
              { key: "instagram", label: "Instagram", color: "#E1306C" },
              { key: "youtube", label: "YouTube", color: "#FF0000" },
              { key: "tiktok", label: "TikTok", color: "#000000" },
              { key: "newsletter", label: "Newsletter", color: "#10b981" },
            ]}
            height={240}
          />
        </FadeIn>

        {/* Row 4: Quick actions */}
        <FadeIn delay={0.25}>
          <Section label="Acciones rápidas">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ActionCard
                title="Nueva colaboración"
                description="Registrar una marca o propuesta"
                icon={<Plus className="h-4 w-4 text-[var(--c-text)]" />}
                href="/colaboraciones/new"
              />
              <ActionCard
                title="Enviar newsletter"
                description="Compón y envía a tus suscriptores"
                icon={<Send className="h-4 w-4 text-[var(--c-text)]" />}
                href="/newsletter"
              />
              <ActionCard
                title="Preguntar a Claude"
                description="Análisis de tu contenido"
                icon={<MessageSquare className="h-4 w-4 text-[var(--c-text)]" />}
                href="/agentes"
              />
            </div>
          </Section>
        </FadeIn>
      </div>
    </>
  )
}
