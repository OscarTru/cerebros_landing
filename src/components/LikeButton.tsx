// src/components/LikeButton.tsx
import { useState, useEffect } from "react"
import { getFingerprint } from "@/lib/fingerprint"
import { analytics } from "@/lib/analytics"

interface LikeButtonProps {
  slug: string
}

export function LikeButton({ slug }: LikeButtonProps) {
  const [count, setCount] = useState<number | null>(null)
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getFingerprint().then((fp) => {
      const qs = new URLSearchParams({ slug })
      if (fp) qs.set("fp", fp)
      fetch(`/api/likes?${qs.toString()}`)
        .then((r) => r.json())
        .then((data: { count: number; liked: boolean }) => {
          setCount(data.count)
          setLiked(data.liked)
        })
        .catch(() => setCount(0))
    })
  }, [slug])

  async function handleLike() {
    if (liked || loading) return
    setLoading(true)
    try {
      const fp = await getFingerprint()
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, fp }),
      })
      const data = (await res.json()) as { ok: boolean; count: number }
      if (data.ok) {
        setCount(data.count)
        setLiked(true)
        analytics.blogPostLike(slug)
      }
    } finally {
      setLoading(false)
    }
  }

  // Loading skeleton
  if (count === null) {
    return (
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="h-3 w-32 rounded bg-[var(--c-surface-2)] animate-pulse" />
        <div className="h-9 w-28 rounded-full bg-[var(--c-surface-2)] animate-pulse" />
      </div>
    )
  }

  // Estado activo: ya dio like
  if (liked) {
    return (
      <div className="flex items-center gap-2">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="#ef4444"
          stroke="#ef4444"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span className="text-sm text-[var(--c-text-muted)]">{count}</span>
      </div>
    )
  }

  // Estado inicial: aún no ha dado like
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--c-text-subtle)]">
        ¿Te gustó este artículo?
      </p>
      <button
        onClick={handleLike}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-[var(--c-border)] bg-transparent text-sm text-[var(--c-text-muted)] hover:border-[var(--c-border-strong)] hover:text-[var(--c-text)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        aria-label="Me gustó este artículo"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span className="text-[var(--c-text)]">Me gustó</span>
        <span className="text-[var(--c-text-subtle)] text-xs">· {count}</span>
      </button>
    </div>
  )
}
