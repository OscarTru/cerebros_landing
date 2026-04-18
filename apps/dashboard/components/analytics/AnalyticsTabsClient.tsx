"use client"
import { Tabs, Tab } from "@heroui/react"

interface AnalyticsTabsClientProps {
  overview: React.ReactNode
  instagram: React.ReactNode
  youtube: React.ReactNode
  tiktok: React.ReactNode
  blog: React.ReactNode
}

export function AnalyticsTabsClient({
  overview,
  instagram,
  youtube,
  tiktok,
  blog,
}: AnalyticsTabsClientProps) {
  return (
    <Tabs
      aria-label="Analytics sections"
      variant="underlined"
      classNames={{
        tabList: "border-b border-[var(--c-border)] gap-6 w-full",
        cursor: "bg-[var(--c-invert)]",
        tab: "px-0 h-10 data-[selected=true]:text-[var(--c-text)] text-[var(--c-text-muted)]",
      }}
    >
      <Tab key="overview" title="Overview">
        <div className="pt-6">{overview}</div>
      </Tab>
      <Tab key="instagram" title="Instagram">
        <div className="pt-6">{instagram}</div>
      </Tab>
      <Tab key="youtube" title="YouTube">
        <div className="pt-6">{youtube}</div>
      </Tab>
      <Tab key="tiktok" title="TikTok">
        <div className="pt-6">{tiktok}</div>
      </Tab>
      <Tab key="blog" title="Blog">
        <div className="pt-6">{blog}</div>
      </Tab>
    </Tabs>
  )
}
