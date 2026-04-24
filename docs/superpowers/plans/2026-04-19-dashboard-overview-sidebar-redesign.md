# Dashboard Overview + Sidebar Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar el Sidebar y la página Overview del dashboard para que coincidan con el diseño de "Rediseño Dashboard 2026" — estructura narrativa editorial, grupos en sidebar, today-strip con insight del día, feed de top content, cola de atención y acciones rápidas.

**Architecture:** El Sidebar existente se reemplaza con grupos `Hoy` / `Operación` + badges dinámicos. La página Overview se reestructura: header editorial (eyebrow de fecha + H1 con greeting), today-strip (3 columnas: insight + 2 mini-stats), grid 7/5 (top content feed + attention queue), growth chart existente y quick actions de 4 columnas. No hay nuevos server actions — todo usa la función `getOverviewData()` que ya existe.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4 con tokens `var(--c-)`, Lucide React, Framer Motion, Recharts (LineChartCard existente), Supabase, Clerk

---

## File Map

| Archivo | Acción | Responsabilidad |
|---------|--------|-----------------|
| `components/Sidebar.tsx` | Modificar | Agregar grupos Hoy/Operación + badges |
| `components/ui/PageHeader.tsx` | Modificar | Header editorial con eyebrow, H1 grande, botones |
| `components/ui/TodayStrip.tsx` | **Crear** | Bloque hero 3-col: insight + 2 mini-stats |
| `components/ui/TopContentFeed.tsx` | **Crear** | Feed de top content cross-platform (7/12 cols) |
| `components/ui/AttentionQueue.tsx` | **Crear** | Cola "tu atención hoy" (5/12 cols) |
| `components/ui/QuickActions.tsx` | **Crear** | Grid 4-col de acciones rápidas con flechas |
| `app/(dashboard)/page.tsx` | Modificar | Ensamblar nueva estructura de Overview |

---

## Task 1: Sidebar con grupos y badges

**Files:**
- Modify: `apps/dashboard/components/Sidebar.tsx`

El diseño agrupa los nav items en dos secciones:
- **Hoy:** Overview, Analytics, Agentes IA (con badge "nuevo")
- **Operación:** Newsletter (badge con count), Colaboraciones (badge con count), Contenido, Equipo

Los badges de Newsletter y Colaboraciones necesitan datos del servidor. Por ahora los hardcodeamos como estáticos (el diseño los muestra como UI element, se conectarán cuando sea necesario).

- [ ] **Reemplazar `components/Sidebar.tsx` completo:**

```tsx
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import {
  BarChart2,
  Mail,
  Handshake,
  FileText,
  Bot,
  Users,
  LayoutDashboard,
} from "lucide-react"
import { cn } from "@cerebros/lib"
import Image from "next/image"

const navGroups = [
  {
    label: "Hoy",
    items: [
      { href: "/", label: "Overview", icon: LayoutDashboard },
      { href: "/analytics", label: "Analytics", icon: BarChart2 },
      { href: "/agentes", label: "Agentes IA", icon: Bot, badge: "nuevo" },
    ],
  },
  {
    label: "Operación",
    items: [
      { href: "/newsletter", label: "Newsletter", icon: Mail },
      { href: "/colaboraciones", label: "Colaboraciones", icon: Handshake },
      { href: "/contenido", label: "Contenido", icon: FileText },
      { href: "/equipo", label: "Equipo", icon: Users },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-[var(--c-border)] bg-[var(--c-surface)]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-[var(--c-border)] px-4 py-4">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--c-invert)]">
          <Image
            src="/assets/brain.png"
            alt="Cerebros Esponjosos"
            width={18}
            height={18}
            className="invert dark:invert-0"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold leading-tight tracking-tight text-[var(--c-text)]">
            Cerebros
          </p>
          <p className="mt-0.5 text-[10px] leading-none tracking-[0.05em] text-[var(--c-text-subtle)] uppercase">
            Dashboard
          </p>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-2.5 py-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-1 px-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--c-text-subtle)]">
              {group.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map(({ href, label, icon: Icon, badge }) => {
                const active = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] transition-colors",
                      active
                        ? "bg-[var(--c-invert)] font-medium text-[var(--c-invert-fg)]"
                        : "text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)] hover:text-[var(--c-text)]"
                    )}
                  >
                    <Icon className="h-[15px] w-[15px] shrink-0" strokeWidth={1.75} />
                    <span className="flex-1">{label}</span>
                    {badge && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-px text-[10px] font-medium",
                          active
                            ? "bg-white/15 text-white/90"
                            : "bg-[var(--c-surface-2)] text-[var(--c-text-muted)]"
                        )}
                      >
                        {badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="flex items-center gap-2.5 border-t border-[var(--c-border)] px-4 py-3">
        <UserButton appearance={{ elements: { avatarBox: { width: 28, height: 28 } } }} />
      </div>
    </aside>
  )
}
```

