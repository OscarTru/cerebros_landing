"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Blocks, Code, Send, CheckCircle2, Loader2, Mail, Calendar, FileText, Copy } from "lucide-react"
import { cn } from "@cerebros/lib"
import { BlockEditor } from "@/components/newsletter/BlockEditor"
import { MarkdownEditor } from "@/components/newsletter/MarkdownEditor"
import { HtmlEditor } from "@/components/newsletter/HtmlEditor"
import { EmailPreview } from "@/components/newsletter/EmailPreview"
import { useToast } from "@/components/ui/Toast"
import type { EditionBlocks } from "@cerebros/email-templates"

export interface DraftRow {
  id: string
  title: string
  subject: string
  mode: "blocks" | "markdown" | "html"
  blocks: EditionBlocks | null
  markdown: string | null
  html: string | null
  status: "draft" | "pending_approval" | "approved" | "sent" | "cancelled"
  created_by: string
  approved_by: string | null
  updated_at: string
}

type Saved = "idle" | "saving" | "saved" | "error"

export function EditorClient({ initialDraft, role }: { initialDraft: DraftRow; role: "owner" | "editor" | "viewer" }) {
  const router = useRouter()
  const params = useSearchParams()
  const toast = useToast()
  const approveFlow = params.get("action") === "approve"

  const [draft, setDraft] = useState<DraftRow>(initialDraft)
  const [saved, setSaved] = useState<Saved>("idle")
  const [previewRev, setPreviewRev] = useState(0)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isFinalized = draft.status === "sent" || draft.status === "approved" || draft.status === "cancelled"
  const readonly =
    isFinalized ||
    (draft.status === "pending_approval" && role === "editor" && !approveFlow)
  const canApprove = role === "owner" && (draft.status === "pending_approval" || draft.status === "draft")
  const canAct = !isFinalized

  function patch(delta: Partial<DraftRow>) {
    const next = { ...draft, ...delta }
    setDraft(next)
    scheduleSave(next)
  }

  function scheduleSave(next: DraftRow) {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setSaved("saving")
    saveTimer.current = setTimeout(() => { persist(next) }, 900)
  }

  async function persist(next: DraftRow) {
    try {
      const res = await fetch(`/api/newsletter/drafts/${next.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: next.title,
          subject: next.subject,
          mode: next.mode,
          blocks: next.blocks,
          markdown: next.markdown,
          html: next.html,
        }),
      })
      if (res.ok) {
        setSaved("saved")
        setPreviewRev((r) => r + 1)
      } else {
        setSaved("error")
        const json = await res.json().catch(() => ({}))
        toast.show({ kind: "error", title: "Error al guardar", description: json.error ?? `HTTP ${res.status}` })
      }
    } catch (e) {
      setSaved("error")
      const msg = e instanceof Error ? e.message : "Error de red"
      toast.show({ kind: "error", title: "Error al guardar", description: msg })
    }
  }

  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current) }, [])

  const [testing, setTesting] = useState(false)
  async function handleTest() {
    setTesting(true)
    try {
      const res = await fetch(`/api/newsletter/drafts/${draft.id}/test-send`, { method: "POST" })
      const json = await res.json()
      if (res.ok) {
        toast.show({ kind: "success", title: "Prueba enviada", description: `Revisa tu bandeja: ${json.to}` })
      } else {
        toast.show({ kind: "error", title: "No se pudo enviar la prueba", description: json.error })
      }
    } finally { setTesting(false) }
  }

  const [requesting, setRequesting] = useState(false)
  async function handleRequestApproval() {
    setRequesting(true)
    try {
      const res = await fetch(`/api/newsletter/drafts/${draft.id}/request-approval`, { method: "POST" })
      const json = await res.json()
      if (res.ok) {
        setDraft((d) => ({ ...d, status: "pending_approval" }))
        toast.show({ kind: "success", title: "Enviado para aprobación", description: "El owner revisará el borrador." })
      } else {
        toast.show({ kind: "error", title: "No se pudo enviar a aprobación", description: json.error })
      }
    } finally { setRequesting(false) }
  }

  const [approving, setApproving] = useState(false)
  const [scheduleAt, setScheduleAt] = useState("")
  async function handleApprove(mode: "now" | "schedule") {
    if (mode === "schedule" && !scheduleAt) {
      toast.show({ kind: "error", title: "Falta fecha y hora", description: "Elige cuándo enviar." })
      return
    }
    setApproving(true)
    try {
      const body: { mode: "now" | "schedule"; scheduled_at?: string } = { mode }
      if (mode === "schedule") body.scheduled_at = new Date(scheduleAt).toISOString()
      const res = await fetch(`/api/newsletter/drafts/${draft.id}/approve-send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (res.ok) {
        if (mode === "now") {
          toast.show({ kind: "success", title: "Newsletter enviada", description: "Ya salió al broadcast de Resend." })
        } else {
          toast.show({ kind: "success", title: "Envío programado", description: `Se enviará el ${new Date(json.scheduled_at).toLocaleString("es-MX")}` })
        }
        setTimeout(() => router.push("/newsletter"), 1200)
      } else {
        toast.show({ kind: "error", title: "No se pudo enviar", description: json.error })
      }
    } finally { setApproving(false) }
  }

  const [duplicating, setDuplicating] = useState(false)
  async function handleDuplicate() {
    setDuplicating(true)
    try {
      const res = await fetch(`/api/newsletter/drafts/${draft.id}/duplicate`, { method: "POST" })
      const json = await res.json()
      if (res.ok && json.id) {
        toast.show({ kind: "success", title: "Borrador duplicado", description: "Abriendo la copia..." })
        setTimeout(() => router.push(`/newsletter/editor/${json.id}`), 600)
      } else {
        toast.show({ kind: "error", title: "No se pudo duplicar", description: json.error })
      }
    } finally { setDuplicating(false) }
  }

  const savedBadge = useMemo(() => {
    if (saved === "saving") return <span className="inline-flex items-center gap-1 text-[11px] text-[var(--c-text-muted)]"><Loader2 className="h-3 w-3 animate-spin" /> Guardando</span>
    if (saved === "saved") return <span className="inline-flex items-center gap-1 text-[11px] text-teal-600"><CheckCircle2 className="h-3 w-3" /> Guardado</span>
    if (saved === "error") return <span className="text-[11px] text-red-500">Error al guardar</span>
    return null
  }, [saved])

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--c-border)] px-6 py-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => router.push("/newsletter")} className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--c-border)] text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)]" aria-label="Volver">
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <input
            value={draft.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="Título del borrador"
            disabled={readonly}
            className="min-w-0 flex-1 max-w-md rounded-lg bg-transparent px-2 py-1 text-[15px] font-semibold text-[var(--c-text)] placeholder:text-[var(--c-text-faint)] outline-none focus:bg-[var(--c-surface-2)] disabled:opacity-70"
          />
          {savedBadge}
        </div>

        <div className="flex items-center gap-2">
          {isFinalized && (
            <>
              <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-[var(--c-surface-2)] text-[11px] font-medium text-[var(--c-text-muted)]">
                {draft.status === "sent" ? "Enviado — solo lectura" : draft.status === "approved" ? "Programado — solo lectura" : "Cancelado"}
              </span>
              <button onClick={handleDuplicate} disabled={duplicating} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-[var(--c-invert)] text-[var(--c-invert-fg)] text-[12px] font-medium disabled:opacity-50">
                {duplicating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Copy className="h-3.5 w-3.5" />}
                Duplicar como borrador
              </button>
            </>
          )}

          {canAct && (
            <button onClick={handleTest} disabled={testing} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-[var(--c-border)] bg-[var(--c-surface-2)] text-[12px] font-medium text-[var(--c-text-muted)] hover:bg-[var(--c-surface-3)] disabled:opacity-50">
              {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
              Enviar prueba
            </button>
          )}

          {canAct && role === "editor" && draft.status === "draft" && (
            <button onClick={handleRequestApproval} disabled={requesting} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-[var(--c-invert)] text-[var(--c-invert-fg)] text-[12px] font-medium disabled:opacity-50">
              {requesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Listo para enviar
            </button>
          )}

          {canAct && canApprove && (
            <>
              <input
                type="datetime-local"
                value={scheduleAt}
                onChange={(e) => setScheduleAt(e.target.value)}
                className="h-8 rounded-full border border-[var(--c-border)] bg-[var(--c-surface-2)] px-3 text-[12px] text-[var(--c-text)] outline-none"
              />
              <button onClick={() => handleApprove("schedule")} disabled={approving || !scheduleAt} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-[var(--c-border)] bg-[var(--c-surface-2)] text-[12px] font-medium text-[var(--c-text-muted)] hover:bg-[var(--c-surface-3)] disabled:opacity-50">
                <Calendar className="h-3.5 w-3.5" /> Programar
              </button>
              <button onClick={() => handleApprove("now")} disabled={approving} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-[var(--c-invert)] text-[var(--c-invert-fg)] text-[12px] font-medium disabled:opacity-50">
                {approving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Enviar ahora
              </button>
            </>
          )}
        </div>
      </div>

      {/* Subject + tabs */}
      <div className="flex items-center gap-4 border-b border-[var(--c-border)] px-6 py-3 shrink-0">
        <input
          value={draft.subject}
          onChange={(e) => patch({ subject: e.target.value })}
          placeholder="Asunto del email"
          disabled={readonly}
          className="flex-1 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface-2)] px-3 py-1.5 text-[13px] text-[var(--c-text)] placeholder:text-[var(--c-text-faint)] outline-none focus:border-[var(--c-text-subtle)]"
        />
        <div className="flex gap-1 rounded-full border border-[var(--c-border)] bg-[var(--c-surface-2)] p-0.5">
          {(["blocks", "markdown", "html"] as const).map((m) => {
            const Icon = m === "blocks" ? Blocks : m === "markdown" ? FileText : Code
            const label = m === "blocks" ? "Bloques" : m === "markdown" ? "Markdown" : "HTML"
            const active = draft.mode === m
            return (
              <button key={m} onClick={() => patch({ mode: m })} disabled={readonly} className={cn("inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-medium transition-colors", active ? "bg-[var(--c-invert)] text-[var(--c-invert-fg)]" : "text-[var(--c-text-muted)] hover:text-[var(--c-text)]")}>
                <Icon className="h-3 w-3" /> {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 overflow-hidden">
        <div className="overflow-auto border-r border-[var(--c-border)] p-6">
          {draft.mode === "blocks" && (
            <BlockEditor
              value={draft.blocks ?? { heroTitle: "" }}
              onChange={(v) => patch({ blocks: v })}
            />
          )}
          {draft.mode === "markdown" && (
            <MarkdownEditor value={draft.markdown ?? ""} onChange={(v) => patch({ markdown: v })} />
          )}
          {draft.mode === "html" && (
            <HtmlEditor value={draft.html ?? ""} onChange={(v) => patch({ html: v })} />
          )}
        </div>
        <div className="overflow-hidden">
          <EmailPreview draftId={draft.id} revision={previewRev} />
        </div>
      </div>
    </div>
  )
}
