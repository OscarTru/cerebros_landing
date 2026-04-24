# Dashboard — Cerebros Esponjosos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear `apps/dashboard` — una app Next.js 15 privada en `dashboard.cerebrosesponjosos.com` con autenticación Clerk y módulos de Analytics, Newsletter, Colaboraciones, Contenido, Agentes IA y Equipo.

**Architecture:** Nueva app Next.js 15 App Router dentro del mismo monorepo Turborepo, comparte `@cerebros/ui`, `@cerebros/lib` y `@cerebros/config` con `apps/web`. Middleware de Next.js protege todas las rutas — ninguna página es accesible sin sesión Clerk activa. Supabase sigue siendo el backend de datos, con tres tablas nuevas: `colaboraciones`, `newsletter_sends`, `agent_logs`.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, Clerk (auth + roles), Supabase, Resend, Anthropic API (Claude), `@cerebros/ui`, `@cerebros/lib`

**Env vars requeridas en `apps/dashboard/.env.local`:**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
SUPABASE_URL=https://ryllpsxbelcofyyagfch.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RESEND_API_KEY=re_...
ANTHROPIC_API_KEY=sk-ant-...
```

---

## File Map

| File | Acción | Responsabilidad |
|------|--------|-----------------|
| `apps/dashboard/package.json` | Crear | Dependencias del dashboard |
| `apps/dashboard/tsconfig.json` | Crear | TypeScript config extendiendo `@cerebros/config` |
| `apps/dashboard/next.config.ts` | Crear | Config de Next.js, transpilePackages |
| `apps/dashboard/middleware.ts` | Crear | Clerk auth middleware — protege todas las rutas |
| `apps/dashboard/app/layout.tsx` | Crear | Root layout con ClerkProvider + fuentes |
| `apps/dashboard/app/globals.css` | Crear | Tailwind v4 + design tokens (mismo sistema que apps/web) |
| `apps/dashboard/app/(auth)/sign-in/page.tsx` | Crear | Página de login con SignIn de Clerk |
| `apps/dashboard/app/(dashboard)/layout.tsx` | Crear | Layout con sidebar + header compartido |
| `apps/dashboard/app/(dashboard)/page.tsx` | Crear | Overview / home con métricas rápidas |
| `apps/dashboard/app/(dashboard)/analytics/page.tsx` | Crear | Estadísticas de IG, YouTube, blog |
| `apps/dashboard/app/(dashboard)/newsletter/page.tsx` | Crear | Lista de suscriptores |
| `apps/dashboard/app/(dashboard)/colaboraciones/page.tsx` | Crear | Pipeline kanban de marcas |
| `apps/dashboard/app/(dashboard)/colaboraciones/new/page.tsx` | Crear | Formulario nueva colaboración |
| `apps/dashboard/app/(dashboard)/contenido/page.tsx` | Crear | Posts del blog con métricas de likes |
| `apps/dashboard/app/(dashboard)/agentes/page.tsx` | Crear | Config de agentes IA (Claude) |
| `apps/dashboard/app/(dashboard)/equipo/page.tsx` | Crear | Gestión de miembros (owner only) |
| `apps/dashboard/app/api/colaboraciones/route.ts` | Crear | CRUD colaboraciones — Supabase |
| `apps/dashboard/app/api/agentes/analiza/route.ts` | Crear | Análisis de métricas con Claude API |
| `apps/dashboard/components/Sidebar.tsx` | Crear | Navegación lateral |
| `apps/dashboard/components/Header.tsx` | Crear | Header con usuario + logout |
| `apps/dashboard/components/KanbanBoard.tsx` | Crear | Board de colaboraciones |
| `apps/dashboard/components/KanbanCard.tsx` | Crear | Tarjeta individual de colaboración |
| `apps/dashboard/components/MetricCard.tsx` | Crear | Card de métrica reutilizable |
| `apps/dashboard/lib/supabase.ts` | Crear | Cliente Supabase server-side |
| `apps/dashboard/lib/clerk.ts` | Crear | Helpers de roles Clerk |
| `packages/lib/src/types.ts` | Modificar | Añadir tipos `Colaboracion`, `NewsletterSubscriber`, `AgentLog` |

---

## Task 1: Scaffold de la app — package.json, tsconfig, next.config

**Files:**
- Create: `apps/dashboard/package.json`
- Create: `apps/dashboard/tsconfig.json`
- Create: `apps/dashboard/next.config.ts`

- [ ] **Step 1: Crear `apps/dashboard/package.json`**

```json
{
  "name": "@cerebros/dashboard",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3002",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@cerebros/lib": "*",
    "@cerebros/ui": "*",
    "@clerk/nextjs": "^6.0.0",
    "@supabase/supabase-js": "^2.103.0",
    "@anthropic-ai/sdk": "^0.39.0",
    "resend": "^6.10.0",
    "lucide-react": "^1.8.0",
    "next": "^15.0.0",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@cerebros/config": "*",
    "@tailwindcss/postcss": "^4.2.2",
    "@types/node": "^24.12.2",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "eslint-config-next": "^16.2.3",
    "tailwindcss": "^4.2.2",
    "typescript": "~5.8.2"
  }
}
```

- [ ] **Step 2: Crear `apps/dashboard/tsconfig.json`**

```json
{
  "extends": "@cerebros/config/tsconfig/nextjs",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Crear `apps/dashboard/next.config.ts`**

```typescript
import type { NextConfig } from "next"

const config: NextConfig = {
  transpilePackages: ["@cerebros/lib", "@cerebros/ui"],
  outputFileTracingRoot: require("path").join(__dirname, "../../"),
}

export default config
```

- [ ] **Step 4: Instalar dependencias desde la raíz del monorepo**

```bash
npm install
```

Expected: Las dependencias del dashboard se instalan dentro de `node_modules` del workspace. No debe haber errores de resolución.

- [ ] **Step 5: Verificar que turbo reconoce la nueva app**

```bash
npx turbo run build --filter=@cerebros/dashboard --dry
```

Expected: Output muestra `@cerebros/dashboard` en el grafo de tareas.

- [ ] **Step 6: Commit**

```bash
git add apps/dashboard/package.json apps/dashboard/tsconfig.json apps/dashboard/next.config.ts package-lock.json
git commit -m "feat(dashboard): scaffold app — package.json, tsconfig, next.config"
```

---

## Task 2: Globals CSS y design tokens

**Files:**
- Create: `apps/dashboard/app/globals.css`

- [ ] **Step 1: Crear `apps/dashboard/app/globals.css`**

Copia exacta del sistema de tokens de `apps/web` — mismo diseño visual:

```css
@import "tailwindcss";
@source "../../../packages/ui/src";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
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

:root {
  --c-bg: #fafaf9;
  --c-surface: #f4f4f5;
  --c-surface-2: rgba(0, 0, 0, 0.04);
  --c-surface-3: rgba(255, 255, 255, 0.6);
  --c-border: rgba(0, 0, 0, 0.08);
  --c-border-strong: rgba(0, 0, 0, 0.18);
  --c-text: #18181b;
  --c-text-muted: #52525b;
  --c-text-subtle: #71717a;
  --c-text-faint: #a1a1aa;
  --c-invert: #18181b;
  --c-invert-fg: #ffffff;
}

.dark {
  --c-bg: #0a0a0b;
  --c-surface: #111113;
  --c-surface-2: rgba(255, 255, 255, 0.05);
  --c-surface-3: rgba(0, 0, 0, 0.4);
  --c-border: rgba(255, 255, 255, 0.08);
  --c-border-strong: rgba(255, 255, 255, 0.18);
  --c-text: #fafaf9;
  --c-text-muted: #a1a1aa;
  --c-text-subtle: #71717a;
  --c-text-faint: #3f3f46;
  --c-invert: #fafaf9;
  --c-invert-fg: #0a0a0b;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: var(--c-bg);
  color: var(--c-text);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/app/globals.css
git commit -m "feat(dashboard): add globals.css with design tokens"
```

---

## Task 3: Root layout y ClerkProvider

**Files:**
- Create: `apps/dashboard/app/layout.tsx`

- [ ] **Step 1: Crear `apps/dashboard/app/layout.tsx`**

```tsx
import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import "@/app/globals.css"

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | Cerebros Esponjosos" },
  description: "Panel de administración de Cerebros Esponjosos",
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="es">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
          />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/app/layout.tsx
git commit -m "feat(dashboard): root layout with ClerkProvider"
```

---

## Task 4: Middleware de autenticación Clerk

**Files:**
- Create: `apps/dashboard/middleware.ts`

- [ ] **Step 1: Crear `apps/dashboard/middleware.ts`**

El middleware protege todas las rutas excepto `/sign-in`:

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isPublicRoute = createRouteMatcher(["/sign-in(.*)"])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
```

- [ ] **Step 2: Crear `apps/dashboard/app/(auth)/sign-in/page.tsx`**

```tsx
import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--c-bg)]">
      <SignIn
        appearance={{
          elements: {
            card: "bg-[var(--c-surface)] border border-[var(--c-border)] shadow-none rounded-2xl",
            headerTitle: "text-[var(--c-text)] font-semibold",
            headerSubtitle: "text-[var(--c-text-muted)]",
            formButtonPrimary: "bg-[var(--c-invert)] text-[var(--c-invert-fg)] hover:opacity-90",
            footerAction: "hidden",
          },
        }}
      />
    </div>
  )
}
```

- [ ] **Step 3: Verificar que `apps/dashboard` arranca sin errores**

```bash
npm run dev --workspace=apps/dashboard
```

Abrir `http://localhost:3002` — debe redirigir a `/sign-in`. Expected: página de login de Clerk visible.

