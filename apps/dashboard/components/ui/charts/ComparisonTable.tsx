"use client"
import { InfoCard } from "../InfoCard"
import { SparklineInline } from "./SparklineInline"
import { cn } from "@cerebros/lib"
import type { TimeSeriesPoint, PlatformId } from "@/lib/analytics/types"

interface ComparisonRow {
  platform: PlatformId
  label: string
  audience: number
  monthlyGrowth: number
  engagementRate: number
  postsPublished: number
  sparkline: TimeSeriesPoint[]
}

interface ComparisonTableProps {
  title: string
  rows: ComparisonRow[]
}

export function ComparisonTable({ title, rows }: ComparisonTableProps) {
  return (
    <InfoCard title={title} padded={false}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <Th>Plataforma</Th>
              <Th align="right">Audiencia</Th>
              <Th align="right">Crecimiento</Th>
              <Th align="right">Engagement</Th>
              <Th align="right">Posts</Th>
              <Th align="right">Tendencia</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.platform}>
                <Td>
                  <span className="text-[13px] font-medium text-[var(--c-text)]">{r.label}</span>
                </Td>
                <Td align="right">
                  <span className="text-[13px] text-[var(--c-text)]">
                    {r.audience.toLocaleString("es-MX")}
                  </span>
                </Td>
                <Td align="right">
                  <span
                    className={cn(
                      "text-[12px] font-medium",
                      r.monthlyGrowth >= 0 ? "text-emerald-500" : "text-red-500"
                    )}
                  >
                    {r.monthlyGrowth >= 0 ? "+" : ""}
                    {r.monthlyGrowth}%
                  </span>
                </Td>
                <Td align="right">
                  <span className="text-[12px] text-[var(--c-text-muted)]">
                    {r.engagementRate > 0 ? `${r.engagementRate}%` : "—"}
                  </span>
                </Td>
                <Td align="right">
                  <span className="text-[12px] text-[var(--c-text-muted)]">{r.postsPublished}</span>
                </Td>
                <Td align="right">
                  <div className="flex justify-end">
                    <SparklineInline data={r.sparkline} />
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </InfoCard>
  )
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      className={cn(
        "px-5 py-3 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--c-text-muted)] border-b border-[var(--c-border)]",
        align === "right" ? "text-right" : "text-left"
      )}
    >
      {children}
    </th>
  )
}

function Td({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <td
      className={cn(
        "px-5 py-3.5 border-t border-[var(--c-border)]",
        align === "right" ? "text-right" : "text-left"
      )}
    >
      {children}
    </td>
  )
}
