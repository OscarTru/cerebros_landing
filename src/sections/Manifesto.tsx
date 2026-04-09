import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import type { MotionValue } from "framer-motion"
import { manifestoText, manifestoItalicWords } from "@/content/site"

function Word({
  word,
  range,
  progress,
  italic,
}: {
  word: string
  range: [number, number]
  progress: MotionValue<number>
  italic: boolean
}) {
  const opacity = useTransform(progress, range, [0.18, 1])
  return (
    <motion.span
      className={`mr-[0.25em] inline-block ${italic ? "italic text-[var(--c-text-muted)]" : ""}`}
      style={{ opacity }}
    >
      {word}
    </motion.span>
  )
}

export function Manifesto() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.4"],
  })

  const words = manifestoText.split(" ")

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
        className="relative font-serif text-[var(--c-text)] leading-[1.15] max-w-5xl mx-auto"
        style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)" }}
      >
        {words.map((word, i) => {
          const start = i / words.length
          const end = start + 1 / words.length
          const clean = word.replace(/[.,]/g, "")
          const italic = manifestoItalicWords.includes(word) || manifestoItalicWords.includes(clean)
          return (
            <Word
              key={i}
              word={word}
              italic={italic}
              range={[start, end]}
              progress={scrollYProgress}
            />
          )
        })}
      </p>
    </section>
  )
}
