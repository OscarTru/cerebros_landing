"use client"
import { useEffect, useState } from "react"
import { useMotionValue, useTransform, animate } from "framer-motion"

interface AnimatedNumberProps {
  value: number
  duration?: number
  format?: (n: number) => string
  className?: string
}

export function AnimatedNumber({
  value,
  duration = 1.2,
  format = (n) => Math.round(n).toLocaleString("es-MX"),
  className,
}: AnimatedNumberProps) {
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (latest) => format(latest))
  const [display, setDisplay] = useState(format(0))

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    })
    const unsub = rounded.on("change", (v) => setDisplay(v))
    return () => {
      controls.stop()
      unsub()
    }
  }, [value, duration, motionValue, rounded])

  return <span className={className}>{display}</span>
}
