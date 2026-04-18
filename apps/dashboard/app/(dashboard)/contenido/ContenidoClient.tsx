"use client"
import { useMemo, useState } from "react"
import { Heart, BookOpen, LayoutGrid, Table as TableIcon, ExternalLink } from "lucide-react"
import { Button } from "@heroui/react"
import { motion } from "framer-motion"
import { FilterBar } from "@/components/ui/FilterBar"
import { EmptyState } from "@/components/ui/EmptyState"
import { InfoCard } from "@/components/ui/InfoCard"
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable"
import { StaggerList } from "@/components/ui/effects/StaggerList"
import { cn } from "@cerebros/lib"

interface Post {
  slug: string
  title: string
  date: string
  likes: number
}

type SortKey = "likes" | "date" | "title"
type ViewMode = "grid" | "table"

export function ContenidoClient({ posts }: { posts: Post[] }) {
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortKey>("likes")
  const [view, setView] = useState<ViewMode>("grid")

  const filtered = useMemo(() => {
    const lower = search.toLowerCase()
    return posts
      .filter(
        (p) =>
          !lower ||
          p.title.toLowerCase().includes(lower) ||
          p.slug.toLowerCase().includes(lower)
      )
      .sort((a, b) => {
        if (sort === "likes") return b.likes - a.likes
        if (sort === "date") return +new Date(b.date) - +new Date(a.date)
        return a.title.localeCompare(b.title)
      })
      .map((p) => ({ ...p, id: p.slug }))
  }, [posts, search, sort])

  if (posts.length === 0) {
    return (
      <InfoCard>
        <EmptyState
          icon={BookOpen}
          title="No hay posts disponibles"
          description="Verifica que apps/web/public/data/content.json existe."
        />
      </InfoCard>
    )
  }

  return (
    <>
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por título..."
      >
        {(["likes", "date", "title"] as const).map((k) => (
          <Button
            key={k}
            size="sm"
            variant={sort === k ? "solid" : "flat"}
            onPress={() => setSort(k)}
            className={cn(
              "h-7 rounded-lg text-[12px]",
              sort === k
                ? "bg-[var(--c-invert)] text-[var(--c-invert-fg)]"
                : "bg-[var(--c-surface-2)] text-[var(--c-text-muted)]"
            )}
          >
            {k === "likes" ? "Más likes" : k === "date" ? "Más reciente" : "A-Z"}
          </Button>
        ))}
        <div className="ml-auto flex gap-1 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface-2)] p-0.5">
          <Button
            size="sm"
            isIconOnly
            variant={view === "grid" ? "solid" : "light"}
            onPress={() => setView("grid")}
            className="h-6 min-w-6"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            isIconOnly
            variant={view === "table" ? "solid" : "light"}
            onPress={() => setView("table")}
            className="h-6 min-w-6"
          >
            <TableIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </FilterBar>

      {view === "grid" ? (
        <StaggerList className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <motion.a
              key={p.slug}
              href={`/blog/${p.slug}`}
              target="_blank"
              rel="noopener"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="group block rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:border-[var(--c-border-strong)]"
            >
              <div className="flex items-start justify-between">
                <BookOpen className="h-4 w-4 text-[var(--c-text-muted)]" />
                <ExternalLink className="h-3.5 w-3.5 text-[var(--c-text-subtle)] opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="mt-3 line-clamp-2 text-[13px] font-medium text-[var(--c-text)]">
                {p.title}
              </p>
              <p className="mt-1 text-[11px] text-[var(--c-text-muted)]">
                /blog/{p.slug}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[11px] text-[var(--c-text-muted)]">
                  {new Date(p.date).toLocaleDateString("es-MX", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
                <span className="flex items-center gap-1 text-[12px] font-medium text-[var(--c-text-muted)]">
                  <Heart className="h-3.5 w-3.5" />
                  {p.likes}
                </span>
              </div>
            </motion.a>
          ))}
        </StaggerList>
      ) : (
        <InfoCard padded={false}>
          <DataTable
            columns={
              [
                {
                  key: "title",
                  label: "Título",
                  render: (p) => (
                    <div>
                      <p className="text-[13px] font-medium text-[var(--c-text)]">
                        {p.title}
                      </p>
                      <p className="text-[11px] text-[var(--c-text-muted)]">
                        /blog/{p.slug}
                      </p>
                    </div>
                  ),
                },
                {
                  key: "date",
                  label: "Fecha",
                  render: (p) =>
                    new Date(p.date).toLocaleDateString("es-MX", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }),
                },
                {
                  key: "likes",
                  label: "Likes",
                  align: "end",
                  render: (p) => (
                    <span className="inline-flex items-center gap-1 text-[var(--c-text-muted)]">
                      <Heart className="h-3.5 w-3.5" />
                      {p.likes}
                    </span>
                  ),
                },
              ] as DataTableColumn<Post & { id: string }>[]
            }
            data={filtered}
            emptyState={{
              icon: BookOpen,
              title: "Sin resultados",
              description: "Intenta con otra búsqueda.",
            }}
          />
        </InfoCard>
      )}
    </>
  )
}
