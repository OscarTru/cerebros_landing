"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react"
import { Calendar, ChevronDown } from "lucide-react"
import { periodLabel, isValidPeriod } from "@/lib/analytics/period"
import type { Period } from "@/lib/analytics/types"

const OPTIONS: Period[] = ["7d", "30d", "90d", "all"]

export function PeriodSelector() {
  const router = useRouter()
  const params = useSearchParams()
  const raw = params.get("period")
  const current: Period = isValidPeriod(raw) ? raw : "30d"

  function setPeriod(p: Period) {
    const sp = new URLSearchParams(params.toString())
    sp.set("period", p)
    router.push(`?${sp.toString()}`)
  }

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          size="sm"
          variant="flat"
          className="h-8 rounded-xl bg-[var(--c-surface)] border border-[var(--c-border)] text-[12px] text-[var(--c-text)]"
          startContent={<Calendar className="h-3.5 w-3.5" />}
          endContent={<ChevronDown className="h-3 w-3" />}
        >
          {periodLabel(current)}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Período"
        selectionMode="single"
        selectedKeys={[current]}
        onSelectionChange={(keys) => {
          const key = Array.from(keys)[0] as Period
          if (key && isValidPeriod(key)) setPeriod(key)
        }}
      >
        {OPTIONS.map((p) => (
          <DropdownItem key={p}>{periodLabel(p)}</DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  )
}
