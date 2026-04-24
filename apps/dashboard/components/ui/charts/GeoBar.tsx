"use client"
import { InfoCard } from "../InfoCard"
import { Progress } from "@heroui/react"

interface GeoBarItem {
  name: string
  percent: number
  flag?: string
}

interface GeoBarProps {
  title: string
  items: GeoBarItem[]
}

export function GeoBar({ title, items }: GeoBarProps) {
  return (
    <InfoCard title={title}>
      <ul className="flex flex-col gap-3">
        {items.map((it) => (
          <li key={it.name} className="grid grid-cols-[140px_1fr_40px] items-center gap-3">
            <span className="flex items-center gap-2 text-[12px] text-[var(--c-text)]">
              {it.flag && <span>{it.flag}</span>}
              <span className="truncate">{it.name}</span>
            </span>
            <Progress
              aria-label={it.name}
              value={it.percent}
              maxValue={100}
              size="sm"
              classNames={{
                track: "bg-[var(--c-surface-2)]",
                indicator: "bg-[var(--c-invert)]",
              }}
            />
            <span className="text-right text-[11px] font-medium text-[var(--c-text-muted)]">
              {it.percent}%
            </span>
          </li>
        ))}
      </ul>
    </InfoCard>
  )
}
