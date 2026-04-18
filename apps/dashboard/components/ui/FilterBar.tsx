"use client"
import { Input } from "@heroui/react"
import { Search } from "lucide-react"

interface FilterBarProps {
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  children?: React.ReactNode
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  children,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] p-3">
      {onSearchChange && (
        <Input
          value={searchValue ?? ""}
          onValueChange={onSearchChange}
          placeholder={searchPlaceholder}
          size="sm"
          startContent={<Search className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />}
          classNames={{
            base: "max-w-xs",
            inputWrapper: "bg-[var(--c-surface-2)] border border-[var(--c-border)] shadow-none",
          }}
        />
      )}
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  )
}
