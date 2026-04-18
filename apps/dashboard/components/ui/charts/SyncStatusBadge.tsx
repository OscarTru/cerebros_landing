"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@heroui/react"
import { RefreshCw } from "lucide-react"
import { cn } from "@cerebros/lib"

interface SyncStatusBadgeProps {
  lastSync: string
}

function timeAgo(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const mins = Math.floor((now - then) / 60_000)
  if (mins < 1) return "hace segundos"
  if (mins < 60) return `hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `hace ${days}d`
}

export function SyncStatusBadge({ lastSync }: SyncStatusBadgeProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSync() {
    setLoading(true)
    try {
      await fetch("/api/analytics/sync", { method: "POST" })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="flat"
      onPress={handleSync}
      isLoading={loading}
      className="h-8 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-[12px] text-[var(--c-text-muted)]"
      startContent={
        !loading ? (
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
        ) : null
      }
    >
      Sincronizado {timeAgo(lastSync)}
    </Button>
  )
}
