"use client"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react"
import type { LucideIcon } from "lucide-react"
import { EmptyState } from "./EmptyState"

export interface DataTableColumn<T> {
  key: string
  label: string
  align?: "start" | "center" | "end"
  render: (row: T) => React.ReactNode
}

interface DataTableProps<T extends { id: string | number }> {
  columns: DataTableColumn<T>[]
  data: T[]
  emptyState?: {
    icon: LucideIcon
    title: string
    description?: string
  }
  onRowClick?: (row: T) => void
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  emptyState,
  onRowClick,
}: DataTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return (
      <EmptyState
        icon={emptyState.icon}
        title={emptyState.title}
        description={emptyState.description}
      />
    )
  }

  return (
    <Table
      aria-label="Data table"
      removeWrapper
      classNames={{
        th: "bg-transparent text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--c-text-muted)] border-b border-[var(--c-border)]",
        td: "text-[13px] text-[var(--c-text)] border-b border-[var(--c-border)]",
        tr: onRowClick ? "cursor-pointer hover:bg-[var(--c-surface-2)] transition-colors" : "",
      }}
    >
      <TableHeader columns={columns}>
        {(col) => (
          <TableColumn key={col.key} align={col.align}>
            {col.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={data}>
        {(row) => (
          <TableRow
            key={row.id}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
          >
            {(columnKey) => {
              const col = columns.find((c) => c.key === columnKey)
              return <TableCell>{col ? col.render(row) : null}</TableCell>
            }}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
