"use client"
import { useEffect, useMemo, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Heart, Clock, BookOpen, LayoutGrid, AlignJustify, ChevronLeft, ChevronRight, Plus, Eye, X, Loader2, Trash2 } from "lucide-react"
import { cn } from "@cerebros/lib"
import type { CalendarEvent } from "./page"

interface Post {
  id?: string
  slug: string
  title: string
  date: string
  likes: number
  views?: number
  status?: "draft" | "published" | "archived"
  excerpt?: string
  readingTime?: number
  category?: string
}

type SortKey = "likes" | "date" | "title"
type ViewMode = "grid" | "table"
type PeriodKey = "semana" | "mes" | "trim"
type Plataforma = "instagram" | "youtube" | "blog" | "newsletter"
type Estado = "borrador" | "listo" | "publicado"

const PLATAFORMAS: { key: Plataforma; label: string; color: string }[] = [
  { key: "instagram", label: "· IG ·", color: "#E1306C" },
  { key: "youtube",   label: "· YT ·", color: "#FF0000" },
  { key: "blog",      label: "· BLOG ·", color: "#6366f1" },
  { key: "newsletter",label: "· NL ·", color: "#14b8a6" },
]

const ESTADO_CONFIG: Record<Estado, { label: string; cls: string }> = {
  borrador:   { label: "Borrador",   cls: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
  listo:      { label: "Listo",      cls: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  publicado:  { label: "Publicado",  cls: "bg-teal-500/10 text-teal-500 border-teal-500/20" },
}

function getWeekDates(weekOffset = 0) {
  const today = new Date()
  const dow = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dow + 6) % 7) + weekOffset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const iso = d.toISOString().slice(0, 10)
    return {
      label: ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"][i],
      day: d.getDate(),
      month: d.toLocaleDateString("es-MX", { month: "short" }).toUpperCase(),
      isToday: d.toDateString() === today.toDateString(),
      iso,
    }
  })
}

function daysSince(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "hoy"
  if (days === 1) return "hace 1 día"
  return `hace ${days} días`
}

function slugToCategory(slug: string): string {
  return slug.split("-")[0]?.toUpperCase() ?? "BLOG"
}

interface Props {
  posts: Post[]
  totalLikes: number
  totalViews?: number
  streak: number
  topPost?: Post
  calendarEvents: CalendarEvent[]
  draftsCount?: number
}