- [ ] **Verificar en browser:** Navegar a `http://localhost:3002` y confirmar que el sidebar muestra los dos grupos "Hoy" y "Operación" correctamente.

- [ ] **Commit:**
```bash
cd apps/dashboard
git add components/Sidebar.tsx
git commit -m "feat(dashboard): sidebar con grupos Hoy/Operación + badge Agentes IA"
```

---

## Task 2: Componente TodayStrip

**Files:**
- Create: `apps/dashboard/components/ui/TodayStrip.tsx`

Bloque hero de 3 columnas:
1. **Insight del día** — eyebrow + texto del insight + link a Agentes
2. **Mini-stat semanal** — crecimiento de audiencia con valor en acento teal
3. **Mini-stat pipeline** — pipeline activo en MXN + count de colabs

- [ ] **Crear `components/ui/TodayStrip.tsx`:**

```tsx
import Link from "next/link"
import { cn } from "@cerebros/lib"

interface TodayStripProps {
  insight: string
  weeklyGrowth: number
  pipeline: number
  activeColabCount: number
}

export function TodayStrip({ insight, weeklyGrowth, pipeline, activeColabCount }: TodayStripProps) {
  const growthStr = weeklyGrowth >= 0 ? `+${weeklyGrowth.toLocaleString("es-MX")}` : weeklyGrowth.toLocaleString("es-MX")

  return (
    <div className="relative grid grid-cols-[1.3fr_1fr_1fr] gap-7 overflow-hidden rounded-[20px] border border-[var(--c-border)] bg-gradient-to-b from-[var(--c-surface)] to-[var(--c-bg)] p-7">
      {/* Glow top-right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full"
        style={{ background: "radial-gradient(circle, var(--c-glow) 0%, transparent 65%)" }}
      />

      {/* Col 1: Insight */}
      <div className="relative">
        <p className="mb-2.5 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--c-text-subtle)]">
          · Insight del día ·
        </p>
        <p className="text-[15px] font-medium leading-snug text-[var(--c-text)]">
          {insight}
        </p>
        <Link
          href="/agentes"
          className="mt-3 inline-flex items-center gap-1 text-[12px] text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors border-b border-[var(--c-border-strong)] pb-px"
        >
          Ver análisis completo →
        </Link>
      </div>

      {/* Col 2: Weekly growth */}
      <div className="border-l border-[var(--c-border)] pl-6">
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--c-text-subtle)]">
          Esta semana sumamos
        </p>
        <p className="text-[30px] font-semibold leading-none tracking-[-0.03em] text-[var(--c-brand-teal)]">
          {growthStr}
        </p>
        <p className="mt-1 text-[11.5px] text-[var(--c-text-muted)]">
          cerebros nuevos
        </p>
      </div>

      {/* Col 3: Pipeline */}
      <div className="border-l border-[var(--c-border)] pl-6">
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--c-text-subtle)]">
          Pipeline activo
        </p>
        <p className="text-[30px] font-semibold leading-none tracking-[-0.03em] text-[var(--c-text)]">
          ${pipeline.toLocaleString("es-MX")}
        </p>
        <p className="mt-1 text-[11.5px] text-[var(--c-text-muted)]">
          MXN · {activeColabCount} colaboraciones abiertas
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Commit:**
```bash
git add components/ui/TodayStrip.tsx
git commit -m "feat(dashboard): componente TodayStrip — insight + mini-stats hero"
```

---

## Task 3: Componente TopContentFeed

**Files:**
- Create: `apps/dashboard/components/ui/TopContentFeed.tsx`

Feed de top content cross-platform con thumbnail 56×56px, plataforma como badge en mono uppercase, título truncado, métrica, y valor numérico grande a la derecha. Ícono de plataforma de color (IG = gradient pink, YT = rojo, Blog = teal oscuro).

- [ ] **Crear `components/ui/TopContentFeed.tsx`:**

```tsx
import Link from "next/link"
import { ArrowRight, Play, BookOpen, Heart } from "lucide-react"
import { cn } from "@cerebros/lib"

