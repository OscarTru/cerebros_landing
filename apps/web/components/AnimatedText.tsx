"use client"

import { motion } from "framer-motion"
import { cn } from "@cerebros/lib"

export function AnimatedText({
  text,
  className,
  as: Tag = "h2",
}: {
  text: string
  className?: string
  as?: "h1" | "h2" | "h3" | "p" | "span"
}) {
  const words = text.split(" ")
  const MotionTag = motion[Tag]

  return (
    <MotionTag
      className={cn("flex flex-wrap", className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="mr-[0.25em] inline-block"
          variants={{
            hidden: { y: "100%", opacity: 0 },
            visible: { y: 0, opacity: 1 },
          }}
          transition={{
            duration: 0.7,
            delay: i * 0.08,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </MotionTag>
  )
}