- [ ] **Step 4: Commit**

```bash
git add apps/dashboard/middleware.ts apps/dashboard/app/\(auth\)/sign-in/page.tsx
git commit -m "feat(dashboard): Clerk middleware + sign-in page"
```

---

## Task 5: Tipos compartidos en packages/lib

**Files:**
- Modify: `packages/lib/src/types.ts`

- [ ] **Step 1: Leer el contenido actual de `packages/lib/src/types.ts`**

```bash
cat packages/lib/src/types.ts
```

- [ ] **Step 2: Añadir los tipos nuevos al final del archivo**

Agregar después del contenido existente:

```typescript
// ─── Dashboard types ────────────────────────────────────────────

export type ColaboracionEstado =
  | "prospecto"
  | "en_negociacion"
  | "confirmada"
  | "cerrada"

export type ColaboracionTipo =
  | "reels"
  | "stories"
  | "post_estatico"
  | "podcast"
  | "newsletter"
  | "paquete"

export interface Colaboracion {
  id: string
  marca: string
  tipo: ColaboracionTipo
  valor_mxn: number | null
  estado: ColaboracionEstado
  notas: string | null
  contacto_nombre: string | null
  contacto_email: string | null
  fecha_inicio: string | null
  fecha_cierre: string | null
  created_at: string
  updated_at: string
}

export interface NewsletterSubscriber {
  id: string
  email: string
  nombre: string | null
  confirmed: boolean
  created_at: string
}

export interface AgentLog {
  id: string
  tipo: "analisis_metricas" | "respuesta_comentario" | "sugerencia_colaboracion"
  input: string
  output: string
  modelo: string
  tokens_input: number
  tokens_output: number
  created_at: string
}
```