export function ContenidoClient({ posts, totalLikes, totalViews = 0, streak, topPost, calendarEvents: initialEvents, draftsCount = 0 }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sort, setSort] = useState<SortKey>("likes")
  const [view, setView] = useState<ViewMode>("grid")
  const [period, setPeriod] = useState<PeriodKey>("mes")
  const [weekOffset, setWeekOffset] = useState(0)
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)

  // Modal state
  const [modal, setModal] = useState<{
    open: boolean
    fecha: string
    plataforma: Plataforma
  }>({ open: false, fecha: "", plataforma: "instagram" })
  const [titulo, setTitulo] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [estado, setEstado] = useState<Estado>("borrador")
  const [saving, setSaving] = useState(false)
  const [creatingPost, setCreatingPost] = useState(false)

  const handleNewBlogPost = useCallback(async () => {
    setCreatingPost(true)
    try {
      const res = await fetch("/api/blog/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const json = await res.json()
      if (res.ok && json.id) {
        router.push(`/blog/editor/${json.id}`)
      }
    } finally {
      setCreatingPost(false)
    }
  }, [router])

  const weekDates = getWeekDates(weekOffset)
  const weekLabel = `semana del ${weekDates[0].day} al ${weekDates[6].day} ${weekDates[6].month.toLowerCase()}`

  const sorted = useMemo(() => {
    return [...posts].sort((a, b) => {
      if (sort === "likes") return b.likes - a.likes
      if (sort === "date") return +new Date(b.date) - +new Date(a.date)
      return a.title.localeCompare(b.title)
    })
  }, [posts, sort])

  function openModal(fecha: string, plataforma: Plataforma) {
    setTitulo("")
    setDescripcion("")
    setEstado("borrador")
    setModal({ open: true, fecha, plataforma })
  }

  useEffect(() => {
    const isNew = searchParams.get("new") === "1"
    const platformParam = searchParams.get("platform") as Plataforma | null
    if (!isNew) return
    const validPlatforms: Plataforma[] = ["instagram", "youtube", "blog", "newsletter"]
    const platform = platformParam && validPlatforms.includes(platformParam) ? platformParam : "instagram"
    queueMicrotask(() => openModal(new Date().toISOString().slice(0, 10), platform))
    router.replace("/contenido")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSave = useCallback(async () => {
    if (!titulo.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/contenido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha: modal.fecha,
          plataforma: modal.plataforma,
          titulo: titulo.trim(),
          descripcion: descripcion.trim() || undefined,
          estado,
        }),
      })
      if (res.ok) {
        const newEvent = await res.json()
        setEvents((prev) => [...prev, newEvent])
        setModal({ open: false, fecha: "", plataforma: "instagram" })
      }
    } finally {
      setSaving(false)
    }
  }, [modal, titulo, descripcion, estado])

  const handleDelete = useCallback(async (id: string) => {
    await fetch(`/api/contenido?id=${id}`, { method: "DELETE" })
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }, [])

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[var(--c-border)] px-8 py-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">
            · CONTENIDO · {new Date().toLocaleDateString("es-MX", { month: "long", year: "numeric" }).toUpperCase()} ·
          </p>
          <h1 className="mt-1 text-[40px] font-bold leading-none tracking-tight text-[var(--c-text)]">
            {streak > 0 ? (
              <>{streak} días publicando{" "}<span className="text-[var(--c-text-muted)]">seguido.</span></>
            ) : (
              <>{posts.length} artículos{" "}<span className="text-[var(--c-text-muted)]">publicados.</span></>
            )}
          </h1>
          <p className="mt-2 text-[13px] text-[var(--c-text-muted)]">
            {posts.length} posts · {totalViews.toLocaleString("es-MX")} lecturas · {totalLikes.toLocaleString("es-MX")} likes · {events.length} eventos programados
            {draftsCount > 0 && (
              <>
                {" · "}
                <a href="/blog" className="underline hover:text-[var(--c-text)] transition-colors">
                  {draftsCount} borrador{draftsCount === 1 ? "" : "es"} en Blog →
                </a>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex rounded-full border border-[var(--c-border)] bg-[var(--c-surface-2)] overflow-hidden">
            {(["semana", "mes", "trim"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-4 py-2 text-[11px] font-medium uppercase tracking-wide transition-colors",
                  period === p ? "bg-[var(--c-invert)] text-[var(--c-invert-fg)]" : "text-[var(--c-text-muted)] hover:text-[var(--c-text)]"
                )}
              >
                {p === "trim" ? "TRIM." : p.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            onClick={() => openModal(new Date().toISOString().slice(0, 10), "instagram")}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full border border-[var(--c-border)] bg-[var(--c-surface-2)] text-[12px] font-medium text-[var(--c-text-muted)] hover:bg-[var(--c-surface-3)] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Evento en calendario
          </button>
          <button
            onClick={handleNewBlogPost}
            disabled={creatingPost}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[var(--c-invert)] text-[var(--c-invert-fg)] text-[12px] font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {creatingPost ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BookOpen className="h-3.5 w-3.5" />}
            Nuevo post
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6 p-8">
        {/* Hero post */}
        {topPost && (
          <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-2)] overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              <div className="relative flex h-48 w-full shrink-0 items-end bg-gradient-to-br from-[#1e1040] to-[#0d0820] sm:h-auto sm:w-[340px]">
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[96px] font-bold leading-none text-white/20 select-none">
                  {topPost.likes}
                </span>
                <p className="relative px-5 py-4 font-mono text-[10px] uppercase tracking-widest text-white/40">
                  · BLOG · TOP POST ·
                </p>
              </div>
              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <span className="inline-block rounded-full border border-[var(--c-border)] bg-[var(--c-surface-3)] px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-[var(--c-text-muted)]">
                    PUBLICADO {daysSince(topPost.date).toUpperCase()}
                  </span>
                  <h2 className="mt-3 text-[28px] font-bold leading-tight text-[var(--c-text)]">
                    {topPost.title.split(":")[0]}
                    {topPost.title.includes(":") && (
                      <><span className="text-[var(--c-text)]">:</span><span className="text-[var(--c-text-muted)]"> {topPost.title.split(":").slice(1).join(":").trim()}</span></>
                    )}
                  </h2>
                  {topPost.excerpt && (
                    <p className="mt-3 text-[13px] leading-relaxed text-[var(--c-text-muted)] line-clamp-3">{topPost.excerpt}</p>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-5 border-t border-[var(--c-border)] pt-4 text-[11px] text-[var(--c-text-muted)]">
                  <span className="flex items-center gap-1.5"><Heart className="h-3.5 w-3.5" />{topPost.likes}</span>
                  <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" />{(topPost.views ?? 0).toLocaleString("es-MX")}</span>
                  {topPost.readingTime && <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{topPost.readingTime} MIN</span>}
                  <div className="ml-auto flex items-center gap-3">
                    {topPost.id && (
                      <a href={`/blog/editor/${topPost.id}`} className="hover:text-[var(--c-text)] transition-colors">Editar →</a>
                    )}
                    <a href={`/blog/${topPost.slug}`} target="_blank" rel="noopener" className="hover:text-[var(--c-text)] transition-colors">Ver post →</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Editorial calendar */}
        <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-2)] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--c-border)]">
            <p className="text-[15px] font-semibold text-[var(--c-text)]">
              Calendario editorial{" "}
              <span className="font-normal text-[var(--c-text-muted)]">· {weekLabel}</span>
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setWeekOffset((o) => o - 1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--c-border)] bg-[var(--c-surface-3)] hover:bg-[var(--c-surface-2)] transition-colors">
                <ChevronLeft className="h-4 w-4 text-[var(--c-text-muted)]" />
              </button>
              <button onClick={() => setWeekOffset(0)} className="px-3 h-8 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface-3)] text-[11px] text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)] transition-colors">
                Hoy
              </button>
              <button onClick={() => setWeekOffset((o) => o + 1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--c-border)] bg-[var(--c-surface-3)] hover:bg-[var(--c-surface-2)] transition-colors">
                <ChevronRight className="h-4 w-4 text-[var(--c-text-muted)]" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-24 px-4 py-3 text-left" />
                  {weekDates.map((d) => (
                    <th key={d.label} className="min-w-[120px] px-2 py-3 text-center">
                      <span className={cn("font-mono text-[10px] uppercase tracking-widest", d.isToday ? "text-[var(--c-text)]" : "text-[var(--c-text-faint)]")}>
                        · {d.label} {d.day} {d.isToday ? "· HOY" : "·"}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PLATAFORMAS.map((plat) => (
                  <tr key={plat.key} className="border-t border-[var(--c-border)]">
                    <td className="px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">
                      {plat.label}
                    </td>
                    {weekDates.map((d) => {
                      const dayEvents = events.filter(
                        (e) => e.fecha === d.iso && e.plataforma === plat.key
                      )
                      return (
                        <td key={d.label} className="px-2 py-3 align-top">
                          <div className="group flex flex-col gap-1.5">
                            {dayEvents.map((ev) => (
                              <div
                                key={ev.id}
                                className="group relative rounded-lg border px-2.5 py-2"
                                style={{ borderColor: `${plat.color}30`, background: `${plat.color}08` }}
                              >
                                <p className="font-mono text-[9px] uppercase tracking-wider" style={{ color: plat.color }}>
                                  {ESTADO_CONFIG[ev.estado].label}
                                </p>
                                <p className="mt-0.5 text-[11px] font-medium text-[var(--c-text)] line-clamp-2">{ev.titulo}</p>
                                <button
                                  onClick={() => handleDelete(ev.id)}
                                  className="absolute right-1.5 top-1.5 hidden h-5 w-5 items-center justify-center rounded text-[var(--c-text-faint)] hover:text-red-500 group-hover:flex transition-colors"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => openModal(d.iso, plat.key)}
                              className="flex h-7 w-full items-center justify-center rounded-lg border border-dashed border-[var(--c-border)] text-[var(--c-text-faint)] opacity-0 hover:opacity-100 hover:border-[var(--c-text-subtle)] hover:text-[var(--c-text-muted)] transition-all group-hover:opacity-100"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Library */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[22px] font-bold text-[var(--c-text)]">
              Biblioteca{" "}
              <span className="font-normal text-[var(--c-text-muted)]">de todo lo publicado</span>
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex rounded-full border border-[var(--c-border)] bg-[var(--c-surface-2)] overflow-hidden">
                {(["likes", "date", "title"] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setSort(k)}
                    className={cn(
                      "px-4 py-2 text-[11px] font-medium uppercase tracking-wide transition-colors",
                      sort === k ? "bg-[var(--c-invert)] text-[var(--c-invert-fg)]" : "text-[var(--c-text-muted)] hover:text-[var(--c-text)]"
                    )}
                  >
                    {k === "likes" ? "MÁS LIKES" : k === "date" ? "RECIENTE" : "A-Z"}
                  </button>
                ))}
              </div>
              <div className="flex rounded-lg border border-[var(--c-border)] bg-[var(--c-surface-2)] overflow-hidden">
                <button onClick={() => setView("grid")} className={cn("flex h-9 w-9 items-center justify-center transition-colors", view === "grid" ? "bg-[var(--c-invert)] text-[var(--c-invert-fg)]" : "text-[var(--c-text-muted)]")}>
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button onClick={() => setView("table")} className={cn("flex h-9 w-9 items-center justify-center transition-colors", view === "table" ? "bg-[var(--c-invert)] text-[var(--c-invert-fg)]" : "text-[var(--c-text-muted)]")}>
                  <AlignJustify className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-2)] p-12 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-[var(--c-text-faint)]" />
              <p className="mt-3 text-[13px] text-[var(--c-text-muted)]">No hay posts disponibles</p>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sorted.map((p) => {
                const editHref = p.id ? `/blog/editor/${p.id}` : `/blog/${p.slug}`
                return (
                <a
                  key={p.slug}
                  href={editHref}
                  className="group flex flex-col rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-5 hover:border-[var(--c-border-strong,#52525b)] transition-colors"
                >
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">
                    · {slugToCategory(p.slug)} · BLOG ·
                  </p>
                  <h3 className="mt-2 text-[15px] font-bold leading-snug text-[var(--c-text)] line-clamp-3">
                    {p.title.includes(":") ? (
                      <>{p.title.split(":")[0]}<span className="text-[var(--c-text)]">:</span><span className="text-[var(--c-text-muted)]"> {p.title.split(":").slice(1).join(":").trim()}</span></>
                    ) : p.title}
                  </h3>
                  {p.excerpt && <p className="mt-2 text-[12px] leading-relaxed text-[var(--c-text-muted)] line-clamp-2">{p.excerpt}</p>}
                  <div className="mt-auto flex items-center gap-4 border-t border-[var(--c-border)] pt-3 mt-4 text-[11px] text-[var(--c-text-muted)]">
                    <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{p.likes}</span>
                    <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{(p.views ?? 0).toLocaleString("es-MX")}</span>
                    {p.readingTime && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{p.readingTime} MIN</span>}
                    <span className="ml-auto">{new Date(p.date).toLocaleDateString("es-MX", { day: "2-digit", month: "short" }).toUpperCase()}</span>
                  </div>
                </a>
              )})}
            </div>
          ) : (
            <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-2)] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--c-border)]">
                    <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-[var(--c-text-subtle)]">Título</th>
                    <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-[var(--c-text-subtle)]">Fecha</th>
                    <th className="px-5 py-3 text-right text-[10px] uppercase tracking-wider text-[var(--c-text-subtle)]">Lecturas</th>
                    <th className="px-5 py-3 text-right text-[10px] uppercase tracking-wider text-[var(--c-text-subtle)]">Likes</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((p) => (
                    <tr key={p.slug} className="border-t border-[var(--c-border)] hover:bg-[var(--c-surface-3)] transition-colors">
                      <td className="px-5 py-3">
                        <a href={p.id ? `/blog/editor/${p.id}` : `/blog/${p.slug}`} className="text-[13px] font-medium text-[var(--c-text)] hover:underline line-clamp-1">{p.title}</a>
                      </td>
                      <td className="px-5 py-3 text-[12px] text-[var(--c-text-muted)]">
                        {new Date(p.date).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[12px] text-[var(--c-text-muted)]">
                          <Eye className="h-3.5 w-3.5" />{(p.views ?? 0).toLocaleString("es-MX")}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[12px] text-[var(--c-text-muted)]">
                          <Heart className="h-3.5 w-3.5" />{p.likes}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal nueva pieza */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal((m) => ({ ...m, open: false }))} />
          <div className="relative w-full max-w-lg rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-8 shadow-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">· NUEVA PIEZA ·</p>
                <h2 className="mt-0.5 text-[22px] font-bold text-[var(--c-text)]">Programar contenido</h2>
              </div>
              <button onClick={() => setModal((m) => ({ ...m, open: false }))} className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--c-border)] text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)] transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Fecha + Plataforma */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--c-text-subtle)]">Fecha</label>
                  <input
                    type="date"
                    value={modal.fecha}
                    onChange={(e) => setModal((m) => ({ ...m, fecha: e.target.value }))}
                    className="w-full rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-3 py-2.5 text-[13px] text-[var(--c-text)] outline-none focus:border-[var(--c-text-subtle)] transition-colors"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--c-text-subtle)]">Plataforma</label>
                  <select
                    value={modal.plataforma}
                    onChange={(e) => setModal((m) => ({ ...m, plataforma: e.target.value as Plataforma }))}
                    className="w-full rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-3 py-2.5 text-[13px] text-[var(--c-text)] outline-none focus:border-[var(--c-text-subtle)] transition-colors"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="blog">Blog</option>
                    <option value="newsletter">Newsletter</option>
                  </select>
                </div>
              </div>

              {/* Título */}
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--c-text-subtle)]">Título</label>
                <input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej. Reel sobre neuroplasticidad..."
                  className="w-full rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-3 text-[14px] text-[var(--c-text)] placeholder:text-[var(--c-text-faint)] outline-none focus:border-[var(--c-text-subtle)] transition-colors"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--c-text-subtle)]">Descripción <span className="normal-case text-[var(--c-text-faint)]">(opcional)</span></label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Notas, referencias, ideas..."
                  rows={3}
                  className="w-full rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-3 text-[13px] text-[var(--c-text)] placeholder:text-[var(--c-text-faint)] outline-none focus:border-[var(--c-text-subtle)] transition-colors resize-none"
                />
              </div>

              {/* Estado */}
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--c-text-subtle)]">Estado</label>
                <div className="flex gap-2">
                  {(["borrador", "listo", "publicado"] as const).map((e) => (
                    <button
                      key={e}
                      onClick={() => setEstado(e)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors",
                        estado === e ? ESTADO_CONFIG[e].cls : "border-[var(--c-border)] text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)]"
                      )}
                    >
                      {ESTADO_CONFIG[e].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[var(--c-border)] pt-4">
                <button onClick={() => setModal((m) => ({ ...m, open: false }))} className="inline-flex h-9 items-center px-4 rounded-full border border-[var(--c-border)] text-[12px] font-medium text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)] transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !titulo.trim() || !modal.fecha}
                  className="inline-flex h-9 items-center gap-1.5 px-5 rounded-full bg-[var(--c-invert)] text-[var(--c-invert-fg)] text-[12px] font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