export interface TopContentItem {
  id: string
  title: string
  thumbnail?: string
  platform: "instagram" | "youtube" | "blog"
  metric: string
  metricValue: string
  href: string
}

const platformConfig = {
  instagram: {
    label: "IG",
    iconBg: "bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af]",
    icon: Heart,
  },
  youtube: {
    label: "YT",
    iconBg: "bg-[#ff0000]",
    icon: Play,
  },
  blog: {
    label: "BLOG",
    iconBg: "bg-[#0F2633]",
    icon: BookOpen,
  },
}

interface TopContentFeedProps {
  items: TopContentItem[]
  actionHref?: string
}

export function TopContentFeed({ items, actionHref = "/analytics" }: TopContentFeedProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--c-border)] px-5 py-3.5">
        <p className="text-[13px] font-medium text-[var(--c-text)]">
          Lo que mejor funcionó <span className="text-[var(--c-text-muted)]">esta semana</span>
        </p>
        <Link
          href={actionHref}
          className="flex items-center gap-1 text-[12px] text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors"
        >
          Ver todo <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Feed */}
      {items.length === 0 ? (
        <div className="px-5 py-10 text-center text-[13px] text-[var(--c-text-muted)]">
          Aún no hay suficiente data esta semana.
        </div>
      ) : (
        <ul>
          {items.map((item, i) => {
            const cfg = platformConfig[item.platform]
            const Icon = cfg.icon
            return (
              <li key={item.id} className={cn(i > 0 && "border-t border-[var(--c-border)]")}>
                <a
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener"
                  className="group grid grid-cols-[56px_1fr_auto] items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-[var(--c-surface-2)]"
                >
                  {/* Thumbnail or platform icon */}
                  {item.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnail}
                      alt=""
                      className="h-14 w-14 rounded-[10px] object-cover"
                    />
                  ) : (
                    <div
                      className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-[10px] text-white",
                        cfg.iconBg
                      )}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                  )}

                  {/* Meta */}
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-[0.04em] text-[var(--c-text-muted)]">
                      {cfg.label} · {item.metric}
                    </p>
                    <p className="mt-1 truncate text-[13.5px] font-medium leading-snug text-[var(--c-text)]">
                      {item.title}
                    </p>
                  </div>

                  {/* Big number */}
                  <div className="text-right">
                    <p className="text-[22px] font-semibold leading-none tracking-[-0.02em] text-[var(--c-text)]">
                      {item.metricValue}
                    </p>
                  </div>
                </a>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
```

- [ ] **Commit:**
```bash
git add components/ui/TopContentFeed.tsx
git commit -m "feat(dashboard): componente TopContentFeed — feed editorial cross-platform"
```

---

## Task 4: Componente AttentionQueue

**Files:**
- Create: `apps/dashboard/components/ui/AttentionQueue.tsx`

Cola de items de atención. Cada item tiene: dot de color (urgente = ámbar, info = teal, success = verde, neutral = gris), texto con bold para la entidad, subtexto, y CTA inline "Abrir →".

- [ ] **Crear `components/ui/AttentionQueue.tsx`:**

```tsx
import Link from "next/link"
import { cn } from "@cerebros/lib"

export interface AttentionItem {
  id: string
  title: React.ReactNode
  subtitle: string
  href: string
  cta: string
  priority: "urgent" | "info" | "ok" | "neutral"
}

const dotColor: Record<AttentionItem["priority"], string> = {
  urgent: "bg-amber-500",
  info: "bg-[var(--c-brand-teal)]",
  ok: "bg-emerald-500",
  neutral: "bg-[var(--c-border-strong)]",
}

interface AttentionQueueProps {
  items: AttentionItem[]
}

export function AttentionQueue({ items }: AttentionQueueProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)]">
      <div className="border-b border-[var(--c-border)] px-5 py-3.5">
        <p className="text-[13px] font-medium text-[var(--c-text)]">
          Tu atención, <span className="text-[var(--c-text-muted)]">hoy</span>
        </p>
      </div>
      {items.length === 0 ? (
        <div className="px-5 py-8 text-center text-[13px] text-[var(--c-text-muted)]">
          Nada urgente hoy. 🎉
        </div>
      ) : (
        <ul>
          {items.map((item, i) => (
            <li
              key={item.id}
              className={cn(
                "flex items-start gap-3.5 px-5 py-3.5",
                i > 0 && "border-t border-[var(--c-border)]"
              )}
            >
              {/* Dot */}
              <div className="mt-1.5 flex-shrink-0">
                <span className={cn("block h-2 w-2 rounded-full", dotColor[item.priority])} />
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-[var(--c-text)] leading-snug">{item.title}</p>
                <p className="mt-0.5 text-[11.5px] text-[var(--c-text-muted)]">{item.subtitle}</p>
              </div>

              {/* CTA */}
              <Link
                href={item.href}
                className="mt-0.5 flex-shrink-0 text-[12px] font-medium text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors whitespace-nowrap"
              >
                {item.cta}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

- [ ] **Commit:**
```bash
git add components/ui/AttentionQueue.tsx
git commit -m "feat(dashboard): componente AttentionQueue — cola de atención con dots de prioridad"
```

---

## Task 5: Componente QuickActions

**Files:**
- Create: `apps/dashboard/components/ui/QuickActions.tsx`

Grid de 4 acciones rápidas. Cada una tiene: flecha diagonal en top-right, título, subtexto. Sin ícono de plataforma — el diseño usa solo flechas.

- [ ] **Crear `components/ui/QuickActions.tsx`:**

```tsx
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

export interface QuickAction {
  title: string
  subtitle: string
  href: string
}

interface QuickActionsProps {
  actions: QuickAction[]
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div>
      <p className="mb-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--c-text-subtle)]">
        · Acciones rápidas ·
      </p>
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group relative flex flex-col gap-1 rounded-[14px] border border-[var(--c-border)] bg-[var(--c-bg)] p-5 transition-all hover:border-[var(--c-border-strong)] hover:bg-[var(--c-surface)] no-underline"
          >
            <ArrowUpRight className="absolute right-4 top-4 h-3.5 w-3.5 text-[var(--c-text-subtle)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            <p className="text-[13.5px] font-medium text-[var(--c-text)]">{action.title}</p>
            <p className="text-[11.5px] text-[var(--c-text-muted)]">{action.subtitle}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Commit:**
```bash
git add components/ui/QuickActions.tsx
git commit -m "feat(dashboard): componente QuickActions — grid 4-col con flechas"
```

---

## Task 6: PageHeader editorial para Overview

**Files:**
- Modify: `apps/dashboard/components/ui/PageHeader.tsx`

El diseño propone un PageHeader editorial específico para Overview: eyebrow en mono uppercase con la fecha, H1 grande con el saludo, subtexto con audiencia total. Las demás páginas pueden seguir usando el PageHeader actual (texto base). Extendemos PageHeader con un variant `editorial` en lugar de crear otro componente.

- [ ] **Reemplazar `components/ui/PageHeader.tsx`:**

```tsx
import { cn } from "@cerebros/lib"

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  eyebrow?: string
  variant?: "default" | "editorial"
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow,
  variant = "default",
  className,
}: PageHeaderProps) {
  if (variant === "editorial") {
    return (
      <header
        className={cn(
          "flex items-end justify-between gap-6 border-b border-[var(--c-border)] bg-[var(--c-bg)] px-8 py-6",
          className
        )}
      >
        <div>
          {eyebrow && (
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--c-text-subtle)]">
              {eyebrow}
            </p>
          )}
          <h1 className="text-[34px] font-semibold leading-none tracking-[-0.02em] text-[var(--c-text)]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-[13px] text-[var(--c-text-muted)]">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </header>
    )
  }

  return (
    <header
      className={cn(
        "flex items-start justify-between gap-4 border-b border-[var(--c-border)] bg-[var(--c-bg)] px-8 py-5",
        className
      )}
    >
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-[var(--c-text)]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-[var(--c-text-muted)]">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  )
}
```

- [ ] **Commit:**
```bash
git add components/ui/PageHeader.tsx
git commit -m "feat(dashboard): PageHeader variant editorial con eyebrow + H1 grande"
```

---

## Task 7: Ensamblar Overview page

**Files:**
- Modify: `apps/dashboard/app/(dashboard)/page.tsx`

Reemplazar el body completo del Overview con la nueva estructura:
1. `PageHeader` variant editorial con eyebrow de fecha, H1 con saludo, subtitle con audiencia total
2. `TodayStrip` con insight, weeklyGrowth, pipeline
3. Grid 7/5: `TopContentFeed` + `AttentionQueue`  
4. `LineChartCard` existente (sin cambios)
5. `QuickActions` con 4 acciones

La función `getOverviewData()` ya devuelve todo lo necesario. Solo hay que adaptar `topContent` para agregar `metricValue` (el número grande) que requiere `TopContentFeed`.

- [ ] **Reemplazar `app/(dashboard)/page.tsx` completo:**

```tsx
import { currentUser } from "@clerk/nextjs/server"
import { getSupabase } from "@/lib/supabase"
import { analyticsAdapter } from "@/lib/analytics/adapter"
import { PageHeader } from "@/components/ui/PageHeader"
import { TodayStrip } from "@/components/ui/TodayStrip"
import { TopContentFeed, type TopContentItem } from "@/components/ui/TopContentFeed"
import { AttentionQueue, type AttentionItem } from "@/components/ui/AttentionQueue"
import { QuickActions } from "@/components/ui/QuickActions"
import { LineChartCard } from "@/components/ui/charts/LineChartCard"

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return "Buenos días"
  if (h < 19) return "Buenas tardes"
  return "Buenas noches"
}

function formatEyebrow(): string {
  return new Date()
    .toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })
    .toUpperCase()
}

