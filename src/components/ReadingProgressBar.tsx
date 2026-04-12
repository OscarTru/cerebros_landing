// src/components/ReadingProgressBar.tsx
import { useState, useEffect } from "react"

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let rafId: number

    function update() {
      const scrollY = window.scrollY
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight
      const pct = totalHeight > 0 ? (scrollY / totalHeight) * 100 : 0
      setProgress(Math.min(100, Math.max(0, pct)))
    }

    function onScroll() {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(update)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    update() // set initial value

    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 z-50 h-[2px] w-full"
      style={{ backgroundColor: "transparent" }}
    >
      <div
        className="h-full transition-none"
        style={{
          width: `${progress}%`,
          backgroundColor: "var(--c-invert)",
        }}
      />
    </div>
  )
}
