"use client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { FileText, CheckCircle2, Eye, Archive, Pencil, Trash2, Loader2 } from "lucide-react"
import { cn } from "@cerebros/lib"
import { useToast } from "@/components/ui/Toast"
import { useConfirm } from "@/components/ui/ConfirmDialog"

export interface BlogPostListItem {
  id: string
  slug: string
  title: string
  description?: string | null
  author?: string | null
  status: "draft" | "published" | "archived"
  views: number
  updated_at: string
  published_at: string | null
}

const STATUS_CONFIG: Record<BlogPostListItem["status"], { label: string; cls: string; icon: typeof FileText }> = {
  draft:     { label: "Borrador",   cls: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",          icon: FileText },
  published: { label: "Publicado",  cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
  archived:  { label: "Archivado",  cls: "bg-zinc-400/10 text-zinc-400 border-zinc-400/20",          icon: Archive },
}

export function BlogPostList({ items: initialItems }: { items: BlogPostListItem[] }) {
  const [items, setItems] = useState(initialItems)

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--c-border)] bg-[var(--c-surface)] px-6 py-12 text-center">
        <p className="text-[14px] text-[var(--c-text-muted)]">No hay posts todavía. Escribe el primero.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <BlogPostCard
          key={item.id}
          item={item}
          onDeleted={() => setItems((prev) => prev.filter((p) => p.id !== item.id))}
        />
      ))}
    </div>
  )
}

function BlogPostCard({ item, onDeleted }: { item: BlogPostListItem; onDeleted: () => void }) {
  const router = useRouter()
  const toast = useToast()
  const confirm = useConfirm()
  const cfg = STATUS_CONFIG[item.status]
  const Icon = cfg.icon
  const isEditable = item.status === "draft"
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const ok = await confirm({
      title: `Eliminar "${item.title}"`,
      description: "El borrador se eliminará permanentemente. Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar",
      kind: "danger",
    })
    if (!ok) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/blog/posts/${item.id}`, { method: "DELETE" })
      if (res.ok) {
        toast.show({ kind: "success", title: "Borrador eliminado" })
        onDeleted()
      } else {
        const json = await res.json().catch(() => ({}))
        toast.show({ kind: "error", title: "No se pudo eliminar", description: json.error })
      }
    } finally {
      setDeleting(false)
    }
  }

  function handleEdit(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/blog/editor/${item.id}`)
  }

  return (
    <Link
      href={`/blog/editor/${item.id}`}
      className="group relative flex flex-col gap-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-5 transition-colors hover:border-[var(--c-border-strong)] hover:bg-[var(--c-surface-2)]"
    >
      {/* Action buttons visibles en hover (solo drafts) */}
      {isEditable && (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={handleEdit}
            title="Editar"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text-muted)] hover:bg-[var(--c-surface-3)] hover:text-[var(--c-text)] shadow-sm"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Eliminar"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--c-border)] bg-[var(--c-surface)] text-red-500 hover:bg-red-500/10 shadow-sm disabled:opacity-50"
          >
            {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
          </button>
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <p className={cn("line-clamp-2 text-[14px] font-semibold text-[var(--c-text)]", isEditable && "pr-16")}>{item.title}</p>
        {!isEditable && (
          <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium whitespace-nowrap", cfg.cls)}>
            <Icon className="h-3 w-3" />
            {cfg.label}
          </span>
        )}
      </div>
      {isEditable && (
        <span className={cn("inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium", cfg.cls)}>
          <Icon className="h-3 w-3" />
          {cfg.label}
        </span>
      )}
      <p className="line-clamp-2 text-[12px] text-[var(--c-text-muted)]">
        {item.description || "Sin descripción"}
      </p>
      <div className="mt-auto flex items-center justify-between pt-3 border-t border-[var(--c-border)]">
        <span className="inline-flex items-center gap-1 text-[10.5px] text-[var(--c-text-subtle)]">
          <Eye className="h-3 w-3" /> {item.views.toLocaleString("es-MX")}
        </span>
        <span className="text-[10.5px] text-[var(--c-text-subtle)]">
          {new Date(item.published_at ?? item.updated_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      </div>
    </Link>
  )
}