- [ ] **Step 3: Asegurarse de que el tipo se exporta desde el índice**

```bash
grep "types" packages/lib/src/index.ts
```

Expected: debe mostrar `export * from "./types"` — si no existe, añadirlo.

- [ ] **Step 4: Commit**

```bash
git add packages/lib/src/types.ts
git commit -m "feat(lib): add Colaboracion, NewsletterSubscriber, AgentLog types"
```

---

## Task 6: Supabase — tablas nuevas y cliente del dashboard

**Files:**
- Create: `apps/dashboard/lib/supabase.ts`

- [ ] **Step 1: Crear las tablas en Supabase**

Ir a `https://ryllpsxbelcofyyagfch.supabase.co` → SQL Editor y ejecutar:

```sql
-- Tabla colaboraciones
create table if not exists colaboraciones (
  id uuid primary key default gen_random_uuid(),
  marca text not null,
  tipo text not null check (tipo in ('reels','stories','post_estatico','podcast','newsletter','paquete')),
  valor_mxn numeric(10,2),
  estado text not null default 'prospecto' check (estado in ('prospecto','en_negociacion','confirmada','cerrada')),
  notas text,
  contacto_nombre text,
  contacto_email text,
  fecha_inicio date,
  fecha_cierre date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger para updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger colaboraciones_updated_at
  before update on colaboraciones
  for each row execute function update_updated_at();

-- Tabla newsletter_sends
create table if not exists newsletter_sends (
  id uuid primary key default gen_random_uuid(),
  asunto text not null,
  cuerpo_html text not null,
  destinatarios_count integer not null default 0,
  enviado_por text not null,
  created_at timestamptz not null default now()
);

-- Tabla agent_logs
create table if not exists agent_logs (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('analisis_metricas','respuesta_comentario','sugerencia_colaboracion')),
  input text not null,
  output text not null,
  modelo text not null,
  tokens_input integer not null default 0,
  tokens_output integer not null default 0,
  created_at timestamptz not null default now()
);

-- RLS desactivado (el dashboard usa service_role key — acceso total)
alter table colaboraciones disable row level security;
alter table newsletter_sends disable row level security;
alter table agent_logs disable row level security;
```

- [ ] **Step 2: Crear `apps/dashboard/lib/supabase.ts`**

```typescript
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Singleton — no crear en cada request
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
})
```

- [ ] **Step 3: Crear `apps/dashboard/lib/clerk.ts`**

Helper para leer el rol del usuario desde los metadatos de Clerk:

```typescript
import { auth } from "@clerk/nextjs/server"

export type DashboardRole = "owner" | "editor" | "viewer"

export async function getUserRole(): Promise<DashboardRole> {
  const { sessionClaims } = await auth()
  const role = (sessionClaims?.metadata as { role?: string })?.role
  if (role === "owner" || role === "editor" || role === "viewer") return role
  return "viewer" // default
}

export async function requireRole(minRole: DashboardRole): Promise<void> {
  const role = await getUserRole()
  const hierarchy: DashboardRole[] = ["viewer", "editor", "owner"]
  if (hierarchy.indexOf(role) < hierarchy.indexOf(minRole)) {
    throw new Error(`Acceso denegado: se requiere rol ${minRole}`)
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/dashboard/lib/supabase.ts apps/dashboard/lib/clerk.ts
git commit -m "feat(dashboard): Supabase client + Clerk role helpers"
```

---

## Task 7: Layout del dashboard — Sidebar y Header

**Files:**
- Create: `apps/dashboard/components/Sidebar.tsx`
- Create: `apps/dashboard/components/Header.tsx`
- Create: `apps/dashboard/app/(dashboard)/layout.tsx`

- [ ] **Step 1: Crear `apps/dashboard/components/Sidebar.tsx`**