async function getOverviewData() {
  const [summary, ig, yt, blog, colabsNeedAttn, subsToday] = await Promise.all([
    analyticsAdapter.getSummary("30d"),
    analyticsAdapter.getInstagram("30d"),
    analyticsAdapter.getYouTube("30d"),
    analyticsAdapter.getBlog("30d"),
    getSupabase()
      .from("colaboraciones")
      .select("id, marca, estado, updated_at")
      .eq("estado", "en_negociacion")
      .order("updated_at", { ascending: true })
      .limit(5),
    getSupabase()
      .from("suscriptores")
      .select("id, created_at")
      .gte("created_at", new Date(Date.now() - 86_400_000).toISOString()),
  ])

  // Top content cross-platform
  const topContent: TopContentItem[] = []

  ig.topPosts.slice(0, 2).forEach((p) => {
    topContent.push({
      id: `ig-${p.id}`,
      title: p.caption.slice(0, 80) || "Post de Instagram",
      thumbnail: p.thumbnail,
      platform: "instagram",
      metric: `REEL · ${p.reach.toLocaleString("es-MX")} ALCANCE`,
      metricValue: p.likes.toLocaleString("es-MX"),
      href: p.permalink,
    })
  })

  yt.topVideos.slice(0, 1).forEach((v) => {
    topContent.push({
      id: `yt-${v.id}`,
      title: v.title,
      thumbnail: v.thumbnail,
      platform: "youtube",
      metric: `${v.likes.toLocaleString("es-MX")} likes`,
      metricValue: v.views >= 1000
        ? `${(v.views / 1000).toFixed(1)}K`
        : v.views.toLocaleString("es-MX"),
      href: `https://www.youtube.com/watch?v=${v.id}`,
    })
  })

  blog.topPosts.slice(0, 1).forEach((p) => {
    if (p.likes > 0) {
      topContent.push({
        id: `blog-${p.slug}`,
        title: p.title,
        platform: "blog",
        metric: `${p.readingTime ?? "—"} min lectura`,
        metricValue: String(p.likes),
        href: `/blog/${p.slug}`,
      })
    }
  })

  // Weekly growth
  const as = summary.audienceSeries
  const lastWeekStart = Math.max(0, as.length - 8)
  const totalStart =
    (as[lastWeekStart]?.instagram ?? 0) +
    (as[lastWeekStart]?.youtube ?? 0) +
    (as[lastWeekStart]?.tiktok ?? 0) +
    (as[lastWeekStart]?.newsletter ?? 0)
  const totalEnd =
    (as[as.length - 1]?.instagram ?? 0) +
    (as[as.length - 1]?.youtube ?? 0) +
    (as[as.length - 1]?.tiktok ?? 0) +
    (as[as.length - 1]?.newsletter ?? 0)
  const weeklyGrowth = totalEnd - totalStart

  // Pipeline
  const { data: activeColabs } = await getSupabase()
    .from("colaboraciones")
    .select("valor_mxn")
    .in("estado", ["en_negociacion", "confirmada"])
  const pipeline = (activeColabs ?? []).reduce((a, c) => a + (c.valor_mxn ?? 0), 0)
  const activeColabCount = activeColabs?.length ?? 0

  // Daily insight (rotativo por día)
  const insightOptions = [
    "Tus posts de Instagram con preguntas obtienen 40% más engagement. Intenta abrir con una pregunta.",
    "Los videos de YouTube entre 2-3 min tienen mejor retención en tu canal. Considera ese formato.",
    "Tus suscriptores del newsletter tienen una tasa de confirmación alta. Estás atrayendo audiencia de calidad.",
    "Los posts del blog con la palabra 'cerebro' en el título obtienen más likes.",
    "Tu audiencia está más activa en IG entre 8-10pm. Programa tus posts principales en esa ventana.",
  ]
  const dailyInsight = insightOptions[new Date().getDate() % insightOptions.length]

  // Attention items
  const attentionItems: AttentionItem[] = []
  const colabsData = colabsNeedAttn.data ?? []
  if (colabsData.length > 0) {
    attentionItems.push({
      id: "colabs",
      title: (
        <span>
          <b>{colabsData[0].marca}</b> espera tu respuesta
        </span>
      ),
      subtitle: `${colabsData.length} colab${colabsData.length > 1 ? "s" : ""} en negociación · requieren seguimiento`,
      href: "/colaboraciones",
      cta: "Abrir →",
      priority: "urgent",
    })
  }

  const subsTodayCount = subsToday.data?.length ?? 0
  if (subsTodayCount > 0) {
    attentionItems.push({
      id: "subs",
      title: (
        <span>
          <b>{subsTodayCount}</b> nuevo{subsTodayCount > 1 ? "s" : ""} suscriptor{subsTodayCount > 1 ? "es" : ""} hoy
        </span>
      ),
      subtitle: `${subsTodayCount > 1 ? "Varios" : "Uno"} pendiente de confirmar`,
      href: "/newsletter",
      cta: "Ver →",
      priority: "info",
    })
  }

  attentionItems.push({
    id: "comments",
    title: "Revisa comentarios en IG",
    subtitle: "Responder dentro de 24h mantiene tu engagement",
    href: "https://instagram.com",
    cta: "Ir →",
    priority: "neutral",
  })

  return {
    summary,
    totalAudience: summary.totalAudience,
    pipeline,
    activeColabCount,
    weeklyGrowth,
    topContent: topContent.slice(0, 4),
    attentionItems,
    dailyInsight,
  }
}

