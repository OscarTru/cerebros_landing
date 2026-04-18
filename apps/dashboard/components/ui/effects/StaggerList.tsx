"use client"
import { motion } from "framer-motion"

interface StaggerListProps {
  children: React.ReactNode[]
  staggerDelay?: number
  className?: string
}

export function StaggerList({
  children,
  staggerDelay = 0.05,
  className,
}: StaggerListProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: staggerDelay } },
      }}
    >
      {children.map((child, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 10 },
            show: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
