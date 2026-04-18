# Dashboard UX Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevar el dashboard existente con sistema de componentes reutilizables, animaciones balanceadas, y UX repensada página por página, usando HeroUI + animate-ui + reactbits (híbrido).

**Architecture:** Instalación base (HeroUI, framer-motion, recharts, next-themes) + capa de componentes reutilizables en `components/ui/` + rediseño iterativo página por página. Cada página se refactoriza en una task dedicada usando solo componentes del sistema + Tailwind. Cero inline styles custom.

**Tech Stack:** Next.js 15 App Router · Tailwind v4 · HeroUI 2.6 · framer-motion 11 · recharts 2.13 · next-themes 0.4 · animate-ui (copy-paste) · reactbits (copy-paste)

---

## File Map

### Phase 1 — Setup
| File | Action |
|---|---|
| `apps/dashboard/package.json` | Modify (agregar deps) |
| `apps/dashboard/app/layout.tsx` | Modify (HeroUIProvider + ThemeProvider) |
| `apps/dashboard/app/providers.tsx` | Create |
| `apps/dashboard/lib/heroui-theme.ts` | Create |

### Phase 2 — Primitive components
| File | Action |
|---|---|
| `apps/dashboard/components/ui/PageHeader.tsx` | Create |
| `apps/dashboard/components/ui/Section.tsx` | Create |
| `apps/dashboard/components/ui/ChipStatus.tsx` | Create |
| `apps/dashboard/components/ui/EmptyState.tsx` | Create |
| `apps/dashboard/components/ui/LoadingSkeleton.tsx` | Create |
| `apps/dashboard/components/ui/FilterBar.tsx` | Create |
| `apps/dashboard/components/ui/TwoColumnLayout.tsx` | Create |
| `apps/dashboard/components/ui/DataTable.tsx` | Create |
| `apps/dashboard/components/ui/PageTransition.tsx` | Create |

### Phase 3 — Animation wrappers
| File | Action |
|---|---|
| `apps/dashboard/components/ui/effects/FadeIn.tsx` | Create |
| `apps/dashboard/components/ui/effects/StaggerList.tsx` | Create |
| `apps/dashboard/components/ui/effects/ClickSpark.tsx` | Create |
| `apps/dashboard/components/ui/animate/AnimatedNumber.tsx` | Create |

### Phase 4 — Card variants
| File | Action |
|---|---|
| `apps/dashboard/components/ui/StatCard.tsx` | Create |
| `apps/dashboard/components/ui/TrendCard.tsx` | Create |
| `apps/dashboard/components/ui/ActionCard.tsx` | Create |
| `apps/dashboard/components/ui/InfoCard.tsx` | Create |

### Phase 5 — Page redesigns
| File | Action |
|---|---|
| `apps/dashboard/app/(dashboard)/page.tsx` | Rewrite (Overview) |
| `apps/dashboard/app/(dashboard)/analytics/page.tsx` | Rewrite |
| `apps/dashboard/app/(dashboard)/newsletter/page.tsx` | Rewrite |
| `apps/dashboard/app/(dashboard)/colaboraciones/page.tsx` | Rewrite |
| `apps/dashboard/app/(dashboard)/colaboraciones/new/page.tsx` | Rewrite |
| `apps/dashboard/components/NuevaColaboracionClient.tsx` | Rewrite |
| `apps/dashboard/app/(dashboard)/contenido/page.tsx` | Rewrite |
| `apps/dashboard/app/(dashboard)/agentes/page.tsx` | Rewrite |
| `apps/dashboard/components/AgentesClient.tsx` | Rewrite |
| `apps/dashboard/app/(dashboard)/equipo/page.tsx` | Rewrite |
| `apps/dashboard/components/Sidebar.tsx` | Refactor (usar nuevos componentes) |
| `apps/dashboard/components/Header.tsx` | Refactor |
| `apps/dashboard/components/KanbanBoard.tsx` | Refactor |
| `apps/dashboard/components/KanbanCard.tsx` | Refactor |
| `apps/dashboard/components/MetricCard.tsx` | Delete (reemplazado por StatCard) |

### Phase 6 — Verify
| File | Action |
|---|---|
| No file changes | Build + visual verification |

---

## PHASE 1 — Setup

### Task 1: Instalar dependencias

**Files:**
- Modify: `apps/dashboard/package.json`

- [ ] **Step 1: Ejecutar install**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Landing"
npm install --workspace=apps/dashboard @heroui/react@^2.6.0 framer-motion@^11.11.0 next-themes@^0.4.0 recharts@^2.13.0
```

Expected output: `added N packages` sin errores de peer deps.

- [ ] **Step 2: Verificar que `package.json` quedó correcto**

Leer `apps/dashboard/package.json`. Las deps nuevas deben aparecer en el bloque `dependencies`:
```json
"@heroui/react": "^2.6.0",
"framer-motion": "^11.11.0",
"next-themes": "^0.4.0",
"recharts": "^2.13.0"
```

- [ ] **Step 3: Commit**

```bash
git add apps/dashboard/package.json package-lock.json
git commit -m "feat(dashboard): add HeroUI, framer-motion, recharts, next-themes"
```

---

### Task 2: Crear HeroUI theme custom

**Files:**
- Create: `apps/dashboard/lib/heroui-theme.ts`

- [ ] **Step 1: Crear el archivo**

```ts
// apps/dashboard/lib/heroui-theme.ts
import type { ConfigThemes } from "@heroui/react"

