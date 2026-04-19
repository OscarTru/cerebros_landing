"use client"
import { useMemo, useState } from "react"
import { Mail, CheckCircle, User, Inbox } from "lucide-react"
import type { NewsletterSubscriber } from "@cerebros/lib"
import { StatCard } from "@/components/ui/StatCard"
import { TwoColumnLayout } from "@/components/ui/TwoColumnLayout"
import { InfoCard } from "@/components/ui/InfoCard"
import { FilterBar } from "@/components/ui/FilterBar"
import { ChipStatus } from "@/components/ui/ChipStatus"
import { EmptyState } from "@/components/ui/EmptyState"
import { Avatar, Button } from "@heroui/react"
import { cn } from "@cerebros/lib"

interface Props {
  subscribers: NewsletterSubscriber[]
  total: number
  confirmed: number
}

export function NewsletterClient({ subscribers, total, confirmed }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(
    subscribers[0]?.id ?? null
  )
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "confirmed" | "pending">("all")

  const filtered = useMemo(() => {
    return subscribers.filter((s) => {
      if (filter === "confirmed" && !s.confirmed) return false
      if (filter === "pending" && s.confirmed) return false
      if (search && !s.email.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [subscribers, search, filter])

  const selected = subscribers.find((s) => s.id === selectedId) ?? null
  const confirmRate = total > 0 ? Math.round((confirmed / total) * 100) : 0

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total suscriptores" value={total} icon={<Mail className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
        <StatCard label="Confirmados" value={confirmed} icon={<CheckCircle className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />} />
        <StatCard
          label="Tasa de confirmación"
          value={`${confirmRate}%`}
          sublabel={`${confirmed} / ${total}`}
          animate={false}
        />
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por email..."
      >
        {(["all", "confirmed", "pending"] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "solid" : "flat"}
            onPress={() => setFilter(f)}
            className={cn(
              "rounded-lg h-7 text-[12px]",
              filter === f
                ? "bg-[var(--c-invert)] text-[var(--c-invert-fg)]"
                : "bg-[var(--c-surface-2)] text-[var(--c-text-muted)]"
            )}
          >
            {f === "all" ? "Todos" : f === "confirmed" ? "Confirmados" : "Pendientes"}
          </Button>
        ))}
      </FilterBar>

      <TwoColumnLayout
        leftWidth="balanced"
        left={
          <InfoCard padded={false} title={`Suscriptores (${filtered.length})`}>
            {filtered.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="Sin resultados"
                description="Intenta con otra búsqueda."
              />
            ) : (
              <ul className="max-h-[520px] overflow-y-auto divide-y divide-[var(--c-border)]">
                {filtered.map((s) => (
                  <li
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 px-5 py-3 transition-colors",
                      selectedId === s.id
                        ? "bg-[var(--c-surface-2)]"
                        : "hover:bg-[var(--c-surface-2)]"
                    )}
                  >
                    <Avatar
                      name={(s.nombre ?? s.email).slice(0, 2).toUpperCase()}
                      size="sm"
                      className="shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-[var(--c-text)]">
                        {s.email}
                      </p>
                      <p className="truncate text-xs text-[var(--c-text-muted)]">
                        {s.nombre ?? "Sin nombre"}
                      </p>
                    </div>
                    <ChipStatus
                      status={s.confirmed ? "success" : "neutral"}
                      label={s.confirmed ? "OK" : "Pendiente"}
                    />
                  </li>
                ))}
              </ul>
            )}
          </InfoCard>
        }
        right={
          selected ? (
            <InfoCard title="Detalle del suscriptor">
              <div className="flex items-center gap-4">
                <Avatar
                  name={(selected.nombre ?? selected.email).slice(0, 2).toUpperCase()}
                  size="lg"
                />
                <div>
                  <p className="text-sm font-semibold text-[var(--c-text)]">
                    {selected.nombre ?? "Sin nombre"}
                  </p>
                  <p className="text-[13px] text-[var(--c-text-muted)]">
                    {selected.email}
                  </p>
                </div>
              </div>

              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-[var(--c-border)] pt-4">
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-[var(--c-text-subtle)]">
                    Estado
                  </dt>
                  <dd className="mt-1">
                    <ChipStatus
                      status={selected.confirmed ? "success" : "warning"}
                      label={selected.confirmed ? "Confirmado" : "Pendiente"}
                    />
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-[var(--c-text-subtle)]">
                    Suscrito
                  </dt>
                  <dd className="mt-1 text-[13px] text-[var(--c-text)]">
                    {new Date(selected.created_at).toLocaleDateString("es-MX", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </dd>
                </div>
              </dl>
            </InfoCard>
          ) : (
            <InfoCard>
              <EmptyState
                icon={User}
                title="Selecciona un suscriptor"
                description="Elige uno de la lista para ver su detalle."
              />
            </InfoCard>
          )
        }
      />
    </>
  )
}
