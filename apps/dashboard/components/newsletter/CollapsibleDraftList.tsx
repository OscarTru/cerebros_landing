"use client"
import { useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, ArrowRight } from "lucide-react"
import { DraftList, type DraftListItem } from "./DraftList"

interface Props {
  items: DraftListItem[]
  variant?: "active" | "history"
  // Ruta a la que saltar si hay demasiados items para expandir inline.
  seeAllHref: string
  // Cuántos mostrar colapsado.
  previewCount?: number
  // A partir de cuántos total, en vez de expandir inline se ofrece ir a la página completa.
  pageThreshold?: number
}

export function CollapsibleDraftList({
  items,
  variant = "active",
  seeAllHref,
  previewCount = 3,
  pageThreshold = 6,
}: Props) {
  const [expanded, setExpanded] = useState(false)

  if (items.length === 0) {
    return <DraftList items={items} variant={variant} />
  }

  const total = items.length
  const shouldGoToPage = total > pageThreshold
  const base = items.slice(0, previewCount)
  const extras = items.slice(previewCount)
  const hiddenCount = extras.length

  return (
    <div className="flex flex-col gap-3">
      <DraftList items={base} variant={variant} />

      <AnimatePresence initial={false}>
        {expanded && !shouldGoToPage && extras.length > 0 && (
          <motion.div
            key="extras"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 0.25, ease: "easeOut" },
            }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: -8 }}
              animate={{ y: 0 }}
              exit={{ y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <DraftList items={extras} variant={variant} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {total > previewCount && (
        <div className="flex justify-center">
          {shouldGoToPage ? (
            <Link
              href={seeAllHref}
              className="inline-flex items-center gap-1.5 h-8 px-4 rounded-full border border-[var(--c-border)] bg-[var(--c-surface)] text-[12px] font-medium text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)] transition-colors"
            >
              Ver todos ({total}) <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <motion.button
              onClick={() => setExpanded((v) => !v)}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-1.5 h-8 px-4 rounded-full border border-[var(--c-border)] bg-[var(--c-surface)] text-[12px] font-medium text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)] transition-colors"
            >
              {expanded ? "Mostrar menos" : `Ver ${hiddenCount} más`}
              <motion.span
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </motion.span>
            </motion.button>
          )}
        </div>
      )}
    </div>
  )
}
