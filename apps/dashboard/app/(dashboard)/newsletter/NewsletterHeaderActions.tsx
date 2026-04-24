"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Download, PenLine, Loader2 } from "lucide-react"

export function NewsletterHeaderActions() {
  const router = useRouter()
  const [creating, setCreating] = useState(false)

  function handleExport() {
    window.location.href = "/api/newsletter/export"
  }

  async function handleNew() {
    setCreating(true)
    try {
      const res = await fetch("/api/newsletter/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const json = await res.json()
      if (res.ok && json.id) router.push(`/newsletter/editor/${json.id}`)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex items-center gap-2 mt-1">
      <button
        onClick={handleExport}
        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full border border-[var(--c-border)] bg-[var(--c-surface-2)] text-[12px] font-medium text-[var(--c-text-muted)] hover:bg-[var(--c-surface-3)] transition-colors"
      >
        <Download className="h-3.5 w-3.5" />
        Exportar
      </button>
      <button
        onClick={handleNew}
        disabled={creating}
        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[var(--c-invert)] text-[var(--c-invert-fg)] text-[12px] font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PenLine className="h-3.5 w-3.5" />}
        Redactar envío
      </button>
    </div>
  )
}