export const cerebrosThemes: ConfigThemes = {
  light: {
    colors: {
      background: "#f5f5f5",
      foreground: "#0a0a0b",
      divider: "rgba(0, 0, 0, 0.1)",
      focus: "#0a0a0b",
      content1: "#ffffff",
      content2: "#f0f0f0",
      content3: "#e5e5e5",
      content4: "#d4d4d4",
      default: {
        50: "#fafafa",
        100: "#f5f5f5",
        200: "#e5e5e5",
        300: "#d4d4d4",
        400: "#a3a3a3",
        500: "#71717a",
        600: "#52525b",
        700: "#3f3f46",
        800: "#27272a",
        900: "#18181b",
        DEFAULT: "#f5f5f5",
        foreground: "#0a0a0b",
      },
      primary: {
        DEFAULT: "#0a0a0b",
        foreground: "#ffffff",
      },
    },
  },
  dark: {
    colors: {
      background: "#0a0a0b",
      foreground: "#f4f4f5",
      divider: "rgba(255, 255, 255, 0.08)",
      focus: "#ffffff",
      content1: "rgba(255, 255, 255, 0.04)",
      content2: "rgba(255, 255, 255, 0.07)",
      content3: "rgba(255, 255, 255, 0.1)",
      content4: "rgba(255, 255, 255, 0.14)",
      default: {
        50: "#18181b",
        100: "#27272a",
        200: "#3f3f46",
        300: "#52525b",
        400: "#71717a",
        500: "#a1a1aa",
        600: "#d4d4d8",
        700: "#e4e4e7",
        800: "#f4f4f5",
        900: "#fafafa",
        DEFAULT: "rgba(255, 255, 255, 0.07)",
        foreground: "#f4f4f5",
      },
      primary: {
        DEFAULT: "#ffffff",
        foreground: "#000000",
      },
    },
  },
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/lib/heroui-theme.ts
git commit -m "feat(dashboard): add HeroUI theme matching existing c-* tokens"
```

---

### Task 3: Crear Providers client component

**Files:**
- Create: `apps/dashboard/app/providers.tsx`

- [ ] **Step 1: Crear el archivo**

```tsx
// apps/dashboard/app/providers.tsx
"use client"

import { HeroUIProvider } from "@heroui/react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <HeroUIProvider>{children}</HeroUIProvider>
    </NextThemesProvider>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/app/providers.tsx
git commit -m "feat(dashboard): add Providers wrapper (HeroUI + next-themes)"
```

---

### Task 4: Integrar Providers en root layout

**Files:**
- Modify: `apps/dashboard/app/layout.tsx`

- [ ] **Step 1: Reemplazar todo el contenido**

```tsx
import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { Providers } from "./providers"
import "@/app/globals.css"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | Cerebros Esponjosos" },
  description: "Panel de administración de Cerebros Esponjosos",
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="es" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
          />
        </head>
        <body>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
```

- [ ] **Step 2: Verificar que arranca sin errores**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Landing"
npm run dev --workspace=apps/dashboard
```

Expected: `✓ Ready in Xs`. Abrir http://localhost:3002 — el dashboard debe seguir funcionando visualmente igual (HeroUI provider no cambia nada aún).

Matar con Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add apps/dashboard/app/layout.tsx
git commit -m "feat(dashboard): wrap app with HeroUI + theme providers"
```

---

## PHASE 2 — Primitive components

### Task 5: PageHeader

**Files:**
- Create: `apps/dashboard/components/ui/PageHeader.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// apps/dashboard/components/ui/PageHeader.tsx
interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-[var(--c-border)] bg-[var(--c-bg)] px-8 py-5">
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

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/ui/PageHeader.tsx
git commit -m "feat(dashboard/ui): add PageHeader primitive"
```

---

### Task 6: Section

**Files:**
- Create: `apps/dashboard/components/ui/Section.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// apps/dashboard/components/ui/Section.tsx
interface SectionProps {
  label: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
}

export function Section({ label, description, action, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--c-text-subtle)]">
            {label}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-[var(--c-text-muted)]">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/ui/Section.tsx
git commit -m "feat(dashboard/ui): add Section primitive"
```

---

### Task 7: ChipStatus

**Files:**
- Create: `apps/dashboard/components/ui/ChipStatus.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// apps/dashboard/components/ui/ChipStatus.tsx
import { Chip } from "@heroui/react"
import { cn } from "@cerebros/lib"

type Status = "success" | "warning" | "error" | "neutral" | "info"

interface ChipStatusProps {
  status: Status
  label: string
  size?: "sm" | "md"
}

const statusStyles: Record<Status, string> = {
  success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/25",
  warning: "bg-amber-500/10 text-amber-500 border-amber-500/25",
  error: "bg-red-500/10 text-red-500 border-red-500/25",
  neutral: "bg-[var(--c-surface-2)] text-[var(--c-text-muted)] border-[var(--c-border)]",
  info: "bg-blue-500/10 text-blue-500 border-blue-500/25",
}

export function ChipStatus({ status, label, size = "sm" }: ChipStatusProps) {
  return (
    <Chip
      size={size}
      variant="flat"
      classNames={{
        base: cn("border", statusStyles[status]),
        content: "text-[11px] font-medium",
      }}
    >
      {label}
    </Chip>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/ui/ChipStatus.tsx
git commit -m "feat(dashboard/ui): add ChipStatus with semantic variants"
```

---

### Task 8: EmptyState

**Files:**
- Create: `apps/dashboard/components/ui/EmptyState.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// apps/dashboard/components/ui/EmptyState.tsx
import type { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)]">
        <Icon className="h-5 w-5 text-[var(--c-text-muted)]" />
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--c-text)]">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-[var(--c-text-muted)]">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/ui/EmptyState.tsx
git commit -m "feat(dashboard/ui): add EmptyState primitive"
```

---

### Task 9: LoadingSkeleton

**Files:**
- Create: `apps/dashboard/components/ui/LoadingSkeleton.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// apps/dashboard/components/ui/LoadingSkeleton.tsx
import { Skeleton } from "@heroui/react"

type Variant = "card" | "table" | "list" | "chart"

interface LoadingSkeletonProps {
  variant: Variant
  count?: number
}

