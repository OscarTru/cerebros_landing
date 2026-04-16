"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import type { MotionValue } from "framer-motion"
import { manifestoSegments } from "@/content/site"

function Segment({
  text,
  italic,
  range,
  progress,
}: {
  text: string
  italic: boolean
  range: [number, number]
  progress: MotionValue<number>
}) {
  const opacity = useTransform(progress, range, [0.15, 1])
  return (
    <motion.span
      className={`mr-[0.3em] inline ${italic ? "italic text-[var(--c-text-muted)]" : "text-[var(--c-text)]"}`}
      style={{ opacity }}
    >
      {text}
    </motion.span>
  )
}

export function Manifesto() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.4"],
  })

  return (
    <section
      id="manifiesto"
      ref={ref}
      className="relative py-40 px-6 z-10"
    >
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, var(--c-glow) 0%, transparent 65%)",
        }}
      />
      <p
        className="relative font-serif leading-[1.15] max-w-5xl mx-auto"
        style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)" }}
      >
        {manifestoSegments.map((seg, i) => {
          const start = i / manifestoSegments.length
          const end = start + 1 / manifestoSegments.length
          return (
            <Segment
              key={i}
              text={seg.text}
              italic={seg.italic}
              range={[start, end]}
              progress={scrollYProgress}
            />
          )
        })}
      </p>
    </section>
  )
}
