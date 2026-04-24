"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, Loader2, Send, EyeOff, Eye, ExternalLink, Trash2 } from "lucide-react"
import { BlogMarkdownEditor } from "@/components/blog/BlogMarkdownEditor"
import { BlogPreview } from "@/components/blog/BlogPreview"
import { useToast } from "@/components/ui/Toast"
import { useConfirm } from "@/components/ui/ConfirmDialog"

export interface BlogPostRow {
  id: string
  slug: string
  title: string
  description: string | null
  author: string | null
  image: string | null
  content: string
  tags: string[] | null
  status: "draft" | "published" | "archived"
  views: number
  reading_time: number | null
  published_at: string | null
  updated_at: string
  created_by: string
}

type Saved = "idle" | "saving" | "saved" | "error"

export function BlogEditorClient({
  initialPost,
  role,
}: {
  initialPost: BlogPostRow
  role: "owner" | "editor" | "viewer"
}) {
  const router = useRouter()
  const toast = useToast()
  const confirm = useConfirm()

  const [post, setPost] = useState<BlogPostRow>(initialPost)
  const [saved, setSaved] = useState<Saved>("idle")
  const [previewRev, setPreviewRev] = useState(0)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const canPublish = role === "owner"
  const isPublished = post.status === "published"

  function patch(delta: Partial<BlogPostRow>) {
    const next = { ...post, ...delta }
    setPost(next)
    scheduleSave(next)
  }

  function scheduleSave(next: BlogPostRow) {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setSaved("saving")
    saveTimer.current = setTimeout(() => persist(next), 900)
  }

  async function persist(next: BlogPostRow) {
    try {
      const res = await fetch(`/api/blog/posts/${next.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: next.title,
          slug: next.slug,
          description: next.description,
          content: next.content,
          image: next.image,
          author: next.author,
          tags: next.tags,
        }),
      })
      if (res.ok) {
        setSaved("saved")
        setPreviewRev((r) => r + 1)
        const json = await res.json().catch(() => ({}))
        if (json.slug && json.slug !== next.slug) {
          setPost((p) => ({ ...p, slug: json.slug }))
        }
      } else {
        setSaved("error")
        const json = await res.json().catch(() => ({}))
        toast.show({ kind: "error", title: "Error al guardar", description: json.error ?? `HTTP ${res.status}` })
      }
    } catch (e) {
      setSaved("error")
      toast.show({ kind: "error", title: "Error al guardar", description: e instanceof Error ? e.message : "Error de red" })
    }
  }

  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current) }, [])

  const [publishing, setPublishing] = useState(false)
  async function handlePublish() {
    const ok = await confirm({
      title: isPublished ? "Guardar cambios y re-publicar" : "Publicar este post",
      description: isPublished
        ? "El post actualizado reemplazará al anterior en el landing y se enviará a revalidación."
        : "El post aparecerá en cerebrosesponjosos.com/blog en segundos. Solo los lectores con el link directo podrán verlo antes de la revalidación.",
      confirmLabel: isPublished ? "Re-publicar" : "Publicar",
    })
    if (!ok) return
    setPublishing(true)
    try {
      // Primero fuerza save inmediato
      if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null }
      await persist(post)

      const res = await fetch(`/api/blog/posts/${post.id}/publish`, { method: "POST" })
      const json = await res.json()
      if (res.ok) {
        setPost((p) => ({ ...p, status: "published", published_at: new Date().toISOString() }))
        toast.show({
          kind: "success",
          title: "Post publicado",
          description: json.revalidated ? "Ya aparece en el blog." : "Publicado en DB, el landing lo mostrará en ≤60s.",
        })
      } else {
        toast.show({ kind: "error", title: "No se pudo publicar", description: json.error })
      }
    } finally { setPublishing(false) }
  }

  const [unpublishing, setUnpublishing] = useState(false)
  async function handleUnpublish() {
    const ok = await confirm({
      title: "Ocultar este post",
      description: "El post dejará de ser visible en el blog público. Puedes volver a publicarlo después.",
      confirmLabel: "Despublicar",
    })
    if (!ok) return
    setUnpublishing(true)
    try {
      const res = await fetch(`/api/blog/posts/${post.id}/unpublish`, { method: "POST" })
      const json = await res.json()
      if (res.ok) {
        setPost((p) => ({ ...p, status: "draft", published_at: null }))
        toast.show({ kind: "success", title: "Post despublicado" })
      } else {
        toast.show({ kind: "error", title: "No se pudo despublicar", description: json.error })
      }
    } finally { setUnpublishing(false) }
  }

  const [deleting, setDeleting] = useState(false)
  async function handleDelete() {
    const ok = await confirm({
      title: `Eliminar "${post.title}"`,
      description: isPublished
        ? "El post se eliminará de la base de datos Y se quitará del landing. Esta acción no se puede deshacer."
        : "El borrador se eliminará permanentemente. Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar",
      kind: "danger",
    })
    if (!ok) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/blog/posts/${post.id}`, { method: "DELETE" })
      const json = await res.json().catch(() => ({}))
      if (res.ok) {
        toast.show({ kind: "success", title: "Post eliminado" })
        setTimeout(() => router.push("/blog"), 600)
      } else {
        toast.show({ kind: "error", title: "No se pudo eliminar", description: json.error })
      }
    } finally { setDeleting(false) }
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
          <button onClick={() => router.push("/blog")} className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--c-border)] text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)]" aria-label="Volver">
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <input
            value={post.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="Título del post"
            className="min-w-0 flex-1 max-w-md rounded-lg bg-transparent px-2 py-1 text-[15px] font-semibold text-[var(--c-text)] placeholder:text-[var(--c-text-faint)] outline-none focus:bg-[var(--c-surface-2)]"
          />
          {savedBadge}
          {isPublished && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 border border-emerald-500/20">
              Publicado
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isPublished && (
            <a
              href={`${process.env.NEXT_PUBLIC_WEB_URL || ""}/blog/${post.slug}`}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-[var(--c-border)] bg-[var(--c-surface-2)] text-[12px] font-medium text-[var(--c-text-muted)] hover:bg-[var(--c-surface-3)]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver en vivo
            </a>
          )}

          {canPublish && isPublished && (
            <button onClick={handleUnpublish} disabled={unpublishing} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-[var(--c-border)] bg-[var(--c-surface-2)] text-[12px] font-medium text-[var(--c-text-muted)] hover:bg-[var(--c-surface-3)] disabled:opacity-50">
              {unpublishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <EyeOff className="h-3.5 w-3.5" />}
              Despublicar
            </button>
          )}

          {canPublish && (
            <button onClick={handlePublish} disabled={publishing} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-[var(--c-invert)] text-[var(--c-invert-fg)] text-[12px] font-medium disabled:opacity-50">
              {publishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isPublished ? <Eye className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
              {isPublished ? "Re-publicar" : "Publicar"}
            </button>
          )}

          {canPublish && (
            <button onClick={handleDelete} disabled={deleting} className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--c-border)] text-red-500 hover:bg-red-500/10 disabled:opacity-50" title="Eliminar">
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Metadata row */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_200px] gap-3 border-b border-[var(--c-border)] px-6 py-3 shrink-0">
        <Field label="Slug" value={post.slug} onChange={(v) => patch({ slug: v })} />
        <Field label="Descripción" value={post.description ?? ""} onChange={(v) => patch({ description: v })} />
        <Field label="Autor" value={post.author ?? ""} onChange={(v) => patch({ author: v })} />
        <Field label="Imagen (Cloudinary ID)" value={post.image ?? ""} onChange={(v) => patch({ image: v })} placeholder="cerebros/post-hero" />
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 overflow-hidden">
        <div className="overflow-auto border-r border-[var(--c-border)] p-6">
          <BlogMarkdownEditor value={post.content} onChange={(v) => patch({ content: v })} />
        </div>
        <div className="overflow-hidden">
          <BlogPreview postId={post.id} revision={previewRev} />
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="flex flex-col gap-1 min-w-0">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--c-text-subtle)]">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[var(--c-border)] bg-[var(--c-surface-2)] px-3 py-1.5 text-[12px] text-[var(--c-text)] placeholder:text-[var(--c-text-faint)] outline-none focus:border-[var(--c-text-subtle)]"
      />
    </label>
  )
}
