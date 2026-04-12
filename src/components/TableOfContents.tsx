import { useState, useEffect } from "react"
import type { Heading } from "@/lib/readingTime"

interface TableOfContentsProps {
  headings: Heading[]
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? "")

  useEffect(() => {
    if (headings.length < 2) return

    let rafId: number

    function updateActive() {
      const scrollY = window.scrollY
      const offset = 120 // px from top to consider "active"

      // Find the last heading whose top is above (scrollY + offset)
      let current = headings[0]?.id ?? ""
      for (const { id } of headings) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.getBoundingClientRect().top + scrollY <= scrollY + offset) {
          current = id
        }
      }
      setActiveId(current)
    }

    function onScroll() {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(updateActive)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    updateActive() // set on mount

    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [headings])

  if (headings.length < 2) return null

  return (
    <nav aria-label="Tabla de contenidos">
      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--c-text-subtle)] mb-5">
        En este artículo
      </p>
      <ul className="flex flex-col gap-1">
        {headings.map((h) => {
          const isActive = activeId === h.id
          return (
            <li key={h.id} className={h.level === 3 ? "pl-3" : ""}>
              <a
                href={`#${h.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" })
                  setActiveId(h.id)
                }}
                className={[
                  "block text-[11px] leading-snug py-1 transition-all duration-150",
                  isActive
                    ? "text-[var(--c-text)] font-medium border-l-2 border-[var(--c-invert)] pl-2 -ml-[2px]"
                    : "text-[var(--c-text-faint)] hover:text-[var(--c-text-muted)] pl-0",
                ].join(" ")}
              >
                {h.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
