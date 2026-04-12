import { useState, useEffect, useRef } from "react"
import type { Heading } from "@/lib/readingTime"

interface TableOfContentsProps {
  headings: Heading[]
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("")
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (headings.length < 2) return

    const elements = headings
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Pick the topmost intersecting heading
        const intersecting = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (intersecting.length > 0) {
          setActiveId(intersecting[0].target.id)
        }
      },
      {
        rootMargin: "-20% 0px -70% 0px",
      }
    )

    elements.forEach((el) => observerRef.current!.observe(el))

    return () => {
      observerRef.current?.disconnect()
    }
  }, [headings])

  if (headings.length < 2) return null

  return (
    <nav aria-label="Tabla de contenidos">
      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--c-text-subtle)] mb-4">
        En este artículo
      </p>
      <ul className="flex flex-col gap-2">
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
                  "block text-xs leading-snug transition-colors py-0.5",
                  isActive
                    ? "text-[var(--c-text)] border-l-2 border-[var(--c-invert)] pl-2"
                    : "text-[var(--c-text-faint)] hover:text-[var(--c-text-muted)]",
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