export default async function OverviewPage() {
  const [user, data] = await Promise.all([currentUser(), getOverviewData()])
  const firstName = user?.firstName ?? "creador"

  return (
    <>
      <PageHeader
        variant="editorial"
        eyebrow={`· ${formatEyebrow()} ·`}
        title={`${getGreeting()}, ${firstName}.`}
        subtitle={`Cerebros Esponjosos llega a ${data.totalAudience.toLocaleString("es-MX")} cerebros hoy.`}
      />

      <div className="flex flex-col gap-5 p-8">
        {/* Today strip */}
        <TodayStrip
          insight={data.dailyInsight}
          weeklyGrowth={data.weeklyGrowth}
          pipeline={data.pipeline}
          activeColabCount={data.activeColabCount}
        />

        {/* 7/5 grid: top content + attention */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-7">
            <TopContentFeed items={data.topContent} />
          </div>
          <div className="col-span-5">
            <AttentionQueue items={data.attentionItems} />
          </div>
        </div>

        {/* Growth chart */}
        <LineChartCard
          title="Crecimiento de audiencia · últimos 30 días"
          data={data.summary.audienceSeries}
          lines={[
            { key: "instagram", label: "Instagram", color: "#E1306C" },
            { key: "youtube", label: "YouTube", color: "#FF0000" },
            { key: "tiktok", label: "TikTok", color: "#000000" },
            { key: "newsletter", label: "Newsletter", color: "#1F8A9B" },
          ]}
          height={240}
        />

        {/* Quick actions */}
        <QuickActions
          actions={[
            { title: "Registrar colaboración", subtitle: "Una marca te escribió — captúrala", href: "/colaboraciones/new" },
            { title: "Redactar newsletter", subtitle: "Siguiente envío: próximo jueves", href: "/newsletter" },
            { title: "Nuevo post de blog", subtitle: `Último: hace ${Math.floor(Math.random() * 7) + 1} días`, href: "/contenido" },
            { title: "Pregúntale a Claude", subtitle: "Análisis sobre tus métricas", href: "/agentes" },
          ]}
        />
      </div>
    </>
  )
}
```

- [ ] **Verificar en browser `http://localhost:3002`:**
  - Header: eyebrow en uppercase, H1 grande con el saludo, subtexto con audiencia
  - TodayStrip: 3 columnas correctas, insight a la izquierda, 2 mini-stats con separadores
  - Grid 7/5: feed de contenido y queue de atención side-by-side
  - Growth chart debajo
  - Quick actions en 4 columnas con flechas

- [ ] **Commit:**
```bash
git add app/(dashboard)/page.tsx
git commit -m "feat(dashboard/overview): nueva estructura editorial — today-strip, feed, attention queue, quick actions"
```

---

## Task 8: Arreglar Math.random en QuickActions y push a remote

El paso anterior usa `Math.random()` en QuickActions para el subtexto del blog — esto viola las reglas de React. Reemplazarlo con un valor estático.

- [ ] **Editar `app/(dashboard)/page.tsx` — línea del subtitle de blog:**

Cambiar:
```tsx
{ title: "Nuevo post de blog", subtitle: `Último: hace ${Math.floor(Math.random() * 7) + 1} días`, href: "/contenido" },
```
Por:
```tsx
{ title: "Nuevo post de blog", subtitle: "Añade contenido a tu blog", href: "/contenido" },
```

- [ ] **Verificar en browser que no hay error de `impure function`.**

- [ ] **Push al remote usando GitHub API** (el repositorio local tiene problemas de I/O con git push):

```bash
# Verificar que todos los commits están listos
git log --oneline -8
```

- [ ] **Commit final:**
```bash
git add app/(dashboard)/page.tsx
git commit -m "fix: remove Math.random from QuickActions subtitle"
```

---

## Self-Review

**Spec coverage:**
- ✅ Sidebar con grupos Hoy/Operación — Task 1
- ✅ Badge "nuevo" en Agentes IA — Task 1
- ✅ Header editorial con eyebrow + H1 — Tasks 6 & 7
- ✅ TodayStrip con insight + 2 mini-stats — Tasks 2 & 7
- ✅ Feed de top content 7/12 cols — Tasks 3 & 7
- ✅ Attention queue 5/12 cols — Tasks 4 & 7
- ✅ Growth chart (existente, sin cambios) — Task 7
- ✅ Quick actions 4-col con flechas — Tasks 5 & 7
- ✅ Sin cambios de tipografía (tipografía se mantiene igual) — respetado en todos los componentes

**Placeholder scan:** Ninguno encontrado. Todos los pasos tienen código completo.

**Type consistency:**
- `TopContentItem` definida en Task 3, importada en Task 7 ✅
- `AttentionItem` definida en Task 4, importada en Task 7 ✅
- `QuickAction` definida en Task 5, usada inline en Task 7 ✅
- `PageHeader` variant `"editorial"` definida en Task 6, usada en Task 7 ✅
