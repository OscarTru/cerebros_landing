# Decorative Buttons Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir 5 botones decorativos del dashboard en funcionales (Publicar algo, Bell, 3 botones draft Newsletter, Context Agentes) reutilizando modales existentes y sin introducir persistencia robusta de borradores.

**Architecture:** Client components nuevos (`PublishModal`, `OverviewHeaderActions`, `DraftCard`) que despachan navegación vía `router.push` con query params, o eventos DOM custom (`newsletter:open-draft`) que los handlers existentes ya montados escuchan. Nueva tabla `newsletter_scheduled` para programación diferida (sin worker aún).

**Tech Stack:** Next.js 15 App Router, React 19, HeroUI v2 (Popover, Modal), Tailwind v4, Supabase, Resend, lucide-react, Clerk.

---

## File structure

**Create:**
- `apps/dashboard/components/ui/PublishModal.tsx` — modal selector de plataforma
- `apps/dashboard/components/OverviewHeaderActions.tsx` — wrapper client con Bell + Publicar
- `apps/dashboard/app/(dashboard)/newsletter/DraftCard.tsx` — draft card extraído a client
- `supabase/migrations/20260423_newsletter_scheduled.sql` — tabla scheduled

**Modify:**
- `apps/dashboard/app/(dashboard)/page.tsx` — usar `OverviewHeaderActions`, remover Semana, pasar `attentionItems`
- `apps/dashboard/app/(dashboard)/newsletter/page.tsx` — reemplazar draft inline por `<DraftCard />`
- `apps/dashboard/app/(dashboard)/newsletter/NewsletterHeaderActions.tsx` — escuchar evento, añadir datetime input, tabs, enviar `scheduled_at`
- `apps/dashboard/app/api/newsletter/send/route.ts` — aceptar `scheduled_at`, insertar en tabla
- `apps/dashboard/app/(dashboard)/contenido/ContenidoClient.tsx` — leer query params al montar
- `apps/dashboard/components/AgentesClient.tsx` — eliminar botón Context

---

## Task 1: Migración Supabase — tabla `newsletter_scheduled`

**Files:**
- Create: `supabase/migrations/20260423_newsletter_scheduled.sql`

- [ ] **Step 1: Crear el archivo de migración**

```sql
-- supabase/migrations/20260423_newsletter_scheduled.sql
create table if not exists newsletter_scheduled (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body text not null,
  scheduled_at timestamptz not null,
  sent_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_newsletter_scheduled_pending
  on newsletter_scheduled (scheduled_at)
  where sent_at is null;
```

- [ ] **Step 2: Aplicar la migración en Supabase**

Correr en Supabase SQL editor o via CLI:
```bash
# Si se usa Supabase CLI local
npx supabase db push
```
Si no hay CLI configurado, pegar el SQL en el dashboard de Supabase → SQL Editor → Run.

Expected: tabla `newsletter_scheduled` visible en Database → Tables.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260423_newsletter_scheduled.sql
git commit -m "feat(db): add newsletter_scheduled table for delayed sends"
```

---

## Task 2: Actualizar API `/api/newsletter/send` para aceptar `scheduled_at`

**Files:**
- Modify: `apps/dashboard/app/api/newsletter/send/route.ts`

- [ ] **Step 1: Reemplazar el handler completo**

Contenido final del archivo:

```ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { Resend } from "resend"
import { getSupabase } from "@/lib/supabase"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { subject, body, scheduled_at } = await req.json()
  if (!subject || !body) {
    return NextResponse.json({ error: "Falta subject o body" }, { status: 400 })
  }

  // Schedule path
  if (scheduled_at) {
    const when = new Date(scheduled_at)
    if (Number.isNaN(when.getTime())) {
      return NextResponse.json({ error: "Fecha inválida" }, { status: 400 })
    }
    if (when.getTime() <= Date.now()) {
      return NextResponse.json({ error: "La fecha debe ser futura" }, { status: 400 })
    }
    const { error } = await getSupabase()
      .from("newsletter_scheduled")
      .insert({ subject, body, scheduled_at: when.toISOString() })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    // TODO: worker que procese newsletter_scheduled no implementado aún.
    return NextResponse.json({ scheduled: true, scheduled_at: when.toISOString() })
  }

  // Immediate send path (unchanged)
  const { data: subs } = await getSupabase()
    .from("suscriptores")
    .select("email")
    .eq("confirmed", true)

  const emails = (subs ?? []).map((s) => s.email)
  if (emails.length === 0) {
    return NextResponse.json({ error: "No hay suscriptores confirmados" }, { status: 400 })
  }

  const BATCH = 50
  let sent = 0
  for (let i = 0; i < emails.length; i += BATCH) {
    const batch = emails.slice(i, i + BATCH)
    await resend.batch.send(
      batch.map((to) => ({
        from: "Cerebros Esponjosos <newsletter@cerebrosesponjosos.com>",
        to,
        subject,
        html: body.replace(/\n/g, "<br>"),
      }))
    )
    sent += batch.length
  }

  return NextResponse.json({ sent })
}
```

- [ ] **Step 2: Verificar types y lint**

```bash
cd apps/dashboard && npx tsc --noEmit -p .
```
Expected: sin errores relacionados al archivo modificado.

- [ ] **Step 3: Commit**

```bash
git add apps/dashboard/app/api/newsletter/send/route.ts
git commit -m "feat(newsletter): support scheduled_at for delayed sends"
```

---

## Task 3: Crear `PublishModal` componente

**Files:**
- Create: `apps/dashboard/components/ui/PublishModal.tsx`

- [ ] **Step 1: Crear el archivo**

```tsx
"use client"
import { useRouter } from "next/navigation"
import { Instagram, Youtube, FileText, Mail, X } from "lucide-react"