```tsx
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
    <aside className="w-60 shrink-0 h-screen sticky top-0 bg-[var(--c-surface)] border-r border-[var(--c-border)] flex flex-col">
      <div className="px-5 py-6 border-b border-[var(--c-border)]">
        <span className="text-sm font-semibold text-[var(--c-text)]">
          Cerebros Esponjosos
        </span>
        <p className="text-xs text-[var(--c-text-muted)] mt-0.5">Dashboard</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-[var(--c-invert)] text-[var(--c-invert-fg)]"
                  : "text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)] hover:text-[var(--c-text)]"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 2: Crear `apps/dashboard/components/Header.tsx`**

```tsx
import { UserButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"

export async function Header({ title }: { title: string }) {
  const { userId } = await auth()

  return (
    <header className="h-14 border-b border-[var(--c-border)] bg-[var(--c-bg)] flex items-center justify-between px-6 shrink-0">
      <h1 className="text-sm font-semibold text-[var(--c-text)]">{title}</h1>
      <div className="flex items-center gap-3">
        {userId && (
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
        )}
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Crear `apps/dashboard/app/(dashboard)/layout.tsx`**

```tsx
import { Sidebar } from "@/components/Sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--c-bg)]">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-auto">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Crear `apps/dashboard/components/MetricCard.tsx`**

Componente reutilizable para mostrar métricas:

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
      className={cn(
        "bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl p-5",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[var(--c-text-muted)] font-medium uppercase tracking-wide">
            {label}
          </p>
          <p className="text-2xl font-semibold text-[var(--c-text)] mt-1">{value}</p>
          {sublabel && (
            <p className="text-xs text-[var(--c-text-subtle)] mt-0.5">{sublabel}</p>
          )}
        </div>
        {Icon && (
          <div className="p-2 bg-[var(--c-surface-2)] rounded-lg">
            <Icon className="w-4 h-4 text-[var(--c-text-muted)]" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-[var(--c-border)]">
          <span
            className={cn(
              "text-xs font-medium",
              trend.value >= 0 ? "text-emerald-500" : "text-red-500"
            )}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}%
          </span>
          <span className="text-xs text-[var(--c-text-subtle)] ml-1">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/dashboard/components/ apps/dashboard/app/\(dashboard\)/layout.tsx
git commit -m "feat(dashboard): sidebar, header, MetricCard, dashboard layout"
```

---

## Task 8: Overview page (home del dashboard)

**Files:**
- Create: `apps/dashboard/app/(dashboard)/page.tsx`

- [ ] **Step 1: Crear `apps/dashboard/app/(dashboard)/page.tsx`**

```tsx
import { Header } from "@/components/Header"
import { MetricCard } from "@/components/MetricCard"
import { supabase } from "@/lib/supabase"
import { BarChart2, Mail, Handshake, Heart } from "lucide-react"

async function getOverviewData() {
  const [subscribersRes, colaboracionesRes, likesRes] = await Promise.all([
    supabase.from("suscriptores").select("id", { count: "exact", head: true }),
    supabase
      .from("colaboraciones")
      .select("estado")
      .in("estado", ["en_negociacion", "confirmada"]),
    supabase.from("post_likes").select("id", { count: "exact", head: true }),
  ])

  return {
    subscribers: subscribersRes.count ?? 0,
    colaboracionesActivas: colaboracionesRes.data?.length ?? 0,
    totalLikes: likesRes.count ?? 0,
  }
}

export default async function OverviewPage() {
  const data = await getOverviewData()

  return (
    <>
      <Header title="Overview" />
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-[var(--c-text)]">
            Bienvenido de vuelta
          </h2>
          <p className="text-sm text-[var(--c-text-muted)] mt-0.5">
            Aquí tienes un resumen de tu contenido y audiencia.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            label="Suscriptores newsletter"
            value={data.subscribers.toLocaleString("es-MX")}
            icon={Mail}
          />
          <MetricCard
            label="Colaboraciones activas"
            value={data.colaboracionesActivas}
            sublabel="en negociación o confirmadas"
            icon={Handshake}
          />
          <MetricCard
            label="Likes en blog"
            value={data.totalLikes.toLocaleString("es-MX")}
            icon={Heart}
          />
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Verificar que el dashboard arranca y muestra la overview**

```bash
npm run dev --workspace=apps/dashboard
```

Abrir `http://localhost:3002`. Expected: Login de Clerk → tras autenticarse, ver la página Overview con las 3 MetricCards.

- [ ] **Step 3: Commit**

```bash
git add apps/dashboard/app/\(dashboard\)/page.tsx
git commit -m "feat(dashboard): overview page with key metrics"
```

---

## Task 9: Analytics page

**Files:**
- Create: `apps/dashboard/app/(dashboard)/analytics/page.tsx`

- [ ] **Step 1: Crear `apps/dashboard/app/(dashboard)/analytics/page.tsx`**

Lee `content.json` (generado por el script de fetch de `apps/web`) y datos de Supabase para mostrar métricas de Instagram, YouTube y blog:

```tsx
import { Header } from "@/components/Header"
import { MetricCard } from "@/components/MetricCard"
import { supabase } from "@/lib/supabase"
import { readFile } from "fs/promises"
import path from "path"
import { Instagram, Youtube, BookOpen, Heart } from "lucide-react"

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
  // Leer content.json generado por apps/web prebuild
  let content: ContentData = {}
  try {
    const contentPath = path.join(process.cwd(), "../../apps/web/public/data/content.json")
    const raw = await readFile(contentPath, "utf-8")
    content = JSON.parse(raw)
  } catch {
    // Si no existe, continuar con datos vacíos
  }

  // Datos de Supabase
  const [likesRes, topPostsRes] = await Promise.all([
    supabase.from("post_likes").select("slug"),
    supabase
      .from("post_likes")
      .select("slug")
      .then(({ data }) => {
        // Agrupar por slug y contar
        const counts: Record<string, number> = {}
        data?.forEach(({ slug }) => {
          counts[slug] = (counts[slug] ?? 0) + 1
        })
        return Object.entries(counts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([slug, count]) => ({ slug, count }))
      }),
  ])

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
    totalBlogLikes: likesRes.data?.length ?? 0,
    topPosts: topPostsRes,
  }
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData()

  return (
    <>
      <Header title="Analytics" />
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-base font-semibold text-[var(--c-text)]">Instagram</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <MetricCard
              label="Seguidores"
              value={data.igFollowers.toLocaleString("es-MX")}
              icon={Instagram}
            />
            <MetricCard
              label="Engagement promedio"
              value={data.igEngagement.toLocaleString("es-MX")}
              sublabel="likes + comments por post"
              icon={Instagram}
            />
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold text-[var(--c-text)]">YouTube</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <MetricCard
              label="Vistas totales"
              value={data.ytTotalViews.toLocaleString("es-MX")}
              icon={Youtube}
            />
            <MetricCard
              label="Videos"
              value={data.ytVideosCount}
              icon={Youtube}
            />
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold text-[var(--c-text)]">Blog</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <MetricCard
              label="Likes totales"
              value={data.totalBlogLikes.toLocaleString("es-MX")}
              icon={Heart}
            />
          </div>

          {data.topPosts.length > 0 && (
            <div className="mt-4 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-[var(--c-border)]">
                <p className="text-sm font-medium text-[var(--c-text)]">Posts más populares</p>
              </div>
              <ul className="divide-y divide-[var(--c-border)]">
                {data.topPosts.map(({ slug, count }, i) => (
                  <li key={slug} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[var(--c-text-faint)] w-4">{i + 1}</span>
                      <span className="text-sm text-[var(--c-text)]">{slug}</span>
                    </div>
                    <span className="text-sm font-medium text-[var(--c-text-muted)]">
                      {count} ❤️
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/app/\(dashboard\)/analytics/
git commit -m "feat(dashboard): analytics page — IG, YouTube, blog metrics"
```

---

## Task 10: Newsletter page

**Files:**
- Create: `apps/dashboard/app/(dashboard)/newsletter/page.tsx`

- [ ] **Step 1: Crear `apps/dashboard/app/(dashboard)/newsletter/page.tsx`**

```tsx
import { Header } from "@/components/Header"
import { supabase } from "@/lib/supabase"
import { MetricCard } from "@/components/MetricCard"
import { Mail, CheckCircle } from "lucide-react"
import type { NewsletterSubscriber } from "@cerebros/lib"

async function getSubscribers() {
  const { data, count } = await supabase
    .from("suscriptores")
    .select("id, email, nombre, confirmed, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(100)

  const confirmed = data?.filter((s) => s.confirmed).length ?? 0
  return { subscribers: (data ?? []) as NewsletterSubscriber[], total: count ?? 0, confirmed }
}

export default async function NewsletterPage() {
  const { subscribers, total, confirmed } = await getSubscribers()

  return (
    <>
      <Header title="Newsletter" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetricCard
            label="Total suscriptores"
            value={total.toLocaleString("es-MX")}
            icon={Mail}
          />
          <MetricCard
            label="Confirmados"
            value={confirmed.toLocaleString("es-MX")}
            sublabel={`${Math.round((confirmed / Math.max(total, 1)) * 100)}% del total`}
            icon={CheckCircle}
          />
        </div>

        <div className="bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--c-border)] flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--c-text)]">Suscriptores recientes</p>
            <p className="text-xs text-[var(--c-text-muted)]">Últimos {subscribers.length}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--c-border)]">
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-[var(--c-text-muted)]">Email</th>
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-[var(--c-text-muted)]">Nombre</th>
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-[var(--c-text-muted)]">Estado</th>
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-[var(--c-text-muted)]">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--c-border)]">
                {subscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-[var(--c-surface-2)]">
                    <td className="px-5 py-3 text-[var(--c-text)]">{s.email}</td>
                    <td className="px-5 py-3 text-[var(--c-text-muted)]">{s.nombre ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          s.confirmed
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {s.confirmed ? "Confirmado" : "Pendiente"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[var(--c-text-muted)]">
                      {new Date(s.created_at).toLocaleDateString("es-MX", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/app/\(dashboard\)/newsletter/
git commit -m "feat(dashboard): newsletter page with subscriber list"
```

---

## Task 11: API de Colaboraciones

**Files:**
- Create: `apps/dashboard/app/api/colaboraciones/route.ts`

- [ ] **Step 1: Crear `apps/dashboard/app/api/colaboraciones/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { supabase } from "@/lib/supabase"
import { z } from "zod"

export const runtime = "nodejs"

const ColaboracionSchema = z.object({
  marca: z.string().min(1),
  tipo: z.enum(["reels", "stories", "post_estatico", "podcast", "newsletter", "paquete"]),
  valor_mxn: z.number().nullable().optional(),
  estado: z.enum(["prospecto", "en_negociacion", "confirmada", "cerrada"]).default("prospecto"),
  notas: z.string().nullable().optional(),
  contacto_nombre: z.string().nullable().optional(),
  contacto_email: z.string().email().nullable().optional(),
  fecha_inicio: z.string().nullable().optional(),
  fecha_cierre: z.string().nullable().optional(),
})

// GET /api/colaboraciones — lista todas
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data, error } = await supabase
    .from("colaboraciones")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/colaboraciones — crea una nueva
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = ColaboracionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("colaboraciones")
    .insert(parsed.data)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// PATCH /api/colaboraciones?id=<uuid> — actualiza estado u otros campos
export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 })

  const body = await req.json()
  const parsed = ColaboracionSchema.partial().safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("colaboraciones")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/colaboraciones?id=<uuid>
export async function DELETE(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 })

  const { error } = await supabase.from("colaboraciones").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/app/api/colaboraciones/
git commit -m "feat(dashboard): API CRUD colaboraciones"
```

---

## Task 12: KanbanBoard y página de Colaboraciones

**Files:**
- Create: `apps/dashboard/components/KanbanCard.tsx`
- Create: `apps/dashboard/components/KanbanBoard.tsx`
- Create: `apps/dashboard/app/(dashboard)/colaboraciones/page.tsx`
- Create: `apps/dashboard/app/(dashboard)/colaboraciones/new/page.tsx`

- [ ] **Step 1: Crear `apps/dashboard/components/KanbanCard.tsx`**

```tsx
"use client"
import type { Colaboracion } from "@cerebros/lib"
import { cn } from "@cerebros/lib"

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
    <div className="bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl p-4 space-y-3 hover:border-[var(--c-border-strong)] transition-colors">
      <div>
        <p className="text-sm font-medium text-[var(--c-text)]">{colaboracion.marca}</p>
        <p className="text-xs text-[var(--c-text-muted)] mt-0.5">{colaboracion.tipo}</p>
      </div>

      {colaboracion.valor_mxn && (
        <p className="text-sm font-semibold text-[var(--c-text)]">
          ${colaboracion.valor_mxn.toLocaleString("es-MX")} MXN
        </p>
      )}

      {colaboracion.notas && (
        <p className="text-xs text-[var(--c-text-subtle)] line-clamp-2">{colaboracion.notas}</p>
      )}

      <select
        value={colaboracion.estado}
        onChange={(e) =>
          onEstadoChange(colaboracion.id, e.target.value as Colaboracion["estado"])
        }
        className="w-full text-xs bg-[var(--c-surface)] border border-[var(--c-border)] rounded-lg px-2 py-1.5 text-[var(--c-text)] cursor-pointer"
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

- [ ] **Step 2: Crear `apps/dashboard/components/KanbanBoard.tsx`**

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
      // Optimistic update
      setColaboraciones((prev) =>
        prev.map((c) => (c.id === id ? { ...c, estado: nuevoEstado } : c))
      )

      const res = await fetch(`/api/colaboraciones?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      })

      if (!res.ok) {
        // Revert on error
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
          <div key={id} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[var(--c-text-muted)] uppercase tracking-wide">
                {label}
              </h3>
              <span className="text-xs text-[var(--c-text-faint)] bg-[var(--c-surface-2)] px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            </div>
            <div className="space-y-2 min-h-24">
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

- [ ] **Step 3: Crear `apps/dashboard/app/(dashboard)/colaboraciones/page.tsx`**

```tsx
import Link from "next/link"
import { Header } from "@/components/Header"
import { KanbanBoard } from "@/components/KanbanBoard"
import { supabase } from "@/lib/supabase"
import { Button } from "@cerebros/ui"
import { Plus } from "lucide-react"
import type { Colaboracion } from "@cerebros/lib"

async function getColaboraciones(): Promise<Colaboracion[]> {
  const { data } = await supabase
    .from("colaboraciones")
    .select("*")
    .order("created_at", { ascending: false })
  return (data ?? []) as Colaboracion[]
}

export default async function ColaboracionesPage() {
  const colaboraciones = await getColaboraciones()

  return (
    <>
      <Header title="Colaboraciones" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[var(--c-text)]">Pipeline de marcas</h2>
            <p className="text-sm text-[var(--c-text-muted)] mt-0.5">
              {colaboraciones.length} colaboraciones en total
            </p>
          </div>
          <Link href="/colaboraciones/new">
            <Button size="sm">
              <Plus className="w-4 h-4" />
              Nueva
            </Button>
          </Link>
        </div>

        <KanbanBoard initialColaboraciones={colaboraciones} />
      </div>
    </>
  )
}
```

- [ ] **Step 4: Crear `apps/dashboard/app/(dashboard)/colaboraciones/new/page.tsx`**

```tsx
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { Button } from "@cerebros/ui"
import { Input } from "@cerebros/ui"

export default function NuevaColaboracionPage() {
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
    <>
      <Header title="Nueva colaboración" />
      <div className="p-6 max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--c-text)]">Marca *</label>
            <Input name="marca" required placeholder="Nombre de la marca" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--c-text)]">Tipo *</label>
            <select
              name="tipo"
              required
              className="w-full bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--c-text)]"
            >
              {["reels", "stories", "post_estatico", "podcast", "newsletter", "paquete"].map(
                (t) => (
                  <option key={t} value={t}>
                    {t.replace("_", " ")}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--c-text)]">Estado</label>
            <select
              name="estado"
              defaultValue="prospecto"
              className="w-full bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--c-text)]"
            >
              {["prospecto", "en_negociacion", "confirmada", "cerrada"].map((e) => (
                <option key={e} value={e}>
                  {e.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--c-text)]">Valor (MXN)</label>
            <Input name="valor_mxn" type="number" placeholder="0.00" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--c-text)]">Nombre del contacto</label>
            <Input name="contacto_nombre" placeholder="Ana López" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--c-text)]">Email del contacto</label>
            <Input name="contacto_email" type="email" placeholder="ana@marca.com" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--c-text)]">Notas</label>
            <textarea
              name="notas"
              rows={3}
              placeholder="Propuesta, condiciones, detalles..."
              className="w-full bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--c-text)] placeholder:text-[var(--c-text-faint)] resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Crear colaboración"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add apps/dashboard/components/KanbanCard.tsx apps/dashboard/components/KanbanBoard.tsx apps/dashboard/app/\(dashboard\)/colaboraciones/
git commit -m "feat(dashboard): colaboraciones — KanbanBoard + CRUD UI"
```

---

## Task 13: Contenido page

**Files:**
- Create: `apps/dashboard/app/(dashboard)/contenido/page.tsx`

- [ ] **Step 1: Crear `apps/dashboard/app/(dashboard)/contenido/page.tsx`**

```tsx
import { Header } from "@/components/Header"
import { supabase } from "@/lib/supabase"
import { readFile } from "fs/promises"
import path from "path"
import { BookOpen, Heart } from "lucide-react"

interface BlogPost {
  slug: string
  title: string
  date: string
}

async function getContenidoData() {
  // Leer lista de posts desde content.json
  let posts: BlogPost[] = []
  try {
    const raw = await readFile(
      path.join(process.cwd(), "../../apps/web/public/data/content.json"),
      "utf-8"
    )
    const content = JSON.parse(raw)
    posts = content.blog?.posts ?? []
  } catch {
    // Sin datos
  }

  // Likes por slug desde Supabase
  const { data: likesData } = await supabase.from("post_likes").select("slug")
  const likesBySlugs: Record<string, number> = {}
  likesData?.forEach(({ slug }) => {
    likesBySlugs[slug] = (likesBySlugs[slug] ?? 0) + 1
  })

  const postsWithLikes = posts.map((p) => ({
    ...p,
    likes: likesBySlugs[p.slug] ?? 0,
  }))

  postsWithLikes.sort((a, b) => b.likes - a.likes)

  return postsWithLikes
}

export default async function ContenidoPage() {
  const posts = await getContenidoData()

  return (
    <>
      <Header title="Contenido" />
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-[var(--c-text-muted)]" />
          <div>
            <h2 className="text-base font-semibold text-[var(--c-text)]">Posts del blog</h2>
            <p className="text-sm text-[var(--c-text-muted)]">{posts.length} artículos publicados</p>
          </div>
        </div>

        <div className="bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl overflow-hidden">
          {posts.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-[var(--c-text-muted)]">
              No hay posts disponibles. Verifica que apps/web/public/data/content.json existe.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--c-border)]">
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-[var(--c-text-muted)]">
                    Título
                  </th>
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-[var(--c-text-muted)]">
                    Fecha
                  </th>
                  <th className="px-5 py-2.5 text-right text-xs font-medium text-[var(--c-text-muted)]">
                    Likes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--c-border)]">
                {posts.map((p) => (
                  <tr key={p.slug} className="hover:bg-[var(--c-surface-2)]">
                    <td className="px-5 py-3">
                      <p className="font-medium text-[var(--c-text)]">{p.title}</p>
                      <p className="text-xs text-[var(--c-text-muted)] mt-0.5">/blog/{p.slug}</p>
                    </td>
                    <td className="px-5 py-3 text-[var(--c-text-muted)]">
                      {new Date(p.date).toLocaleDateString("es-MX", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[var(--c-text-muted)]">
                        <Heart className="w-3.5 h-3.5" />
                        {p.likes}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/dashboard/app/\(dashboard\)/contenido/
git commit -m "feat(dashboard): contenido page with blog posts and likes"
```

---

## Task 14: Agentes IA — API + página

**Files:**
- Create: `apps/dashboard/app/api/agentes/analiza/route.ts`
- Create: `apps/dashboard/app/(dashboard)/agentes/page.tsx`

- [ ] **Step 1: Crear `apps/dashboard/app/api/agentes/analiza/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import Anthropic from "@anthropic-ai/sdk"
import { supabase } from "@/lib/supabase"

export const runtime = "nodejs"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { pregunta } = await req.json()
  if (!pregunta || typeof pregunta !== "string") {
    return NextResponse.json({ error: "Falta pregunta" }, { status: 400 })
  }

  // Recopilar contexto: suscriptores, colaboraciones, likes
  const [subsRes, colabRes, likesRes] = await Promise.all([
    supabase.from("suscriptores").select("id", { count: "exact", head: true }),
    supabase.from("colaboraciones").select("marca, tipo, estado, valor_mxn"),
    supabase.from("post_likes").select("slug"),
  ])

  const totalSubs = subsRes.count ?? 0
  const colaboraciones = colabRes.data ?? []
  const likesBySlugs: Record<string, number> = {}
  likesRes.data?.forEach(({ slug }) => {
    likesBySlugs[slug] = (likesBySlugs[slug] ?? 0) + 1
  })
  const topPosts = Object.entries(likesBySlugs)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const contexto = `
Eres el asistente de análisis de Cerebros Esponjosos — un podcast y blog de neurología en español.

DATOS ACTUALES:
- Suscriptores newsletter: ${totalSubs}
- Colaboraciones en pipeline: ${colaboraciones.length}
  ${colaboraciones.map((c) => `  • ${c.marca} (${c.tipo}) — ${c.estado} — ${c.valor_mxn ? `$${c.valor_mxn} MXN` : "sin valor"}`).join("\n")}
- Top posts por likes:
  ${topPosts.map(([slug, count]) => `  • /blog/${slug}: ${count} likes`).join("\n")}

PREGUNTA DEL USUARIO:
${pregunta}

Responde en español, de forma concisa y accionable. Máximo 200 palabras.
`

  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 512,
    messages: [{ role: "user", content: contexto }],
  })

  const output =
    message.content[0].type === "text" ? message.content[0].text : ""

  // Guardar log
  await supabase.from("agent_logs").insert({
    tipo: "analisis_metricas",
    input: pregunta,
    output,
    modelo: message.model,
    tokens_input: message.usage.input_tokens,
    tokens_output: message.usage.output_tokens,
  })

  return NextResponse.json({ respuesta: output })
}
```

- [ ] **Step 2: Crear `apps/dashboard/app/(dashboard)/agentes/page.tsx`**

```tsx
"use client"
import { useState } from "react"
import { Header } from "@/components/Header"
import { Button } from "@cerebros/ui"
import { Input } from "@cerebros/ui"
import { Bot, Send, Loader2 } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function AgentesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const SUGERENCIAS = [
    "¿Qué contenido funcionó mejor este mes?",
    "¿Cuáles colaboraciones debo priorizar?",
    "¿Cómo está creciendo mi newsletter?",
    "Sugiere temas para los próximos posts",
  ]

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

  return (
    <>
      <Header title="Agentes IA" />
      <div className="p-6 flex flex-col h-full max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl">
            <Bot className="w-5 h-5 text-[var(--c-text-muted)]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--c-text)]">Análisis de métricas</h2>
            <p className="text-sm text-[var(--c-text-muted)]">
              Pregúntale a Claude sobre tu contenido y audiencia
            </p>
          </div>
        </div>

        {messages.length === 0 && (
          <div className="grid grid-cols-2 gap-2 mb-6">
            {SUGERENCIAS.map((s) => (
              <button
                key={s}
                onClick={() => enviar(s)}
                className="text-left text-sm text-[var(--c-text-muted)] bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl px-4 py-3 hover:border-[var(--c-border-strong)] hover:text-[var(--c-text)] transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  m.role === "user"
                    ? "bg-[var(--c-invert)] text-[var(--c-invert-fg)]"
                    : "bg-[var(--c-surface)] border border-[var(--c-border)] text-[var(--c-text)]"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[var(--c-surface)] border border-[var(--c-border)] rounded-2xl px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-[var(--c-text-muted)]" />
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            enviar(input)
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta algo sobre tus métricas..."
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/dashboard/app/api/agentes/ apps/dashboard/app/\(dashboard\)/agentes/
git commit -m "feat(dashboard): agentes IA — Claude API integration + chat UI"
```

---

## Task 15: Equipo page (owner only)

**Files:**
- Create: `apps/dashboard/app/(dashboard)/equipo/page.tsx`

- [ ] **Step 1: Crear `apps/dashboard/app/(dashboard)/equipo/page.tsx`**

```tsx
import { Header } from "@/components/Header"
import { OrganizationProfile } from "@clerk/nextjs"
import { getUserRole } from "@/lib/clerk"
import { redirect } from "next/navigation"

export default async function EquipoPage() {
  const role = await getUserRole()
  if (role !== "owner") redirect("/")

  return (
    <>
      <Header title="Equipo" />
      <div className="p-6">
        <OrganizationProfile
          appearance={{
            elements: {
              card: "bg-[var(--c-surface)] border border-[var(--c-border)] shadow-none rounded-2xl",
              navbar: "hidden",
              pageScrollBox: "p-0",
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
git add apps/dashboard/app/\(dashboard\)/equipo/
git commit -m "feat(dashboard): equipo page with Clerk OrganizationProfile"
```

---

## Task 16: Build y verificación final

- [ ] **Step 1: Build completo del dashboard**

```bash
npm run build --workspace=apps/dashboard
```

Expected: `✓ Compiled successfully` sin errores de TypeScript ni de Next.js.

- [ ] **Step 2: Verificar todas las rutas en dev**

```bash
npm run dev --workspace=apps/dashboard
```

Verificar en `http://localhost:3002`:
- `/` → redirige a `/sign-in` si no hay sesión
- `/sign-in` → página de login de Clerk visible
- (tras autenticarse) `/` → Overview con métricas
- `/analytics` → datos de Instagram, YouTube, blog
- `/newsletter` → tabla de suscriptores
- `/colaboraciones` → kanban board
- `/colaboraciones/new` → formulario
- `/contenido` → tabla de posts
- `/agentes` → chat con Claude
- `/equipo` → solo si el rol es `owner`

- [ ] **Step 3: Añadir dashboard al launch.json**

Modificar `.claude/launch.json` para incluir el dashboard:

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "apps/web (Next.js)",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev", "--workspace=apps/web", "--", "-p", "3001"],
      "port": 3001
    },
    {
      "name": "apps/dashboard (Next.js)",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev", "--workspace=apps/dashboard", "--", "-p", "3002"],
      "port": 3002
    }
  ]
}
```

- [ ] **Step 4: Commit final**

```bash
git add .claude/launch.json
git commit -m "chore: add dashboard to launch.json dev servers"
```

- [ ] **Step 5: Push al branch de trabajo**

```bash
git push origin $(git branch --show-current)
```

---

## Notas de deploy

Cuando el dashboard esté listo para producción:

1. **Crear proyecto Vercel nuevo** para `apps/dashboard`:
   - Root Directory: `apps/dashboard`
   - Framework Preset: Next.js
   - Domain: `dashboard.cerebrosesponjosos.com`

2. **Añadir env vars en Vercel** (proyecto dashboard):
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...
   SUPABASE_URL=https://ryllpsxbelcofyyagfch.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   RESEND_API_KEY=re_...
   ANTHROPIC_API_KEY=sk-ant-...
   ```

3. **Configurar Clerk** en el dashboard de Clerk:
   - Crear organización para gestión de equipo
   - Añadir `dashboard.cerebrosesponjosos.com` como dominio permitido
   - Configurar metadata `role` en los usuarios (owner/editor/viewer)