export function LoadingSkeleton({ variant, count = 3 }: LoadingSkeletonProps) {
  if (variant === "card") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (variant === "table") {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (variant === "list") {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3 w-1/3 rounded" />
              <Skeleton className="h-2.5 w-1/2 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // chart
  return <Skeleton className="h-48 w-full rounded-2xl" />
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/ui/LoadingSkeleton.tsx
git commit -m "feat(dashboard/ui): add LoadingSkeleton with card/table/list/chart variants"
```

---

### Task 10: FilterBar

**Files:**
- Create: `apps/dashboard/components/ui/FilterBar.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// apps/dashboard/components/ui/FilterBar.tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/ui/FilterBar.tsx
git commit -m "feat(dashboard/ui): add FilterBar with search + custom filters slot"
```

---

### Task 11: TwoColumnLayout

**Files:**
- Create: `apps/dashboard/components/ui/TwoColumnLayout.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// apps/dashboard/components/ui/TwoColumnLayout.tsx
interface TwoColumnLayoutProps {
  left: React.ReactNode
  right: React.ReactNode
  leftWidth?: "narrow" | "balanced"
}

export function TwoColumnLayout({
  left,
  right,
  leftWidth = "narrow",
}: TwoColumnLayoutProps) {
  const leftCls =
    leftWidth === "narrow" ? "lg:w-[360px]" : "lg:w-[40%]"

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
      <div className={`w-full shrink-0 ${leftCls}`}>{left}</div>
      <div className="min-w-0 flex-1">{right}</div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/ui/TwoColumnLayout.tsx
git commit -m "feat(dashboard/ui): add TwoColumnLayout for master-detail pages"
```

---

### Task 12: DataTable

**Files:**
- Create: `apps/dashboard/components/ui/DataTable.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// apps/dashboard/components/ui/DataTable.tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/ui/DataTable.tsx
git commit -m "feat(dashboard/ui): add generic DataTable with empty state support"
```

---

### Task 13: PageTransition

**Files:**
- Create: `apps/dashboard/components/ui/PageTransition.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// apps/dashboard/components/ui/PageTransition.tsx
"use client"
import { motion } from "framer-motion"

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-h-0 flex-1 flex-col"
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/ui/PageTransition.tsx
git commit -m "feat(dashboard/ui): add PageTransition wrapper for route transitions"
```

---

## PHASE 3 — Animation wrappers

### Task 14: FadeIn (reactbits adaptation)

**Files:**
- Create: `apps/dashboard/components/ui/effects/FadeIn.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// apps/dashboard/components/ui/effects/FadeIn.tsx
"use client"
import { motion } from "framer-motion"

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.35,
  className,
}: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/ui/effects/FadeIn.tsx
git commit -m "feat(dashboard/ui): add FadeIn effect (reactbits adaptation)"
```

---

### Task 15: StaggerList

**Files:**
- Create: `apps/dashboard/components/ui/effects/StaggerList.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// apps/dashboard/components/ui/effects/StaggerList.tsx
"use client"
import { motion } from "framer-motion"

interface StaggerListProps {
  children: React.ReactNode[]
  staggerDelay?: number
  className?: string
}

export function StaggerList({
  children,
  staggerDelay = 0.05,
  className,
}: StaggerListProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: staggerDelay } },
      }}
    >
      {children.map((child, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 10 },
            show: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/ui/effects/StaggerList.tsx
git commit -m "feat(dashboard/ui): add StaggerList effect (reactbits adaptation)"
```

---

### Task 16: ClickSpark

**Files:**
- Create: `apps/dashboard/components/ui/effects/ClickSpark.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// apps/dashboard/components/ui/effects/ClickSpark.tsx
"use client"
import { useRef } from "react"

interface ClickSparkProps {
  children: React.ReactNode
  sparkColor?: string
}

export function ClickSpark({ children, sparkColor = "currentColor" }: ClickSparkProps) {
  const ref = useRef<HTMLDivElement>(null)

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const count = 6
    const angleStep = (Math.PI * 2) / count
    for (let i = 0; i < count; i++) {
      const spark = document.createElement("span")
      spark.style.position = "absolute"
      spark.style.left = `${x}px`
      spark.style.top = `${y}px`
      spark.style.width = "4px"
      spark.style.height = "4px"
      spark.style.borderRadius = "50%"
      spark.style.background = sparkColor
      spark.style.pointerEvents = "none"
      spark.style.opacity = "0.8"
      spark.style.transform = "translate(-50%, -50%)"
      spark.style.transition = "transform 0.5s ease-out, opacity 0.5s ease-out"
      ref.current.appendChild(spark)

      const angle = angleStep * i
      const dx = Math.cos(angle) * 20
      const dy = Math.sin(angle) * 20

      requestAnimationFrame(() => {
        spark.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`
        spark.style.opacity = "0"
      })

      setTimeout(() => spark.remove(), 500)
    }
  }

  return (
    <div
      ref={ref}
      onClick={handleClick}
      style={{ position: "relative" }}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/ui/effects/ClickSpark.tsx
git commit -m "feat(dashboard/ui): add ClickSpark effect for button feedback"
```

---

### Task 17: AnimatedNumber

**Files:**
- Create: `apps/dashboard/components/ui/animate/AnimatedNumber.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// apps/dashboard/components/ui/animate/AnimatedNumber.tsx
"use client"
import { useEffect, useState } from "react"
import { useMotionValue, useTransform, animate } from "framer-motion"

interface AnimatedNumberProps {
  value: number
  duration?: number
  format?: (n: number) => string
  className?: string
}

export function AnimatedNumber({
  value,
  duration = 1.2,
  format = (n) => Math.round(n).toLocaleString("es-MX"),
  className,
}: AnimatedNumberProps) {
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (latest) => format(latest))
  const [display, setDisplay] = useState(format(0))

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    })
    const unsub = rounded.on("change", (v) => setDisplay(v))
    return () => {
      controls.stop()
      unsub()
    }
  }, [value, duration, motionValue, rounded])

  return <span className={className}>{display}</span>
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/ui/animate/AnimatedNumber.tsx
git commit -m "feat(dashboard/ui): add AnimatedNumber counter (animate-ui adaptation)"
```

---

## PHASE 4 — Card variants

### Task 18: StatCard

**Files:**
- Create: `apps/dashboard/components/ui/StatCard.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// apps/dashboard/components/ui/StatCard.tsx
import { cn } from "@cerebros/lib"
import type { LucideIcon } from "lucide-react"
import { AnimatedNumber } from "./animate/AnimatedNumber"

interface StatCardProps {
  label: string
  value: number | string
  sublabel?: string
  icon?: LucideIcon
  trend?: { value: number; label: string }
  animate?: boolean
  className?: string
}

export function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  trend,
  animate = true,
  className,
}: StatCardProps) {
  const isNumeric = typeof value === "number"

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-8 h-[120px] w-[120px]"
        style={{ background: "radial-gradient(circle, var(--c-glow) 0%, transparent 70%)" }}
      />

      <div className="relative mb-4 flex items-start justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--c-text-subtle)]">
          {label}
        </p>
        {Icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--c-border)] bg-[var(--c-surface-2)]">
            <Icon className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />
          </div>
        )}
      </div>

      <p className="relative text-[36px] font-semibold leading-none tracking-[-0.04em] text-[var(--c-text)]">
        {isNumeric && animate ? <AnimatedNumber value={value} /> : value}
      </p>

      {sublabel && (
        <p className="relative mt-1.5 text-xs text-[var(--c-text-faint)]">{sublabel}</p>
      )}

      {trend && (
        <div className="relative mt-4 flex items-center gap-1.5 border-t border-[var(--c-border)] pt-4">
          <span
            className={cn(
              "text-xs font-medium",
              trend.value >= 0 ? "text-emerald-500" : "text-red-500"
            )}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}%
          </span>
          <span className="text-xs text-[var(--c-text-subtle)]">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/ui/StatCard.tsx
git commit -m "feat(dashboard/ui): add StatCard (upgrade of MetricCard with animated counter)"
```

---

### Task 19: TrendCard

**Files:**
- Create: `apps/dashboard/components/ui/TrendCard.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// apps/dashboard/components/ui/TrendCard.tsx
"use client"
import { cn } from "@cerebros/lib"
import type { LucideIcon } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer } from "recharts"
import { AnimatedNumber } from "./animate/AnimatedNumber"

interface TrendCardProps {
  label: string
  value: number
  icon?: LucideIcon
  trendData: Array<{ day: string; value: number }>
  trendPercent?: number
  className?: string
}

export function TrendCard({
  label,
  value,
  icon: Icon,
  trendData,
  trendPercent,
  className,
}: TrendCardProps) {
  const isPositive = (trendPercent ?? 0) >= 0
  const strokeColor = isPositive ? "#10b981" : "#ef4444"

  return (
    <div
      className={cn(
        "relative flex min-h-[180px] flex-col justify-between overflow-hidden rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-8 h-[120px] w-[120px]"
        style={{ background: "radial-gradient(circle, var(--c-glow) 0%, transparent 70%)" }}
      />

      <div className="relative">
        <div className="mb-4 flex items-start justify-between">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--c-text-subtle)]">
            {label}
          </p>
          {Icon && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--c-border)] bg-[var(--c-surface-2)]">
              <Icon className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />
            </div>
          )}
        </div>

        <p className="text-[32px] font-semibold leading-none tracking-[-0.04em] text-[var(--c-text)]">
          <AnimatedNumber value={value} />
        </p>

        {trendPercent !== undefined && (
          <p
            className={cn(
              "mt-2 text-xs font-medium",
              isPositive ? "text-emerald-500" : "text-red-500"
            )}
          >
            {isPositive ? "+" : ""}
            {trendPercent}% <span className="text-[var(--c-text-subtle)]">últimos 30d</span>
          </p>
        )}
      </div>

      <div className="relative -mx-6 -mb-6 mt-2 h-16">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={strokeColor}
              strokeWidth={2}
              fill={`url(#grad-${label})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/ui/TrendCard.tsx
git commit -m "feat(dashboard/ui): add TrendCard with sparkline (recharts)"
```

---

### Task 20: ActionCard

**Files:**
- Create: `apps/dashboard/components/ui/ActionCard.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// apps/dashboard/components/ui/ActionCard.tsx
"use client"
import Link from "next/link"
import { cn } from "@cerebros/lib"
import type { LucideIcon } from "lucide-react"
import { ArrowUpRight } from "lucide-react"
import { motion } from "framer-motion"

interface ActionCardProps {
  title: string
  description?: string
  icon: LucideIcon
  href: string
  className?: string
}

export function ActionCard({
  title,
  description,
  icon: Icon,
  href,
  className,
}: ActionCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Link
        href={href}
        className={cn(
          "relative block h-full overflow-hidden rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-5 transition-colors hover:border-[var(--c-border-strong)] shadow-[0_1px_4px_rgba(0,0,0,0.06)]",
          className
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)]">
            <Icon className="h-4 w-4 text-[var(--c-text)]" />
          </div>
          <ArrowUpRight className="h-4 w-4 text-[var(--c-text-subtle)]" />
        </div>
        <p className="mt-4 text-sm font-semibold tracking-tight text-[var(--c-text)]">
          {title}
        </p>
        {description && (
          <p className="mt-1 text-xs text-[var(--c-text-muted)]">{description}</p>
        )}
      </Link>
    </motion.div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/ui/ActionCard.tsx
git commit -m "feat(dashboard/ui): add ActionCard with hover lift"
```

---

### Task 21: InfoCard

**Files:**
- Create: `apps/dashboard/components/ui/InfoCard.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
// apps/dashboard/components/ui/InfoCard.tsx
import { cn } from "@cerebros/lib"

interface InfoCardProps {
  title?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  padded?: boolean
}

export function InfoCard({
  title,
  action,
  children,
  className,
  padded = true,
}: InfoCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-[0_1px_4px_rgba(0,0,0,0.06)]",
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-[var(--c-border)] px-5 py-3.5">
          {title && (
            <p className="text-[13px] font-medium text-[var(--c-text)]">{title}</p>
          )}
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/components/ui/InfoCard.tsx
git commit -m "feat(dashboard/ui): add InfoCard with optional header"
```

---

## PHASE 5 — Page redesigns

**Note:** las páginas a continuación asumen que los componentes de Phase 2-4 existen. No reordenar.

### Task 22: Refactor Sidebar + Header + Dashboard layout

**Files:**
- Modify: `apps/dashboard/components/Sidebar.tsx`
- Modify: `apps/dashboard/components/Header.tsx` (elimina — ahora usamos PageHeader)
- Modify: `apps/dashboard/app/(dashboard)/layout.tsx`

- [ ] **Step 1: Refactor Sidebar con hover animations**

Reemplazar `apps/dashboard/components/Sidebar.tsx`:

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
import { motion } from "framer-motion"
import { cn } from "@cerebros/lib"

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/newsletter", label: "Newsletter", icon: Mail },
  { href: "/colaboraciones", label: "Colaboraciones", icon: Handshake },
  { href: "/contenido", label: "Contenido", icon: FileText },
  { href: "/agentes", label: "Agentes IA", icon: Bot },
  { href: "/equipo", label: "Equipo", icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-[var(--c-border)] bg-[var(--c-surface)] backdrop-blur-xl shadow-[1px_0_0_var(--c-border)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-10 -top-16 h-60 w-60 z-0"
        style={{ background: "radial-gradient(circle, var(--c-glow) 0%, transparent 65%)" }}
      />

      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-[var(--c-border)] px-4 py-5">
          <div className="h-7 w-7 shrink-0 rounded-md bg-[var(--c-invert)]" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold leading-tight tracking-tight text-[var(--c-text)]">
              Cerebros Esponjosos
            </p>
            <p className="mt-0.5 text-[10px] leading-none text-[var(--c-text-subtle)]">
              Dashboard
            </p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2.5 py-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <motion.div
                key={href}
                whileHover={!active ? { x: 2 } : undefined}
                transition={{ duration: 0.15 }}
              >
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors",
                    active
                      ? "bg-[var(--c-invert)] font-medium text-[var(--c-invert-fg)]"
                      : "text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)] hover:text-[var(--c-text)]"
                  )}
                >
                  <Icon className="h-[15px] w-[15px] shrink-0" />
                  {label}
                </Link>
              </motion.div>
            )
          })}
        </nav>

        <div className="flex items-center gap-2.5 border-t border-[var(--c-border)] px-4 py-3">
          <UserButton appearance={{ elements: { avatarBox: { width: 28, height: 28 } } }} />
        </div>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Eliminar Header.tsx**

```bash
rm "apps/dashboard/components/Header.tsx"
```

Razón: ahora usamos `<PageHeader>` de `components/ui/` que acepta acciones.

- [ ] **Step 3: Actualizar dashboard layout con PageTransition**

Reemplazar `apps/dashboard/app/(dashboard)/layout.tsx`:

```tsx
import { Sidebar } from "@/components/Sidebar"
import { PageTransition } from "@/components/ui/PageTransition"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--c-bg)]">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Build check**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Landing"
npm run build --workspace=apps/dashboard 2>&1 | tail -5
```

Expected: Build falla porque páginas aún importan `Header.tsx`. Eso se arregla en las siguientes tasks. Por ahora proceder igual.

- [ ] **Step 5: Commit**

```bash
git add apps/dashboard/components/Sidebar.tsx apps/dashboard/app/\(dashboard\)/layout.tsx
git rm apps/dashboard/components/Header.tsx
git commit -m "refactor(dashboard): sidebar with hover anim, layout with PageTransition, drop Header (use PageHeader)"
```

---

### Task 23: Overview page — rewrite

**Files:**
- Modify: `apps/dashboard/app/(dashboard)/page.tsx`

- [ ] **Step 1: Reemplazar contenido**

```tsx
import { getSupabase } from "@/lib/supabase"
import {
  Mail,
  Handshake,
  Heart,
  Plus,
  Send,
  MessageSquare,
} from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { Section } from "@/components/ui/Section"
import { StatCard } from "@/components/ui/StatCard"
import { ActionCard } from "@/components/ui/ActionCard"
import { InfoCard } from "@/components/ui/InfoCard"
import { FadeIn } from "@/components/ui/effects/FadeIn"
import { StaggerList } from "@/components/ui/effects/StaggerList"

async function getOverviewData() {
  const [subsRes, colabsRes, likesRes, recentSubs, recentColabs] =
    await Promise.all([
      getSupabase().from("suscriptores").select("id", { count: "exact", head: true }),
      getSupabase()
        .from("colaboraciones")
        .select("estado")
        .in("estado", ["en_negociacion", "confirmada"]),
      getSupabase().from("post_likes").select("id", { count: "exact", head: true }),
      getSupabase()
        .from("suscriptores")
        .select("email, created_at")
        .order("created_at", { ascending: false })
        .limit(3),
      getSupabase()
        .from("colaboraciones")
        .select("marca, estado, updated_at")
        .order("updated_at", { ascending: false })
        .limit(2),
    ])

  const activity = [
    ...(recentSubs.data ?? []).map((s) => ({
      kind: "sub" as const,
      text: `Nuevo suscriptor: ${s.email}`,
      date: s.created_at,
    })),
    ...(recentColabs.data ?? []).map((c) => ({
      kind: "colab" as const,
      text: `Colaboración "${c.marca}" → ${c.estado}`,
      date: c.updated_at,
    })),
  ]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 5)

  return {
    subscribers: subsRes.count ?? 0,
    colaboracionesActivas: colabsRes.data?.length ?? 0,
    totalLikes: likesRes.count ?? 0,
    activity,
  }
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const diffH = Math.floor((Date.now() - d.getTime()) / 3_600_000)
  if (diffH < 1) return "hace minutos"
  if (diffH < 24) return `hace ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return "ayer"
  if (diffD < 7) return `hace ${diffD}d`
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" })
}

export default async function OverviewPage() {
  const data = await getOverviewData()

  return (
    <>
      <PageHeader
        title="Bienvenido de vuelta"
        subtitle="Aquí tienes un resumen de tu contenido y audiencia"
      />

      <div className="flex flex-col gap-8 p-8">
        <FadeIn>
          <Section label="Acciones rápidas">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ActionCard
                title="Nueva colaboración"
                description="Registrar una marca o propuesta"
                icon={Plus}
                href="/colaboraciones/new"
              />
              <ActionCard
                title="Enviar newsletter"
                description="Compón y envía a tus suscriptores"
                icon={Send}
                href="/newsletter"
              />
              <ActionCard
                title="Preguntar a Claude"
                description="Análisis de tu contenido"
                icon={MessageSquare}
                href="/agentes"
              />
            </div>
          </Section>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Section label="Métricas clave">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                label="Suscriptores newsletter"
                value={data.subscribers}
                icon={Mail}
              />
              <StatCard
                label="Colaboraciones activas"
                value={data.colaboracionesActivas}
                sublabel="en negociación o confirmadas"
                icon={Handshake}
              />
              <StatCard
                label="Likes en blog"
                value={data.totalLikes}
                icon={Heart}
              />
            </div>
          </Section>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Section label="Actividad reciente">
            <InfoCard padded={false}>
              {data.activity.length === 0 ? (
                <p className="p-6 text-sm text-[var(--c-text-muted)]">
                  Sin actividad reciente.
                </p>
              ) : (
                <StaggerList className="divide-y divide-[var(--c-border)]">
                  {data.activity.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-5 py-3"
                    >
                      <p className="text-sm text-[var(--c-text)]">{a.text}</p>
                      <p className="text-xs text-[var(--c-text-muted)]">
                        {formatDate(a.date)}
                      </p>
                    </div>
                  ))}
                </StaggerList>
              )}
            </InfoCard>
          </Section>
        </FadeIn>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/app/\(dashboard\)/page.tsx
git commit -m "feat(dashboard): redesign Overview with quick actions, stat cards, activity feed"
```

---

### Task 24: Analytics page — rewrite with HeroUI Tabs

**Files:**
- Modify: `apps/dashboard/app/(dashboard)/analytics/page.tsx`

- [ ] **Step 1: Reemplazar contenido**

```tsx
import { getSupabase } from "@/lib/supabase"
import { readFile } from "fs/promises"
import path from "path"
import { Camera, CirclePlay, Heart } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { StatCard } from "@/components/ui/StatCard"
import { InfoCard } from "@/components/ui/InfoCard"
import { FadeIn } from "@/components/ui/effects/FadeIn"
import { AnalyticsTabsClient } from "./AnalyticsTabsClient"

interface ContentData {
  instagram?: {
    followers?: number
    posts?: Array<{ id: string; likes: number; comments: number; plays?: number }>
  }
  youtube?: {
    videos?: Array<{ id: string; title: string; views: number; likes: number }>
  }
}

async function getAnalyticsData() {
  let content: ContentData = {}
  try {
    const contentPath = path.join(process.cwd(), "../../apps/web/public/data/content.json")
    const raw = await readFile(contentPath, "utf-8")
    content = JSON.parse(raw)
  } catch {}

  const { data: likesData } = await getSupabase().from("post_likes").select("slug")
  const likesBySlugs: Record<string, number> = {}
  likesData?.forEach(({ slug }) => {
    likesBySlugs[slug] = (likesBySlugs[slug] ?? 0) + 1
  })
  const topPosts = Object.entries(likesBySlugs)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([slug, count]) => ({ slug, count }))

  const igPosts = content.instagram?.posts ?? []
  const igFollowers = content.instagram?.followers ?? 0
  const igEngagement =
    igPosts.length > 0
      ? Math.round(
          igPosts.reduce((acc, p) => acc + p.likes + p.comments, 0) / igPosts.length
        )
      : 0
  const ytVideos = content.youtube?.videos ?? []
  const ytTotalViews = ytVideos.reduce((acc, v) => acc + v.views, 0)

  return {
    igFollowers,
    igEngagement,
    ytTotalViews,
    ytVideosCount: ytVideos.length,
    totalBlogLikes: likesData?.length ?? 0,
    topPosts,
    ytVideos,
  }
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData()

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Métricas de redes sociales y blog"
      />
      <div className="flex flex-col gap-6 p-8">
        <FadeIn>
          <AnalyticsTabsClient data={data} />
        </FadeIn>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Crear client component para tabs**

Create `apps/dashboard/app/(dashboard)/analytics/AnalyticsTabsClient.tsx`:

```tsx
"use client"
import { Tabs, Tab } from "@heroui/react"
import { Camera, CirclePlay, Heart } from "lucide-react"
import { StatCard } from "@/components/ui/StatCard"
import { InfoCard } from "@/components/ui/InfoCard"

interface AnalyticsData {
  igFollowers: number
  igEngagement: number
  ytTotalViews: number
  ytVideosCount: number
  totalBlogLikes: number
  topPosts: Array<{ slug: string; count: number }>
  ytVideos: Array<{ id: string; title: string; views: number; likes: number }>
}

export function AnalyticsTabsClient({ data }: { data: AnalyticsData }) {
  return (
    <Tabs
      aria-label="Analytics sections"
      variant="underlined"
      classNames={{
        tabList: "border-b border-[var(--c-border)] gap-6 w-full",
        cursor: "bg-[var(--c-invert)]",
        tab: "px-0 h-10 data-[selected=true]:text-[var(--c-text)] text-[var(--c-text-muted)]",
      }}
    >
      <Tab key="overview" title="Overview">
        <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-3">
          <StatCard label="Instagram seguidores" value={data.igFollowers} icon={Camera} />
          <StatCard label="YouTube vistas" value={data.ytTotalViews} icon={CirclePlay} />
          <StatCard label="Blog likes" value={data.totalBlogLikes} icon={Heart} />
        </div>
      </Tab>

      <Tab key="instagram" title="Instagram">
        <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
          <StatCard label="Seguidores" value={data.igFollowers} icon={Camera} />
          <StatCard
            label="Engagement promedio"
            value={data.igEngagement}
            sublabel="likes + comments por post"
            icon={Camera}
          />
        </div>
      </Tab>

      <Tab key="youtube" title="YouTube">
        <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
          <StatCard label="Vistas totales" value={data.ytTotalViews} icon={CirclePlay} />
          <StatCard label="Videos" value={data.ytVideosCount} icon={CirclePlay} />
        </div>
        {data.ytVideos.length > 0 && (
          <div className="mt-6">
            <InfoCard title="Videos" padded={false}>
              <ul className="divide-y divide-[var(--c-border)]">
                {data.ytVideos.slice(0, 5).map((v) => (
                  <li key={v.id} className="flex items-center justify-between px-5 py-3">
                    <span className="text-[13px] text-[var(--c-text)]">{v.title}</span>
                    <span className="text-[13px] font-medium text-[var(--c-text-muted)]">
                      {v.views.toLocaleString("es-MX")} vistas
                    </span>
                  </li>
                ))}
              </ul>
            </InfoCard>
          </div>
        )}
      </Tab>

      <Tab key="blog" title="Blog">
        <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
          <StatCard label="Likes totales" value={data.totalBlogLikes} icon={Heart} />
        </div>
        {data.topPosts.length > 0 && (
          <div className="mt-6">
            <InfoCard title="Posts más populares" padded={false}>
              <ul className="divide-y divide-[var(--c-border)]">
                {data.topPosts.map(({ slug, count }, i) => (
                  <li
                    key={slug}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-4 text-xs text-[var(--c-text-faint)]">
                        {i + 1}
                      </span>
                      <span className="text-[13px] text-[var(--c-text)]">{slug}</span>
                    </div>
                    <span className="text-[13px] font-medium text-[var(--c-text-muted)]">
                      {count} ❤️
                    </span>
                  </li>
                ))}
              </ul>
            </InfoCard>
          </div>
        )}
      </Tab>
    </Tabs>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add "apps/dashboard/app/(dashboard)/analytics/"
git commit -m "feat(dashboard): redesign Analytics with HeroUI tabs per platform"
```

---

### Task 25: Newsletter page — master-detail layout

**Files:**
- Modify: `apps/dashboard/app/(dashboard)/newsletter/page.tsx`
- Create: `apps/dashboard/app/(dashboard)/newsletter/NewsletterClient.tsx`

- [ ] **Step 1: Reemplazar `page.tsx`**

```tsx
import { getSupabase } from "@/lib/supabase"
import type { NewsletterSubscriber } from "@cerebros/lib"
import { PageHeader } from "@/components/ui/PageHeader"
import { NewsletterClient } from "./NewsletterClient"

async function getSubscribers() {
  const { data, count } = await getSupabase()
    .from("suscriptores")
    .select("id, email, nombre, confirmed, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(100)

  const confirmed = data?.filter((s) => s.confirmed).length ?? 0
  return {
    subscribers: (data ?? []) as NewsletterSubscriber[],
    total: count ?? 0,
    confirmed,
  }
}

export default async function NewsletterPage() {
  const { subscribers, total, confirmed } = await getSubscribers()
  return (
    <>
      <PageHeader title="Newsletter" subtitle={`${total.toLocaleString("es-MX")} suscriptores`} />
      <div className="flex flex-col gap-6 p-8">
        <NewsletterClient subscribers={subscribers} total={total} confirmed={confirmed} />
      </div>
    </>
  )
}
```

- [ ] **Step 2: Crear `NewsletterClient.tsx`**

```tsx
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
        <StatCard label="Total suscriptores" value={total} icon={Mail} />
        <StatCard label="Confirmados" value={confirmed} icon={CheckCircle} />
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
```

- [ ] **Step 3: Commit**

```bash
git add "apps/dashboard/app/(dashboard)/newsletter/"
git commit -m "feat(dashboard): redesign Newsletter with master-detail layout"
```

---

### Task 26: Colaboraciones page — Kanban + stats + toggle

**Files:**
- Modify: `apps/dashboard/app/(dashboard)/colaboraciones/page.tsx`
- Modify: `apps/dashboard/components/KanbanBoard.tsx`
- Modify: `apps/dashboard/components/KanbanCard.tsx`

- [ ] **Step 1: Refactor KanbanCard con dropdown actions**

```tsx
// apps/dashboard/components/KanbanCard.tsx
"use client"
import { motion } from "framer-motion"
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react"
import { MoreHorizontal } from "lucide-react"
import type { Colaboracion } from "@cerebros/lib"

interface KanbanCardProps {
  colaboracion: Colaboracion
  onEstadoChange: (id: string, estado: Colaboracion["estado"]) => void
}

const ESTADOS: Colaboracion["estado"][] = [
  "prospecto",
  "en_negociacion",
  "confirmada",
  "cerrada",
]

export function KanbanCard({ colaboracion, onEstadoChange }: KanbanCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
      transition={{ duration: 0.15 }}
      className="flex flex-col gap-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-[var(--c-text)]">
            {colaboracion.marca}
          </p>
          <p className="truncate text-[11px] text-[var(--c-text-muted)]">
            {colaboracion.tipo}
          </p>
        </div>
        <Dropdown>
          <DropdownTrigger>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="h-6 w-6 min-w-6"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Acciones" variant="flat">
            {ESTADOS.filter((e) => e !== colaboracion.estado).map((e) => (
              <DropdownItem
                key={e}
                onPress={() => onEstadoChange(colaboracion.id, e)}
              >
                Mover a {e.replace("_", " ")}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>

      {colaboracion.valor_mxn && (
        <p className="text-[13px] font-semibold text-[var(--c-text)]">
          ${colaboracion.valor_mxn.toLocaleString("es-MX")} MXN
        </p>
      )}

      {colaboracion.notas && (
        <p className="line-clamp-2 text-[11px] text-[var(--c-text-subtle)]">
          {colaboracion.notas}
        </p>
      )}
    </motion.div>
  )
}
```

- [ ] **Step 2: Refactor KanbanBoard (mantiene estructura actual, mejora headers)**

```tsx
// apps/dashboard/components/KanbanBoard.tsx
"use client"
import { useState, useCallback } from "react"
import { KanbanCard } from "./KanbanCard"
import type { Colaboracion } from "@cerebros/lib"
import { AnimatedNumber } from "./ui/animate/AnimatedNumber"
import { EmptyState } from "./ui/EmptyState"
import { Inbox } from "lucide-react"

interface KanbanBoardProps {
  initialColaboraciones: Colaboracion[]
}

const COLUMNAS: { id: Colaboracion["estado"]; label: string }[] = [
  { id: "prospecto", label: "Prospecto" },
  { id: "en_negociacion", label: "En negociación" },
  { id: "confirmada", label: "Confirmada" },
  { id: "cerrada", label: "Cerrada" },
]

export function KanbanBoard({ initialColaboraciones }: KanbanBoardProps) {
  const [colaboraciones, setColaboraciones] = useState(initialColaboraciones)

  const handleEstadoChange = useCallback(
    async (id: string, nuevoEstado: Colaboracion["estado"]) => {
      setColaboraciones((prev) =>
        prev.map((c) => (c.id === id ? { ...c, estado: nuevoEstado } : c))
      )

      const res = await fetch(`/api/colaboraciones?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      })

      if (!res.ok) {
        setColaboraciones(initialColaboraciones)
        alert("Error al actualizar el estado")
      }
    },
    [initialColaboraciones]
  )

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {COLUMNAS.map(({ id, label }) => {
        const items = colaboraciones.filter((c) => c.estado === id)
        return (
          <div
            key={id}
            className="flex min-h-[220px] flex-col gap-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-3)] p-3.5"
          >
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--c-text-subtle)]">
                {label}
              </h3>
              <span className="rounded-full border border-[var(--c-border)] bg-[var(--c-surface-2)] px-2 py-0.5 text-[10px] font-medium text-[var(--c-text-muted)]">
                <AnimatedNumber value={items.length} duration={0.6} />
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {items.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  title="Sin colaboraciones"
                  description="Las que agregues aparecerán aquí."
                />
              ) : (
                items.map((c) => (
                  <KanbanCard
                    key={c.id}
                    colaboracion={c}
                    onEstadoChange={handleEstadoChange}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Rewrite Colaboraciones page**

```tsx
// apps/dashboard/app/(dashboard)/colaboraciones/page.tsx
import Link from "next/link"
import { KanbanBoard } from "@/components/KanbanBoard"
import { getSupabase } from "@/lib/supabase"
import { Plus, Briefcase, CheckCircle, TrendingUp, DollarSign } from "lucide-react"
import type { Colaboracion } from "@cerebros/lib"
import { PageHeader } from "@/components/ui/PageHeader"
import { StatCard } from "@/components/ui/StatCard"
import { FadeIn } from "@/components/ui/effects/FadeIn"
import { Button } from "@heroui/react"

async function getColaboraciones(): Promise<Colaboracion[]> {
  const { data } = await getSupabase()
    .from("colaboraciones")
    .select("*")
    .order("created_at", { ascending: false })
  return (data ?? []) as Colaboracion[]
}

function currentMonthStart() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export default async function ColaboracionesPage() {
  const colaboraciones = await getColaboraciones()

  const activas = colaboraciones.filter(
    (c) => c.estado === "en_negociacion" || c.estado === "confirmada"
  )
  const pipelineTotal = activas.reduce((acc, c) => acc + (c.valor_mxn ?? 0), 0)

  const monthStart = currentMonthStart()
  const confirmadasMes = colaboraciones.filter(
    (c) => c.estado === "confirmada" && new Date(c.created_at) >= monthStart
  ).length

  const confirmadas = colaboraciones.filter((c) => c.estado === "confirmada").length
  const cerradas = colaboraciones.filter((c) => c.estado === "cerrada").length
  const conversionRate =
    colaboraciones.length > 0
      ? Math.round(((confirmadas + cerradas) / colaboraciones.length) * 100)
      : 0

  const withValue = colaboraciones.filter((c) => c.valor_mxn)
  const avgTicket =
    withValue.length > 0
      ? Math.round(withValue.reduce((a, c) => a + (c.valor_mxn ?? 0), 0) / withValue.length)
      : 0

  return (
    <>
      <PageHeader
        title="Colaboraciones"
        subtitle={`${colaboraciones.length} colaboraciones en total`}
        actions={
          <Link href="/colaboraciones/new">
            <Button
              color="primary"
              size="sm"
              startContent={<Plus className="h-3.5 w-3.5" />}
              className="rounded-xl"
            >
              Nueva
            </Button>
          </Link>
        }
      />
      <div className="flex flex-col gap-6 p-8">
        <FadeIn>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              label="Pipeline total"
              value={`$${pipelineTotal.toLocaleString("es-MX")}`}
              sublabel="MXN en negociación + confirmadas"
              icon={DollarSign}
              animate={false}
            />
            <StatCard
              label="Confirmadas este mes"
              value={confirmadasMes}
              icon={CheckCircle}
            />
            <StatCard
              label="Conversion rate"
              value={`${conversionRate}%`}
              sublabel="confirmadas + cerradas"
              icon={TrendingUp}
              animate={false}
            />
            <StatCard
              label="Ticket promedio"
              value={`$${avgTicket.toLocaleString("es-MX")}`}
              icon={Briefcase}
              animate={false}
            />
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <KanbanBoard initialColaboraciones={colaboraciones} />
        </FadeIn>
      </div>
    </>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/dashboard/components/KanbanBoard.tsx apps/dashboard/components/KanbanCard.tsx "apps/dashboard/app/(dashboard)/colaboraciones/page.tsx"
git commit -m "feat(dashboard): redesign Colaboraciones with stats row + improved Kanban"
```

---

### Task 27: Nueva Colaboración — sections + HeroUI inputs

**Files:**
- Modify: `apps/dashboard/app/(dashboard)/colaboraciones/new/page.tsx`
- Modify: `apps/dashboard/components/NuevaColaboracionClient.tsx`

- [ ] **Step 1: Reemplazar page.tsx**

```tsx
// apps/dashboard/app/(dashboard)/colaboraciones/new/page.tsx
import { PageHeader } from "@/components/ui/PageHeader"
import { NuevaColaboracionClient } from "@/components/NuevaColaboracionClient"

export default function NuevaColaboracionPage() {
  return (
    <>
      <PageHeader
        title="Nueva colaboración"
        subtitle="Registrar una nueva marca o propuesta"
      />
      <div className="p-8">
        <NuevaColaboracionClient />
      </div>
    </>
  )
}
```

- [ ] **Step 2: Refactor NuevaColaboracionClient**

```tsx
// apps/dashboard/components/NuevaColaboracionClient.tsx
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input, Textarea, Select, SelectItem, Button } from "@heroui/react"
import { InfoCard } from "./ui/InfoCard"
import { StaggerList } from "./ui/effects/StaggerList"

const inputClassNames = {
  inputWrapper:
    "bg-[var(--c-surface-2)] border border-[var(--c-border)] shadow-none data-[hover=true]:border-[var(--c-border-strong)] group-data-[focus=true]:border-[var(--c-border-strong)]",
  input: "text-[13px]",
  label: "text-xs text-[var(--c-text-muted)]",
}

export function NuevaColaboracionClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    const body = {
      marca: form.get("marca") as string,
      tipo: form.get("tipo") as string,
      valor_mxn: form.get("valor_mxn") ? Number(form.get("valor_mxn")) : null,
      estado: form.get("estado") as string,
      notas: (form.get("notas") as string) || null,
      contacto_nombre: (form.get("contacto_nombre") as string) || null,
      contacto_email: (form.get("contacto_email") as string) || null,
    }

    const res = await fetch("/api/colaboraciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      router.push("/colaboraciones")
    } else {
      const data = await res.json()
      setError(JSON.stringify(data.error))
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl flex-col gap-5">
      {error && (
        <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-[13px] text-red-500">
          {error}
        </div>
      )}

      <StaggerList staggerDelay={0.08} className="flex flex-col gap-5">
        <InfoCard title="Información básica">
          <div className="flex flex-col gap-4">
            <Input
              name="marca"
              label="Marca"
              placeholder="Nombre de la marca"
              isRequired
              classNames={inputClassNames}
              labelPlacement="outside"
            />
            <Select
              name="tipo"
              label="Tipo"
              placeholder="Selecciona un tipo"
              isRequired
              classNames={{
                trigger: inputClassNames.inputWrapper,
                label: inputClassNames.label,
                value: "text-[13px]",
              }}
              labelPlacement="outside"
            >
              {["reels", "stories", "post_estatico", "podcast", "newsletter", "paquete"].map(
                (t) => (
                  <SelectItem key={t}>{t.replace("_", " ")}</SelectItem>
                )
              )}
            </Select>
            <Select
              name="estado"
              label="Estado"
              defaultSelectedKeys={["prospecto"]}
              classNames={{
                trigger: inputClassNames.inputWrapper,
                label: inputClassNames.label,
                value: "text-[13px]",
              }}
              labelPlacement="outside"
            >
              {["prospecto", "en_negociacion", "confirmada", "cerrada"].map((e) => (
                <SelectItem key={e}>{e.replace("_", " ")}</SelectItem>
              ))}
            </Select>
          </div>
        </InfoCard>

        <InfoCard title="Detalles financieros">
          <Input
            name="valor_mxn"
            type="number"
            label="Valor (MXN)"
            placeholder="0.00"
            classNames={inputClassNames}
            labelPlacement="outside"
          />
        </InfoCard>

        <InfoCard title="Contacto">
          <div className="flex flex-col gap-4">
            <Input
              name="contacto_nombre"
              label="Nombre"
              placeholder="Ana López"
              classNames={inputClassNames}
              labelPlacement="outside"
            />
            <Input
              name="contacto_email"
              type="email"
              label="Email"
              placeholder="ana@marca.com"
              classNames={inputClassNames}
              labelPlacement="outside"
            />
          </div>
        </InfoCard>

        <InfoCard title="Notas">
          <Textarea
            name="notas"
            placeholder="Propuesta, condiciones, detalles..."
            minRows={3}
            classNames={inputClassNames}
          />
        </InfoCard>
      </StaggerList>

      <div className="flex gap-2.5 pt-2">
        <Button
          type="submit"
          color="primary"
          isLoading={loading}
          className="rounded-xl"
        >
          {loading ? "Guardando..." : "Crear colaboración"}
        </Button>
        <Button
          type="button"
          variant="flat"
          onPress={() => router.back()}
          className="rounded-xl"
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add "apps/dashboard/app/(dashboard)/colaboraciones/new/page.tsx" apps/dashboard/components/NuevaColaboracionClient.tsx
git commit -m "feat(dashboard): redesign Nueva Colaboración with section cards + HeroUI inputs"
```

---

### Task 28: Contenido page — grid/table toggle + search

**Files:**
- Modify: `apps/dashboard/app/(dashboard)/contenido/page.tsx`
- Create: `apps/dashboard/app/(dashboard)/contenido/ContenidoClient.tsx`

- [ ] **Step 1: Reemplazar `page.tsx`**

```tsx
// apps/dashboard/app/(dashboard)/contenido/page.tsx
import { getSupabase } from "@/lib/supabase"
import { readFile } from "fs/promises"
import path from "path"
import { PageHeader } from "@/components/ui/PageHeader"
import { ContenidoClient } from "./ContenidoClient"

interface BlogPost {
  slug: string
  title: string
  date: string
}

async function getContenidoData() {
  let posts: BlogPost[] = []
  try {
    const raw = await readFile(
      path.join(process.cwd(), "../../apps/web/public/data/content.json"),
      "utf-8"
    )
    const content = JSON.parse(raw)
    posts = content.blog?.posts ?? []
  } catch {}

  const { data: likesData } = await getSupabase().from("post_likes").select("slug")
  const likesBySlugs: Record<string, number> = {}
  likesData?.forEach(({ slug }) => {
    likesBySlugs[slug] = (likesBySlugs[slug] ?? 0) + 1
  })

  const postsWithLikes = posts.map((p) => ({
    ...p,
    likes: likesBySlugs[p.slug] ?? 0,
  }))

  postsWithLikes.sort((a, b) => b.likes - a.likes)
  const totalLikes = postsWithLikes.reduce((a, p) => a + p.likes, 0)

  return { posts: postsWithLikes, totalLikes }
}

export default async function ContenidoPage() {
  const { posts, totalLikes } = await getContenidoData()

  return (
    <>
      <PageHeader
        title="Contenido"
        subtitle={`${posts.length} artículos · ${totalLikes} likes totales`}
      />
      <div className="flex flex-col gap-6 p-8">
        <ContenidoClient posts={posts} />
      </div>
    </>
  )
}
```

- [ ] **Step 2: Crear `ContenidoClient.tsx`**

```tsx
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
```

- [ ] **Step 3: Commit**

```bash
git add "apps/dashboard/app/(dashboard)/contenido/"
git commit -m "feat(dashboard): redesign Contenido with grid/table toggle + search + sort"
```

---

### Task 29: Agentes IA — sidebar + chat layout

**Files:**
- Modify: `apps/dashboard/app/(dashboard)/agentes/page.tsx`
- Modify: `apps/dashboard/components/AgentesClient.tsx`

- [ ] **Step 1: Rewrite page.tsx**

```tsx
// apps/dashboard/app/(dashboard)/agentes/page.tsx
import { PageHeader } from "@/components/ui/PageHeader"
import { AgentesClient } from "@/components/AgentesClient"

export default function AgentesPage() {
  return (
    <>
      <PageHeader title="Agentes IA" subtitle="Análisis de métricas con Claude" />
      <div className="flex min-h-0 flex-1 p-8">
        <AgentesClient />
      </div>
    </>
  )
}
```

- [ ] **Step 2: Refactor AgentesClient**

```tsx
// apps/dashboard/components/AgentesClient.tsx
"use client"
import { useState } from "react"
import { Bot, Send, Loader2, Plus, Sparkles, LineChart, Briefcase } from "lucide-react"
import { Button, Input } from "@heroui/react"
import { motion } from "framer-motion"
import { cn } from "@cerebros/lib"
import { TwoColumnLayout } from "./ui/TwoColumnLayout"
import { InfoCard } from "./ui/InfoCard"

interface Message {
  role: "user" | "assistant"
  content: string
}

const PRESETS = [
  {
    icon: LineChart,
    title: "Análisis semanal",
    prompt: "Haz un resumen de las métricas clave de esta semana",
  },
  {
    icon: Sparkles,
    title: "Estrategia de contenido",
    prompt: "Sugiere 5 temas de contenido basados en mis posts más populares",
  },
  {
    icon: Briefcase,
    title: "Review colaboraciones",
    prompt: "¿Qué colaboraciones debo priorizar esta semana?",
  },
]

export function AgentesClient() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  async function enviar(pregunta: string) {
    if (!pregunta.trim() || loading) return
    setInput("")
    setLoading(true)

    setMessages((prev) => [...prev, { role: "user", content: pregunta }])

    const res = await fetch("/api/agentes/analiza", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pregunta }),
    })

    const data = await res.json()
    const respuesta = res.ok ? data.respuesta : "Error al obtener respuesta."

    setMessages((prev) => [...prev, { role: "assistant", content: respuesta }])
    setLoading(false)
  }

  function resetChat() {
    setMessages([])
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col">
      <TwoColumnLayout
        leftWidth="narrow"
        left={
          <div className="flex flex-col gap-3">
            <Button
              variant="flat"
              startContent={<Plus className="h-3.5 w-3.5" />}
              className="justify-start rounded-xl bg-[var(--c-surface)] text-[13px]"
              onPress={resetChat}
            >
              Nueva conversación
            </Button>

            <InfoCard title="Presets" padded={false}>
              <div className="flex flex-col">
                {PRESETS.map((p) => (
                  <button
                    key={p.title}
                    onClick={() => enviar(p.prompt)}
                    className="flex items-start gap-3 border-b border-[var(--c-border)] px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[var(--c-surface-2)]"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--c-border)] bg-[var(--c-surface-2)]">
                      <p.icon className="h-3.5 w-3.5 text-[var(--c-text-muted)]" />
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-[var(--c-text)]">
                        {p.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[var(--c-text-muted)]">
                        {p.prompt.slice(0, 50)}...
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </InfoCard>
          </div>
        }
        right={
          <div className="flex min-h-[520px] flex-col rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-3 border-b border-[var(--c-border)] px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)]">
                <Bot className="h-4 w-4 text-[var(--c-text-muted)]" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-[var(--c-text)]">Claude</p>
                <p className="text-[11px] text-[var(--c-text-muted)]">
                  Análisis de métricas
                </p>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
              {messages.length === 0 && (
                <div className="flex flex-1 items-center justify-center">
                  <p className="text-center text-[13px] text-[var(--c-text-muted)]">
                    Elige un preset o escribe tu pregunta abajo.
                  </p>
                </div>
              )}

              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={cn(
                    "flex",
                    m.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[13px] leading-relaxed",
                      m.role === "user"
                        ? "bg-[var(--c-invert)] text-[var(--c-invert-fg)]"
                        : "border border-[var(--c-border)] bg-[var(--c-surface-2)] text-[var(--c-text)]"
                    )}
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-[var(--c-text-muted)]" />
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                enviar(input)
              }}
              className="flex gap-2 border-t border-[var(--c-border)] p-3"
            >
              <Input
                value={input}
                onValueChange={setInput}
                placeholder="Pregunta algo sobre tus métricas..."
                isDisabled={loading}
                classNames={{
                  inputWrapper:
                    "bg-[var(--c-surface-2)] border border-[var(--c-border)] shadow-none",
                  input: "text-[13px]",
                }}
              />
              <Button
                type="submit"
                color="primary"
                isIconOnly
                isDisabled={loading || !input.trim()}
                className="rounded-xl"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </div>
        }
      />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add "apps/dashboard/app/(dashboard)/agentes/page.tsx" apps/dashboard/components/AgentesClient.tsx
git commit -m "feat(dashboard): redesign Agentes IA with sidebar (presets) + chat column"
```

---

### Task 30: Equipo — improved Clerk styling

**Files:**
- Modify: `apps/dashboard/app/(dashboard)/equipo/page.tsx`

- [ ] **Step 1: Reemplazar contenido**

```tsx
import { OrganizationProfile } from "@clerk/nextjs"
import { getUserRole } from "@/lib/clerk"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/ui/PageHeader"

export default async function EquipoPage() {
  const role = await getUserRole()
  if (role !== "owner") redirect("/")

  return (
    <>
      <PageHeader
        title="Equipo"
        subtitle="Administra los miembros de tu organización"
      />
      <div className="p-8">
        <OrganizationProfile
          appearance={{
            elements: {
              rootBox: "w-full",
              card: {
                background: "var(--c-surface)",
                border: "1px solid var(--c-border)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                borderRadius: "16px",
                width: "100%",
              },
              navbar: { display: "none" },
              pageScrollBox: { padding: "24px" },
              headerTitle: { color: "var(--c-text)", fontSize: "15px" },
              headerSubtitle: { color: "var(--c-text-muted)", fontSize: "13px" },
              profileSectionTitleText: { color: "var(--c-text)" },
              profileSectionContent: { color: "var(--c-text-muted)" },
            },
          }}
        />
      </div>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add "apps/dashboard/app/(dashboard)/equipo/page.tsx"
git commit -m "feat(dashboard): improve Equipo styling with PageHeader + themed Clerk"
```

---

## PHASE 6 — Cleanup + verify

### Task 31: Delete deprecated MetricCard

**Files:**
- Delete: `apps/dashboard/components/MetricCard.tsx`

- [ ] **Step 1: Verificar que nadie lo importa**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Landing"
grep -r "from.*MetricCard" apps/dashboard --include="*.tsx" --include="*.ts" | grep -v node_modules
```

Expected: Zero matches. Si hay algún match, actualizar ese archivo a `StatCard` antes de seguir.

- [ ] **Step 2: Eliminar archivo**

```bash
rm apps/dashboard/components/MetricCard.tsx
```

- [ ] **Step 3: Commit**

```bash
git add -A apps/dashboard/components/
git commit -m "chore(dashboard): remove deprecated MetricCard (replaced by StatCard)"
```

---

### Task 32: Build + type check + visual pass

**Files:**
- No file changes — verification only

- [ ] **Step 1: Type check**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Landing/apps/dashboard"
npx tsc --noEmit
```

Expected: Zero errors. Si hay errores de `@heroui/react` types, resolver uno por uno.

- [ ] **Step 2: Production build**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Landing"
npm run build --workspace=apps/dashboard
```

Expected: All routes compile. Output similar a:
```
Route (app)                              Size     First Load JS
┌ ƒ /                                    ...
├ ƒ /analytics                           ...
├ ƒ /newsletter                          ...
├ ƒ /colaboraciones                      ...
├ ƒ /colaboraciones/new                  ...
├ ƒ /contenido                           ...
├ ƒ /agentes                             ...
├ ƒ /equipo                              ...
└ ○ /sign-in                             ...
```

- [ ] **Step 3: Visual smoke test en dev**

```bash
cd "/Users/oscar/Documents/Proyectos/Cerebros Esponjosos/Sitio/Landing"
npm run dev --workspace=apps/dashboard
```

Abrir http://localhost:3002 y navegar cada ruta:
- `/` — Ver quick actions + stat cards con counter animado + activity feed
- `/analytics` — Ver tabs con transiciones
- `/newsletter` — Ver master-detail, click en suscriptor cambia detalle
- `/colaboraciones` — Ver stats row + kanban con hover effects
- `/colaboraciones/new` — Ver form con cards + HeroUI inputs
- `/contenido` — Ver grid/table toggle
- `/agentes` — Ver sidebar con presets + chat
- `/equipo` — Ver Clerk embebido estilizado

Verificar dark y light mode (cambiar prefers-color-scheme en OS).

- [ ] **Step 4: Push branch**

```bash
git push origin feature/dashboard
```

- [ ] **Step 5: Confirm PR updated**

Abrir https://github.com/OscarTru/cerebros_landing/pull/15 — verificar commits nuevos y CI.

---

## Notas para el ejecutor

- **Orden es importante**: Phase 1 → 2 → 3 → 4 → 5 → 6. Las páginas de Phase 5 importan componentes de Phase 2-4.
- **Cero inline styles**: si necesitas un estilo que Tailwind no cubre, úsalo como `style={{}}` SOLO para `backgroundImage` con gradients custom. Para todo lo demás: Tailwind.
- **HeroUI classNames**: siempre usar prop `classNames` (plural) para personalizar partes internas. Nunca sobreescribir con `!important`.
- **Dark/light**: usar SIEMPRE `var(--c-*)` tokens. Nunca hardcodear `#fff` o `#000`.
- **Commits frecuentes**: al final de cada task, commit. Si una task falla el build, investiga antes de seguir.
- **No mezclar tasks**: un commit por task mantiene el historial limpio y el rollback fácil.