interface PublishModalProps {
  isOpen: boolean
  onClose: () => void
}

const OPTIONS = [
  {
    key: "instagram",
    label: "Instagram",
    description: "Reel, carrusel o post",
    icon: Instagram,
    bg: "bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af]",
    href: "/contenido?new=1&platform=instagram",
  },
  {
    key: "youtube",
    label: "YouTube",
    description: "Video o short",
    icon: Youtube,
    bg: "bg-[#ff0000]",
    href: "/contenido?new=1&platform=youtube",
  },
  {
    key: "blog",
    label: "Blog",
    description: "Artículo nuevo",
    icon: FileText,
    bg: "bg-[#6366f1]",
    href: "/contenido?new=1&platform=blog",
  },
  {
    key: "newsletter",
    label: "Newsletter",
    description: "Envío semanal",
    icon: Mail,
    bg: "bg-[#14b8a6]",
    href: "/newsletter?draft=1",
  },
] as const

export function PublishModal({ isOpen, onClose }: PublishModalProps) {
  const router = useRouter()
  if (!isOpen) return null

  function handleSelect(href: string) {
    router.push(href)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-7 shadow-2xl mx-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">· PUBLICAR ·</p>
            <h2 className="mt-0.5 text-[20px] font-bold text-[var(--c-text)]">¿Dónde quieres publicar?</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--c-border)] text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)] transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {OPTIONS.map((opt) => {
            const Icon = opt.icon
            return (
              <button
                key={opt.key}
                onClick={() => handleSelect(opt.href)}
                className="group flex items-center gap-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] p-4 text-left transition-colors hover:border-[var(--c-border-strong)] hover:bg-[var(--c-surface-3)]"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-white ${opt.bg}`}>
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-[var(--c-text)]">{opt.label}</p>
                  <p className="text-[11.5px] text-[var(--c-text-muted)]">{opt.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
cd apps/dashboard && npx tsc --noEmit -p .
```
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add apps/dashboard/components/ui/PublishModal.tsx
git commit -m "feat(dashboard): add PublishModal — platform selector"
```

---

## Task 4: Crear `OverviewHeaderActions` client component

**Files:**
- Create: `apps/dashboard/components/OverviewHeaderActions.tsx`

- [ ] **Step 1: Crear el archivo**

```tsx
"use client"
import { useState } from "react"
import { Bell, Plus } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/react"
import { AttentionQueue, type AttentionItem } from "@/components/ui/AttentionQueue"
import { PublishModal } from "@/components/ui/PublishModal"

interface Props {
  attentionItems: AttentionItem[]
}

export function OverviewHeaderActions({ attentionItems }: Props) {
  const [publishOpen, setPublishOpen] = useState(false)
  const count = attentionItems.length

  return (
    <>
      <div className="flex items-center gap-2 mt-1">
        <Popover placement="bottom-end" offset={8}>
          <PopoverTrigger>
            <button
              className="relative inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--c-border)] bg-[var(--c-surface-2)] px-3.5 text-[12px] font-medium text-[var(--c-text-muted)] hover:bg-[var(--c-surface-3)] transition-colors"
              aria-label={`Notificaciones (${count})`}
            >
              <Bell className="h-3.5 w-3.5" />
              {count}
            </button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[360px] max-w-[92vw]">
            <AttentionQueue items={attentionItems} />
          </PopoverContent>
        </Popover>

        <button
          onClick={() => setPublishOpen(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--c-invert)] px-4 text-[12px] font-medium text-[var(--c-invert-fg)] hover:opacity-90 transition-opacity"
        >
          <Plus className="h-3.5 w-3.5" />
          Publicar algo
        </button>
      </div>

      <PublishModal isOpen={publishOpen} onClose={() => setPublishOpen(false)} />
    </>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
cd apps/dashboard && npx tsc --noEmit -p .
```
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add apps/dashboard/components/OverviewHeaderActions.tsx
git commit -m "feat(overview): add OverviewHeaderActions with Bell popover + Publish modal"
```

---

## Task 5: Integrar `OverviewHeaderActions` en Overview page, remover Semana

**Files:**
- Modify: `apps/dashboard/app/(dashboard)/page.tsx`

- [ ] **Step 1: Añadir import**

En `apps/dashboard/app/(dashboard)/page.tsx`, reemplazar:

```tsx
import { Bell, CalendarDays, Plus } from "lucide-react"
```

por:

```tsx
import { OverviewHeaderActions } from "@/components/OverviewHeaderActions"
```

- [ ] **Step 2: Reemplazar bloque de botones del header**

Reemplazar todo el bloque `<div className="flex items-center gap-2 mt-1">...</div>` (líneas 206-219 aprox, que contiene los 3 botones Bell/Semana/Publicar) por:

```tsx
<OverviewHeaderActions attentionItems={data.attentionItems} />
```

- [ ] **Step 3: Verificar build**

```bash
cd apps/dashboard && npx tsc --noEmit -p .
```
Expected: sin errores. Si `Bell`, `CalendarDays`, `Plus` aparecen como unused warning, quitar del import (ya hecho en paso 1).

- [ ] **Step 4: Commit**

```bash
git add apps/dashboard/app/(dashboard)/page.tsx
git commit -m "refactor(overview): wire real Bell popover + Publish modal, drop Semana"
```

---

## Task 6: Actualizar `ContenidoClient` para leer query params y abrir modal

**Files:**
- Modify: `apps/dashboard/app/(dashboard)/contenido/ContenidoClient.tsx`

- [ ] **Step 1: Añadir imports de hooks de navegación**

En la sección de imports, agregar al inicio (tras `useMemo, useState, useCallback`):

```tsx
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
```

- [ ] **Step 2: Añadir efecto que lee query params**

Dentro del componente `ContenidoClient`, después de las declaraciones `useState` existentes (alrededor de la línea 85), insertar:

```tsx
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const isNew = searchParams.get("new") === "1"
    const platformParam = searchParams.get("platform") as Plataforma | null
    if (!isNew) return
    const validPlatforms: Plataforma[] = ["instagram", "youtube", "blog", "newsletter"]
    const platform = platformParam && validPlatforms.includes(platformParam) ? platformParam : "instagram"
    openModal(new Date().toISOString().slice(0, 10), platform)
    router.replace("/contenido")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
```

Nota: el `eslint-disable` es porque `openModal` es local y solo queremos disparar una vez al montar.

- [ ] **Step 3: Verificar build**

```bash
cd apps/dashboard && npx tsc --noEmit -p .
```
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add apps/dashboard/app/(dashboard)/contenido/ContenidoClient.tsx
git commit -m "feat(contenido): read ?new=1&platform=X to auto-open modal"
```

---

## Task 7: Crear `DraftCard` client component (Newsletter)

**Files:**
- Create: `apps/dashboard/app/(dashboard)/newsletter/DraftCard.tsx`

- [ ] **Step 1: Crear el archivo**

```tsx
"use client"
import { FileText, Eye, Calendar } from "lucide-react"

export interface DraftPayload {
  subject: string
  body: string
}

interface DraftCardProps {
  nextSend: string
  draft: DraftPayload
}

type DraftMode = "edit" | "preview" | "schedule"

export function DraftCard({ nextSend, draft }: DraftCardProps) {
  function open(mode: DraftMode) {
    window.dispatchEvent(
      new CustomEvent("newsletter:open-draft", {
        detail: { mode, subject: draft.subject, body: draft.body },
      })
    )
  }

  return (
    <div className="lg:col-span-8 flex flex-col gap-5 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-2)] p-7">
      <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">
        · SIGUIENTE ENVÍO · JUEVES {nextSend.toUpperCase()} ·
      </p>
      <div className="flex-1">
        <h2 className="text-[32px] font-bold leading-tight text-[var(--c-text)]">
          Hay cosas que tu cerebro hace
        </h2>
        <h2 className="text-[32px] font-bold leading-tight text-[var(--c-text-muted)] italic">
          que nadie te había contado.
        </h2>
        <p className="mt-4 text-[13px] leading-relaxed text-[var(--c-text-muted)]">
          Borrador #12 guardado hace 2 horas. Esta semana: el ritmo circadiano explicado para quien no duerme bien, más el video de migraña de Stephanie y un enlace al último podcast.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 pt-4 border-t border-[var(--c-border)]">
        <button
          onClick={() => open("edit")}
          className="inline-flex items-center gap-1.5 h-9 px-5 rounded-full text-[12px] font-medium bg-[var(--c-invert)] text-[var(--c-invert-fg)] hover:opacity-90 transition-opacity"
        >
          <FileText className="h-3.5 w-3.5" />
          Continuar editando
        </button>
        <button
          onClick={() => open("preview")}
          className="inline-flex items-center gap-1.5 h-9 px-5 rounded-full text-[12px] font-medium border border-[var(--c-border)] bg-[var(--c-surface-3)] text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)] transition-colors"
        >
          <Eye className="h-3.5 w-3.5" />
          Vista previa
        </button>
        <button
          onClick={() => open("schedule")}
          className="inline-flex items-center gap-1.5 h-9 px-5 rounded-full text-[12px] font-medium border border-[var(--c-border)] bg-[var(--c-surface-3)] text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)] transition-colors"
        >
          <Calendar className="h-3.5 w-3.5" />
          Programar
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
cd apps/dashboard && npx tsc --noEmit -p .
```
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add apps/dashboard/app/(dashboard)/newsletter/DraftCard.tsx
git commit -m "feat(newsletter): extract DraftCard with wired buttons"
```

---

## Task 8: Usar `DraftCard` en Newsletter page

**Files:**
- Modify: `apps/dashboard/app/(dashboard)/newsletter/page.tsx`

- [ ] **Step 1: Reemplazar imports**

Eliminar del import de lucide-react `FileText, Eye, Calendar` (quedarán sin uso). Añadir:

```tsx
import { DraftCard } from "./DraftCard"
```

Línea a remover:
```tsx
import { FileText, Eye, Calendar } from "lucide-react"
```

- [ ] **Step 2: Definir el draft payload como constante**

Arriba de `export default async function NewsletterPage()` añadir:

```tsx
const DRAFT_FALLBACK = {
  subject: "Hay cosas que tu cerebro hace que nadie te había contado",
  body: `Esta semana: el ritmo circadiano explicado para quien no duerme bien.

Además: el video de migraña de Stephanie y un enlace al último podcast.

— Oscar & Stephanie`,
}
```

- [ ] **Step 3: Reemplazar bloque del draft card inline**

Reemplazar todo el bloque `<div className="lg:col-span-8 flex flex-col gap-5 rounded-2xl ...">...</div>` (líneas 63-92 aprox) por:

```tsx
<DraftCard nextSend={nextSend} draft={DRAFT_FALLBACK} />
```

- [ ] **Step 4: Verificar build**

```bash
cd apps/dashboard && npx tsc --noEmit -p .
```
Expected: sin errores.

- [ ] **Step 5: Commit**

```bash
git add apps/dashboard/app/(dashboard)/newsletter/page.tsx
git commit -m "refactor(newsletter): use DraftCard instead of inline block"
```

---

## Task 9: Mejorar `NewsletterHeaderActions` — escuchar evento, preview, scheduling

**Files:**
- Modify: `apps/dashboard/app/(dashboard)/newsletter/NewsletterHeaderActions.tsx`

- [ ] **Step 1: Reemplazar el archivo completo**

```tsx
"use client"
import { useEffect, useState } from "react"
import { Download, Send, X, Loader2, FileText, Eye, Calendar } from "lucide-react"

type Mode = "edit" | "preview" | "schedule"
type Result = { sent?: number; scheduled_at?: string; error?: string } | null

export function NewsletterHeaderActions() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>("edit")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<Result>(null)

  useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent).detail as { mode: Mode; subject: string; body: string }
      setMode(detail.mode)
      setSubject(detail.subject)
      setBody(detail.body)
      setScheduledAt("")
      setResult(null)
      setOpen(true)
    }
    window.addEventListener("newsletter:open-draft", handler)
    return () => window.removeEventListener("newsletter:open-draft", handler)
  }, [])

  function openBlank() {
    setMode("edit")
    setSubject("")
    setBody("")
    setScheduledAt("")
    setResult(null)
    setOpen(true)
  }

  function handleExport() {
    window.location.href = "/api/newsletter/export"
  }

  async function handleSubmit() {
    if (!subject.trim() || !body.trim()) return
    if (mode === "schedule" && !scheduledAt) {
      setResult({ error: "Elige fecha y hora" })
      return
    }
    setSending(true)
    setResult(null)
    try {
      const payload: Record<string, string> = { subject, body }
      if (mode === "schedule") {
        const iso = new Date(scheduledAt).toISOString()
        payload.scheduled_at = iso
      }
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) {
        setResult({ error: json.error ?? "Error" })
      } else if (mode === "schedule") {
        setResult({ scheduled_at: json.scheduled_at })
      } else {
        setResult({ sent: json.sent })
      }
    } catch {
      setResult({ error: "Error de red" })
    } finally {
      setSending(false)
    }
  }

  const title = mode === "schedule" ? "Programar envío" : mode === "preview" ? "Vista previa" : "Redactar newsletter"
  const primaryLabel = mode === "schedule" ? "Programar" : "Enviar ahora"
  const primaryIcon = mode === "schedule" ? Calendar : Send

  return (
    <>
      <div className="flex items-center gap-2 mt-1">
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full border border-[var(--c-border)] bg-[var(--c-surface-2)] text-[12px] font-medium text-[var(--c-text-muted)] hover:bg-[var(--c-surface-3)] transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Exportar
        </button>
        <button
          onClick={openBlank}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[var(--c-invert)] text-[var(--c-invert-fg)] text-[12px] font-medium hover:opacity-90 transition-opacity"
        >
          <Send className="h-3.5 w-3.5" />
          Redactar envío
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-2xl rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-8 shadow-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--c-text-faint)]">· NUEVO ENVÍO ·</p>
                <h2 className="mt-0.5 text-[22px] font-bold text-[var(--c-text)]">{title}</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--c-border)] text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)] transition-colors"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="mb-5 flex gap-1 border-b border-[var(--c-border)]">
              {(["edit", "preview", "schedule"] as const).map((m) => {
                const Icon = m === "edit" ? FileText : m === "preview" ? Eye : Calendar
                const label = m === "edit" ? "Editar" : m === "preview" ? "Preview" : "Programar"
                const active = mode === m
                return (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium transition-colors border-b-2 -mb-px ${
                      active
                        ? "border-[var(--c-text)] text-[var(--c-text)]"
                        : "border-transparent text-[var(--c-text-muted)] hover:text-[var(--c-text)]"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                )
              })}
            </div>

            <div className="flex flex-col gap-4">
              {mode === "preview" ? (
                <div className="rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] p-5">
                  <p className="mb-2 text-[11px] uppercase tracking-wider text-[var(--c-text-subtle)]">Asunto</p>
                  <p className="mb-4 text-[16px] font-semibold text-[var(--c-text)]">{subject || "(sin asunto)"}</p>
                  <div
                    className="prose prose-sm text-[14px] leading-relaxed text-[var(--c-text)] whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: body.replace(/\n/g, "<br>") || "(sin contenido)" }}
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--c-text-subtle)]">Asunto</label>
                    <input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="El título de tu newsletter..."
                      className="w-full rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-3 text-[14px] text-[var(--c-text)] placeholder:text-[var(--c-text-faint)] outline-none focus:border-[var(--c-text-subtle)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--c-text-subtle)]">Contenido</label>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Escribe el cuerpo del newsletter..."
                      rows={8}
                      className="w-full rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-3 text-[14px] text-[var(--c-text)] placeholder:text-[var(--c-text-faint)] outline-none focus:border-[var(--c-text-subtle)] transition-colors resize-none"
                    />
                  </div>
                </>
              )}

              {mode === "schedule" && (
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--c-text-subtle)]">Fecha y hora de envío</label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 py-3 text-[14px] text-[var(--c-text)] outline-none focus:border-[var(--c-text-subtle)] transition-colors"
                  />
                  <p className="mt-2 text-[11px] text-[var(--c-text-faint)]">
                    Nota: el worker de envío automático aún no está habilitado. El envío quedará registrado para procesarse cuando se active.
                  </p>
                </div>
              )}

              {result && (
                <div className={`rounded-xl px-4 py-3 text-[13px] ${result.error ? "bg-red-500/10 text-red-500" : "bg-teal-500/10 text-teal-600"}`}>
                  {result.error
                    ? `Error: ${result.error}`
                    : result.scheduled_at
                    ? `✓ Programado para ${new Date(result.scheduled_at).toLocaleString("es-MX")}`
                    : `✓ Enviado a ${result.sent} suscriptores confirmados`}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-[var(--c-border)] pt-4">
                <p className="text-[12px] text-[var(--c-text-faint)]">
                  {mode === "schedule"
                    ? "Se programará para los suscriptores confirmados al momento del envío."
                    : "Se enviará a todos los suscriptores confirmados vía Resend."}
                </p>
                {mode !== "preview" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setOpen(false)}
                      className="inline-flex h-9 items-center px-4 rounded-full border border-[var(--c-border)] text-[12px] font-medium text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)] transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={sending || !subject.trim() || !body.trim() || (mode === "schedule" && !scheduledAt)}
                      className="inline-flex h-9 items-center gap-1.5 px-5 rounded-full bg-[var(--c-invert)] text-[var(--c-invert-fg)] text-[12px] font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (() => {
                        const Icon = primaryIcon
                        return <Icon className="h-3.5 w-3.5" />
                      })()}
                      {sending ? "Procesando..." : primaryLabel}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
cd apps/dashboard && npx tsc --noEmit -p .
```
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add apps/dashboard/app/(dashboard)/newsletter/NewsletterHeaderActions.tsx
git commit -m "feat(newsletter): listen for draft events, add preview tab + scheduling"
```

---

## Task 10: Soportar `?draft=1` en Newsletter page para auto-abrir modal

**Files:**
- Modify: `apps/dashboard/app/(dashboard)/newsletter/NewsletterHeaderActions.tsx`

Este task complementa el Task 9 con el handling del query param que viene desde `PublishModal` (Task 3) cuando el usuario elige Newsletter.

- [ ] **Step 1: Añadir efecto que lee `?draft=1`**

Dentro del componente `NewsletterHeaderActions`, tras el `useEffect` que escucha el evento custom, añadir:

```tsx
  useEffect(() => {
    if (typeof window === "undefined") return
    const url = new URL(window.location.href)
    if (url.searchParams.get("draft") === "1") {
      setMode("edit")
      setSubject("")
      setBody("")
      setResult(null)
      setOpen(true)
      url.searchParams.delete("draft")
      window.history.replaceState({}, "", url.pathname + (url.search || ""))
    }
  }, [])
```

- [ ] **Step 2: Verificar build**

```bash
cd apps/dashboard && npx tsc --noEmit -p .
```
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add apps/dashboard/app/(dashboard)/newsletter/NewsletterHeaderActions.tsx
git commit -m "feat(newsletter): auto-open draft modal on ?draft=1"
```

---

## Task 11: Eliminar botón Context en Agentes

**Files:**
- Modify: `apps/dashboard/components/AgentesClient.tsx`

- [ ] **Step 1: Leer el rango relevante para confirmar líneas**

```bash
sed -n '120,135p' apps/dashboard/components/AgentesClient.tsx
```

- [ ] **Step 2: Eliminar el bloque del botón Context**

Localizar y eliminar el bloque que contiene `<Settings className="h-3.5 w-3.5" />` + "Context". Es un `<button>` en el header de la página (línea ~124-128). El bloque completo a eliminar se ve así:

```tsx
          <button className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--c-border)] bg-[var(--c-surface-2)] px-4 text-[12px] font-medium text-[var(--c-text-muted)] hover:bg-[var(--c-surface-3)] transition-colors">
            <Settings className="h-3.5 w-3.5" />
            Context
          </button>
```

- [ ] **Step 3: Quitar `Settings` del import de lucide-react**

En el bloque de import al inicio del archivo (alrededor de las líneas 4-20), eliminar `Settings,` de la lista de imports de `lucide-react`. Verificar con:

```bash
grep -n "Settings" apps/dashboard/components/AgentesClient.tsx
```
Expected: sin resultados (o solo resultados no relacionados a lucide).

- [ ] **Step 4: Verificar build**

```bash
cd apps/dashboard && npx tsc --noEmit -p .
```
Expected: sin errores y sin warnings de unused imports.

- [ ] **Step 5: Commit**

```bash
git add apps/dashboard/components/AgentesClient.tsx
git commit -m "chore(agentes): remove decorative Context button"
```

---

## Task 12: Verificación manual end-to-end

**Files:** ninguno

- [ ] **Step 1: Iniciar dev server**

```bash
cd apps/dashboard && npm run dev
```
Abrir `http://localhost:3002` en el navegador autenticado con Clerk.

- [ ] **Step 2: Verificar Overview**

1. La página `/` carga sin error de runtime.
2. Click en Bell → popover aparece con los items de AttentionQueue. Click en un item navega correctamente.
3. Click en "Publicar algo" → modal aparece con 4 opciones.
4. Click en Instagram en el modal → navega a `/contenido`, modal "Nueva pieza" abre con Instagram pre-seleccionado.
5. Verificar que el botón "Semana" ya no existe.

- [ ] **Step 3: Verificar Newsletter**

1. Navegar a `/newsletter`.
2. Click "Continuar editando" en el draft card → modal abre con tab "Editar" y subject/body pre-cargados del `DRAFT_FALLBACK`.
3. Cerrar y click "Vista previa" → modal abre con tab "Preview" renderizando el body.
4. Cerrar y click "Programar" → modal abre con tab "Programar" y el input datetime visible.
5. Llenar una fecha futura y click "Programar". Verificar toast de éxito y confirmar en Supabase que hay fila en `newsletter_scheduled`.
6. Repetir con fecha pasada → verificar error 400 "La fecha debe ser futura".

- [ ] **Step 4: Verificar query param `?draft=1`**

1. Navegar manualmente a `/newsletter?draft=1` → modal debe abrir automáticamente en modo edit con form vacío.
2. URL se limpia a `/newsletter` después.

- [ ] **Step 5: Verificar Agentes**

1. Navegar a `/agentes`.
2. Verificar que el botón "Context" del header ya NO aparece.
3. Verificar que "Nueva conversación" sigue funcionando.

- [ ] **Step 6: Verificar Contenido con query params**

1. Navegar directo a `/contenido?new=1&platform=youtube`.
2. El modal "Nueva pieza" debe abrir con YouTube pre-seleccionado.
3. URL se limpia a `/contenido`.

- [ ] **Step 7: Commit final (si todo OK)**

Si durante la verificación se hicieron fixes menores, commitearlos aquí con mensaje descriptivo. Si no, saltar este step.

---

## Self-review checklist completada

1. **Spec coverage**: cada sección del spec tiene task — ✓
   - Publicar modal → Task 3, 4, 5
   - Bell popover → Task 4, 5
   - Semana removido → Task 5
   - 3 botones newsletter → Task 7, 8, 9
   - Context removido → Task 11
   - Migración + API → Task 1, 2
   - Contenido query params → Task 6
   - Newsletter `?draft=1` → Task 10

2. **Placeholder scan**: sin "TBD/TODO/implementar luego/similar a task X".

3. **Type consistency**:
   - `AttentionItem` importado del módulo donde se define (`@/components/ui/AttentionQueue`) — ✓
   - `DraftMode` = `"edit" | "preview" | "schedule"` consistente entre `DraftCard` y `NewsletterHeaderActions` — ✓
   - `Plataforma` en ContenidoClient mantiene el tipo existente — ✓
   - Payload `{ subject, body, scheduled_at? }` consistente entre API y client — ✓
