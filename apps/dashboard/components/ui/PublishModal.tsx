"use client"
import { useRouter } from "next/navigation"
import { Heart, Play, FileText, Mail, X } from "lucide-react"

interface PublishModalProps {
  isOpen: boolean
  onClose: () => void
}

const OPTIONS = [
  {
    key: "instagram",
    label: "Instagram",
    description: "Reel, carrusel o post",
    icon: Heart,
    bg: "bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af]",
    href: "/contenido?new=1&platform=instagram",
  },
  {
    key: "youtube",
    label: "YouTube",
    description: "Video o short",
    icon: Play,
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
