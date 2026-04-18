import { PageHeader } from "@/components/ui/PageHeader"
import { FadeIn } from "@/components/ui/effects/FadeIn"
import { parsePeriod } from "@/lib/analytics/period"
import { analyticsAdapter } from "@/lib/analytics/adapter"
import { AnalyticsTabsClient } from "@/components/analytics/AnalyticsTabsClient"
import { AnalyticsHeaderActions } from "@/components/analytics/AnalyticsHeaderActions"
import { OverviewPanel } from "@/components/analytics/OverviewPanel"
import { InstagramPanel } from "@/components/analytics/InstagramPanel"
import { YouTubePanel } from "@/components/analytics/YouTubePanel"
import { TikTokPanel } from "@/components/analytics/TikTokPanel"
import { BlogPanel } from "@/components/analytics/BlogPanel"

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const { period: periodParam } = await searchParams
  const period = parsePeriod(periodParam)

  const [summary, ig, yt, tt, blog] = await Promise.all([
    analyticsAdapter.getSummary(period),
    analyticsAdapter.getInstagram(period),
    analyticsAdapter.getYouTube(period),
    analyticsAdapter.getTikTok(period),
    analyticsAdapter.getBlog(period),
  ])

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Métricas de redes sociales y blog"
        actions={<AnalyticsHeaderActions lastSync={summary.lastSync} />}
      />
      <div className="flex flex-col gap-6 p-8">
        <FadeIn>
          <AnalyticsTabsClient
            overview={<OverviewPanel data={summary} />}
            instagram={<InstagramPanel data={ig} />}
            youtube={<YouTubePanel data={yt} />}
            tiktok={<TikTokPanel data={tt} />}
            blog={<BlogPanel data={blog} />}
          />
        </FadeIn>
      </div>
    </>
  )
}
