# Dashboard Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `apps/dashboard` visual layer to match the landing's premium dark/light aesthetic — glassmorphism, radial glows, tight Inter typography, OS-driven light/dark mode — without adding any external UI libraries.

**Architecture:** Replace the flat/solid styling on all shell components (Sidebar, Header, MetricCard, KanbanBoard, KanbanCard) with glassmorphism using existing `--c-*` CSS custom property tokens. Add a `@media (prefers-color-scheme: light)` block to `globals.css` for the light theme, and remove the hardcoded `className="dark"` from the root layout so mode follows the OS automatically.

**Tech Stack:** Next.js 15 App Router, Tailwind CSS v4, CSS custom properties (`--c-*`), lucide-react icons, Clerk `UserButton`.

---

## File Map

| File | Action | What changes |
|------|--------|-------------|
| `apps/dashboard/app/globals.css` | Modify | Add light mode tokens via `@media (prefers-color-scheme: light)`, remove `.dark` block |
| `apps/dashboard/app/layout.tsx` | Modify | Remove `className="dark"` from `<html>` |
| `apps/dashboard/components/Sidebar.tsx` | Modify | Glassmorphism bg, ambient glow div, user section at bottom |
| `apps/dashboard/components/Header.tsx` | Modify | Transparent bg, tighter typography |
| `apps/dashboard/components/MetricCard.tsx` | Modify | Ambient glow, refined label/value/icon styles |
| `apps/dashboard/components/KanbanBoard.tsx` | Modify | Column bg token, header typography |
| `apps/dashboard/components/KanbanCard.tsx` | Modify | Glassmorphism surface, refined select styling |

No new files. No new dependencies.

---

### Task 1: Light/dark CSS tokens + remove hardcoded dark class

**Files:**
- Modify: `apps/dashboard/app/globals.css`
- Modify: `apps/dashboard/app/layout.tsx`

- [ ] **Step 1: Update globals.css**

Replace the entire file content with:

```css
@import "tailwindcss";
@source "..";
@source "../../../packages/ui/src";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --font-serif: "Instrument Serif", ui-serif, Georgia, serif;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.5rem;
  --text-2xl: 2rem;

  --radius-sm: 0.5rem;
  --radius-md: 1rem;
  --radius-lg: 1.5rem;
  --radius-full: 9999px;
}

/* Dark mode (default) */
:root {
  --c-bg: #0a0a0b;
  --c-surface: rgba(255, 255, 255, 0.04);
  --c-surface-2: rgba(255, 255, 255, 0.07);
  --c-surface-3: rgba(255, 255, 255, 0.02);
  --c-border: rgba(255, 255, 255, 0.08);
  --c-border-strong: rgba(255, 255, 255, 0.16);
  --c-text: #f4f4f5;
  --c-text-muted: #a1a1aa;
  --c-text-subtle: #71717a;
  --c-text-faint: #3f3f46;
  --c-invert: #ffffff;
  --c-invert-fg: #000000;
  --c-glow: rgba(255, 255, 255, 0.06);
  --c-accent: rgba(255, 255, 255, 0.9);
}

/* Light mode — follows OS preference */
@media (prefers-color-scheme: light) {
  :root {
    --c-bg: #fafafa;
    --c-surface: rgba(0, 0, 0, 0.03);
    --c-surface-2: rgba(0, 0, 0, 0.06);
    --c-surface-3: rgba(0, 0, 0, 0.015);
    --c-border: rgba(0, 0, 0, 0.08);
    --c-border-strong: rgba(0, 0, 0, 0.16);
    --c-text: #0a0a0b;
    --c-text-muted: #52525b;
    --c-text-subtle: #71717a;
    --c-text-faint: #d4d4d8;
    --c-invert: #0a0a0b;
    --c-invert-fg: #ffffff;
    --c-glow: rgba(0, 0, 0, 0.04);
    --c-accent: rgba(0, 0, 0, 0.85);
  }
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  background-color: var(--c-bg);
  color: var(--c-text);
  overflow-x: clip;
}

body {
  background-color: var(--c-bg);
  color: var(--c-text);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100dvh;
}

:focus-visible {
  outline: 1px solid var(--c-border-strong);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Glass card utility */
.glass {
  background: var(--c-surface);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--c-border);
}

.glass-strong {
  background: var(--c-surface-2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--c-border-strong);
}

/* Subtle noise texture */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 0;
}
```

- [ ] **Step 2: Remove `className="dark"` from layout.tsx**

In `apps/dashboard/app/layout.tsx`, change:
```tsx
<html lang="es" className="dark">
```
to:
```tsx
<html lang="es">
```

- [ ] **Step 3: Verify dev server renders correct theme**

Start the dev server if not running:
```bash
cd apps/dashboard && node_modules/.bin/next dev -p 3002
```
Open http://localhost:3002. If your OS is in dark mode, background should be `#0a0a0b`. If OS is in light mode, background should be `#fafafa`. Toggle OS appearance to confirm both work.

- [ ] **Step 4: Commit**

