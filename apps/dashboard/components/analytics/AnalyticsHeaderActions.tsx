import { PeriodSelector } from "@/components/ui/charts/PeriodSelector"
import { SyncStatusBadge } from "@/components/ui/charts/SyncStatusBadge"

interface AnalyticsHeaderActionsProps {
  lastSync: string
}

export function AnalyticsHeaderActions({ lastSync }: AnalyticsHeaderActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <SyncStatusBadge lastSync={lastSync} />
      <PeriodSelector />
    </div>
  )
}
