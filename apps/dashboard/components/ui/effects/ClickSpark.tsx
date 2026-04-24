"use client"
import { useRef } from "react"

interface ClickSparkProps {
  children: React.ReactNode
  sparkColor?: string
}

export function ClickSpark({ children, sparkColor = "currentColor" }: ClickSparkProps) {
  const ref = useRef<HTMLDivElement>(null)

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const count = 6
    const angleStep = (Math.PI * 2) / count
    for (let i = 0; i < count; i++) {
      const spark = document.createElement("span")
      spark.style.position = "absolute"
      spark.style.left = `${x}px`
      spark.style.top = `${y}px`
      spark.style.width = "4px"
      spark.style.height = "4px"
      spark.style.borderRadius = "50%"
      spark.style.background = sparkColor
      spark.style.pointerEvents = "none"
      spark.style.opacity = "0.8"
      spark.style.transform = "translate(-50%, -50%)"
      spark.style.transition = "transform 0.5s ease-out, opacity 0.5s ease-out"
      ref.current.appendChild(spark)

      const angle = angleStep * i
      const dx = Math.cos(angle) * 20
      const dy = Math.sin(angle) * 20

      requestAnimationFrame(() => {
        spark.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`
        spark.style.opacity = "0"
      })

      setTimeout(() => spark.remove(), 500)
    }
  }

  return (
    <div
      ref={ref}
      onClick={handleClick}
      style={{ position: "relative" }}
    >
      {children}
    </div>
  )
}
