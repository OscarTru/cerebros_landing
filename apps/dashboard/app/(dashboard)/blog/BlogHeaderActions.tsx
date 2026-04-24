"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { PenLine, Loader2 } from "lucide-react"

export function BlogHeaderActions() {
  const router = useRouter()
  const [creating, setCreating] = useState(false)

  async function handleNew() {
    setCreating(true)
    try {
      const res = await fetch("/api/blog/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const json = await res.json()
      if (res.ok && json.id) router.push(`/blog/editor/${json.id}`)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex items-center gap-2 mt-1">
      <button
        onClick={handleNew}
        disabled={creating}
        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[var(--c-invert)] text-[var(--c-invert-fg)] text-[12px] font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PenLine className="h-3.5 w-3.5" />}
        Nuevo post
      </button>
    </div>
  )
}
