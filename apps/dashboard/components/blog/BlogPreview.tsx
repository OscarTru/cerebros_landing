"use client"
import { useEffect, useRef, useState } from "react"
import { Monitor, Smartphone, Loader2 } from "lucide-react"
import { cn } from "@cerebros/lib"

interface Props {
  postId: string
  revision: number
}

export function BlogPreview({ postId, revision }: Props) {
  const [html, setHtml] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop")
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/blog/posts/${postId}/preview-render`, { method: "POST" })
      .then((r) => r.json())
      .then((j) => { if (!cancelled) setHtml(j.html ?? "") })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [postId, revision])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-[var(--c-border)] px-4 py-2">
        <p className="text-[11px] font-medium uppercase tracking-widest text-[var(--c-text-subtle)]">Preview</p>
        <div className="flex gap-1">
          <button onClick={() => setDevice("desktop")} className={cn("flex h-7 w-7 items-center justify-center rounded-md", device === "desktop" ? "bg-[var(--c-surface-3)] text-[var(--c-text)]" : "text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)]")} aria-label="Desktop"><Monitor className="h-3.5 w-3.5" /></button>
          <button onClick={() => setDevice("mobile")} className={cn("flex h-7 w-7 items-center justify-center rounded-md", device === "mobile" ? "bg-[var(--c-surface-3)] text-[var(--c-text)]" : "text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)]")} aria-label="Mobile"><Smartphone className="h-3.5 w-3.5" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-[var(--c-bg)] p-6">
        <div className={cn("mx-auto transition-all", device === "desktop" ? "max-w-[720px]" : "max-w-[380px]")}>
          <div className="relative rounded-xl overflow-hidden border border-[var(--c-border)] bg-white shadow-lg">
            {loading && (
              <div className="absolute top-2 right-2 z-10 rounded-full bg-black/60 px-2 py-1 text-[10px] text-white inline-flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> render
              </div>
            )}
            <iframe
              ref={iframeRef}
              srcDoc={html}
              sandbox="allow-same-origin"
              className="w-full h-[720px] block border-0"
              title="Blog post preview"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