```bash
git add apps/dashboard/app/globals.css apps/dashboard/app/layout.tsx
git commit -m "style(dashboard): add light mode tokens, remove hardcoded dark class"
```

---

### Task 2: Sidebar — glassmorphism + ambient glow + user section

**Files:**
- Modify: `apps/dashboard/components/Sidebar.tsx`

- [ ] **Step 1: Replace Sidebar.tsx with the redesigned version**

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
    <aside
      className="w-56 shrink-0 h-screen sticky top-0 flex flex-col"
      style={{
        background: "var(--c-surface)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRight: "1px solid var(--c-border)",
        position: "relative",
      }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-60px",
          left: "-40px",
          width: "240px",
          height: "240px",
          background: "radial-gradient(circle, var(--c-glow) 0%, transparent 65%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Branding */}
        <div
          className="px-4 py-5"
          style={{ borderBottom: "1px solid var(--c-border)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="shrink-0 rounded-md"
              style={{
                width: 24,
                height: 24,
                background: "var(--c-invert)",
              }}
            />
            <div>
              <p className="text-xs font-semibold" style={{ color: "var(--c-text)", letterSpacing: "-0.01em" }}>
                Cerebros Esponjosos
              </p>
              <p style={{ fontSize: "10px", color: "var(--c-text-subtle)", marginTop: 1 }}>
                Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-3 flex flex-col gap-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                  active
                    ? "font-medium"
                    : "hover:bg-[var(--c-surface-2)]"
                )}
                style={
                  active
                    ? {
                        background: "var(--c-invert)",
                        color: "var(--c-invert-fg)",
                      }
                    : {
                        color: "var(--c-text-muted)",
                      }
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div
          className="px-4 py-3 flex items-center gap-2.5"
          style={{ borderTop: "1px solid var(--c-border)" }}
        >
          <UserButton
            appearance={{
              elements: { avatarBox: "w-7 h-7" },
            }}
          />
        </div>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Check sidebar renders correctly in browser**

Open http://localhost:3002. The sidebar should have a semi-transparent glass background, a subtle top-left glow, a white/black square logo, and the active item should be a solid pill (white in dark mode, black in light mode).

- [ ] **Step 3: Commit**

```bash
git add apps/dashboard/components/Sidebar.tsx
git commit -m "style(dashboard): glassmorphism sidebar with ambient glow"
```

---

### Task 3: Header — transparent background + tight typography

**Files:**
- Modify: `apps/dashboard/components/Header.tsx`

- [ ] **Step 1: Replace Header.tsx**

```tsx
import { UserButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"

export async function Header({ title }: { title: string }) {
  const { userId } = await auth()

  return (
    <header
      className="h-14 flex items-center justify-between px-6 shrink-0"
      style={{
        borderBottom: "1px solid var(--c-border)",
        background: "var(--c-bg)",
      }}
    >
      <h1
        className="text-sm font-semibold"
        style={{ color: "var(--c-text)", letterSpacing: "-0.01em" }}
      >
        {title}
      </h1>
      {userId && (
        <UserButton
          appearance={{
            elements: { avatarBox: "w-8 h-8" },
          }}
        />
      )}
    </header>
  )
}
```

- [ ] **Step 2: Verify in browser**

The header at http://localhost:3002 should match the page background (`var(--c-bg)`), with a subtle bottom border and tight heading text.

- [ ] **Step 3: Commit**

```bash
git add apps/dashboard/components/Header.tsx
git commit -m "style(dashboard): transparent header with tight typography"
```

---

### Task 4: MetricCard — ambient glow + refined typography

**Files:**
- Modify: `apps/dashboard/components/MetricCard.tsx`

- [ ] **Step 1: Replace MetricCard.tsx**

```tsx
import { cn } from "@cerebros/lib"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  label: string
  value: string | number
  sublabel?: string
  icon?: LucideIcon
  trend?: { value: number; label: string }
  className?: string
}

export function MetricCard({
  label,
  value,
  sublabel,
  icon: Icon,
  trend,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn("rounded-xl p-5 relative overflow-hidden", className)}
      style={{
        background: "var(--c-surface)",
        border: "1px solid var(--c-border)",
      }}
    >
      {/* Ambient glow top-right */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-24px",
          right: "-24px",
          width: "100px",
          height: "100px",
          background: "radial-gradient(circle, var(--c-glow) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="flex items-start justify-between relative">
        <div>
          <p
            className="font-medium uppercase"
            style={{
              fontSize: "10px",
              letterSpacing: "0.08em",
              color: "var(--c-text-subtle)",
            }}
          >
            {label}
          </p>
          <p
            className="text-2xl font-semibold mt-1"
            style={{ color: "var(--c-text)", letterSpacing: "-0.03em" }}
          >
            {value}
          </p>
          {sublabel && (
            <p className="text-xs mt-0.5" style={{ color: "var(--c-text-faint)" }}>
              {sublabel}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className="p-2 rounded-lg"
            style={{
              background: "var(--c-surface-2)",
              border: "1px solid var(--c-border)",
            }}
          >
            <Icon className="w-4 h-4" style={{ color: "var(--c-text-muted)" }} />
          </div>
        )}
      </div>

      {trend && (
        <div
          className="mt-3 pt-3 flex items-center gap-1"
          style={{ borderTop: "1px solid var(--c-border)" }}
        >
          <span
            className="text-xs font-medium"
            style={{ color: trend.value >= 0 ? "#10b981" : "#ef4444" }}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}%
          </span>
          <span className="text-xs" style={{ color: "var(--c-text-subtle)" }}>
            {trend.label}
          </span>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Open http://localhost:3002 (Overview page). Each metric card should have a subtle corner glow, a glass surface, a 10px uppercase label, a large tight value number, and a bordered icon container.

- [ ] **Step 3: Commit**

```bash
git add apps/dashboard/components/MetricCard.tsx
git commit -m "style(dashboard): metric card ambient glow and refined typography"
```

---

### Task 5: KanbanBoard + KanbanCard — glass surface + refined column headers

**Files:**
- Modify: `apps/dashboard/components/KanbanBoard.tsx`
- Modify: `apps/dashboard/components/KanbanCard.tsx`

- [ ] **Step 1: Replace KanbanBoard.tsx**

```tsx
"use client"
import { useState, useCallback } from "react"
import { KanbanCard } from "./KanbanCard"
import type { Colaboracion } from "@cerebros/lib"

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {COLUMNAS.map(({ id, label }) => {
        const items = colaboraciones.filter((c) => c.estado === id)
        return (
          <div
            key={id}
            className="rounded-xl p-3 flex flex-col gap-3"
            style={{
              background: "var(--c-surface-3)",
              border: "1px solid var(--c-border)",
            }}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-1">
              <h3
                className="font-medium uppercase"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.08em",
                  color: "var(--c-text-subtle)",
                }}
              >
                {label}
              </h3>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  color: "var(--c-text-faint)",
                  background: "var(--c-surface-2)",
                  fontSize: "10px",
                }}
              >
                {items.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2 min-h-24">
              {items.map((c) => (
                <KanbanCard
                  key={c.id}
                  colaboracion={c}
                  onEstadoChange={handleEstadoChange}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Replace KanbanCard.tsx**

```tsx
"use client"
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
    <div
      className="rounded-xl p-4 flex flex-col gap-3 transition-colors"
      style={{
        background: "var(--c-surface)",
        border: "1px solid var(--c-border)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--c-border-strong)"
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--c-border)"
      }}
    >
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--c-text)" }}>
          {colaboracion.marca}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--c-text-muted)" }}>
          {colaboracion.tipo}
        </p>
      </div>

      {colaboracion.valor_mxn && (
        <p className="text-sm font-semibold" style={{ color: "var(--c-text)" }}>
          ${colaboracion.valor_mxn.toLocaleString("es-MX")} MXN
        </p>
      )}

      {colaboracion.notas && (
        <p
          className="text-xs line-clamp-2"
          style={{ color: "var(--c-text-subtle)" }}
        >
          {colaboracion.notas}
        </p>
      )}

      <select
        value={colaboracion.estado}
        onChange={(e) =>
          onEstadoChange(colaboracion.id, e.target.value as Colaboracion["estado"])
        }
        className="w-full text-xs rounded-lg px-2 py-1.5 cursor-pointer"
        style={{
          background: "var(--c-surface-2)",
          border: "1px solid var(--c-border)",
          color: "var(--c-text)",
        }}
      >
        {ESTADOS.map((e) => (
          <option key={e} value={e}>
            {e.replace("_", " ")}
          </option>
        ))}
      </select>
    </div>
  )
}
```

- [ ] **Step 3: Verify in browser**

Navigate to http://localhost:3002/colaboraciones. Columns should have a very faint background (`--c-surface-3`), tiny uppercase headers, and cards with glass surface that highlight their border on hover.

- [ ] **Step 4: Commit**

```bash
git add apps/dashboard/components/KanbanBoard.tsx apps/dashboard/components/KanbanCard.tsx
git commit -m "style(dashboard): kanban glass columns and cards"
```

---

### Task 6: Build verification + push

**Files:**
- No file changes — verification only

- [ ] **Step 1: Run production build**

```bash
npm run build --workspace=apps/dashboard
```

Expected: Build completes with 0 TypeScript errors. Should see output like:
```
Route (app)                              Size     First Load JS
┌ ○ /_not-found                          ...
├ ƒ /                                    ...
...
```

- [ ] **Step 2: Check all routes compile**

Expected routes present in build output:
- `/` (overview)
- `/analytics`
- `/newsletter`
- `/colaboraciones`
- `/colaboraciones/new`
- `/contenido`
- `/agentes`
- `/equipo`
- `/sign-in`

- [ ] **Step 3: Push branch**

```bash
git push origin feature/dashboard
```

- [ ] **Step 4: Verify PR on GitHub**

Open https://github.com/OscarTru/cerebros_landing/pull/15 — confirm new commits appear and CI (if any) is passing.
