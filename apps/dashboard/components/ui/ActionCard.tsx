"use client"
import Link from "next/link"
import { cn } from "@cerebros/lib"
import type { LucideIcon } from "lucide-react"
import { ArrowUpRight } from "lucide-react"
import { motion } from "framer-motion"

interface ActionCardProps {
  title: string
  description?: string
  icon: LucideIcon
  href: string
  className?: string
}

export function ActionCard({
  title,
  description,
  icon: Icon,
  href,
  className,
}: ActionCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Link
        href={href}
        className={cn(
          "relative block h-full overflow-hidden rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-5 transition-colors hover:border-[var(--c-border-strong)] shadow-[0_1px_4px_rgba(0,0,0,0.06)]",
          className
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)]">
            <Icon className="h-4 w-4 text-[var(--c-text)]" />
          </div>
          <ArrowUpRight className="h-4 w-4 text-[var(--c-text-subtle)]" />
        </div>
        <p className="mt-4 text-sm font-semibold tracking-tight text-[var(--c-text)]">
          {title}
        </p>
        {description && (
          <p className="mt-1 text-xs text-[var(--c-text-muted)]">{description}</p>
        )}
      </Link>
    </motion.div>
  )
}
