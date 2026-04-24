"use client"
import { InfoCard } from "../InfoCard"
import { motion } from "framer-motion"
import { cn } from "@cerebros/lib"

interface PostStat {
  icon: React.ReactNode
  value: string | number
}

interface PostItem {
  id: string
  thumbnail: string
  title?: string
  caption?: string
  stats: PostStat[]
  href?: string
}

interface PostGridCardProps {
  title: string
  posts: PostItem[]
  aspectRatio?: "square" | "video" | "portrait"
  columns?: 2 | 3
}

const aspectClass: Record<NonNullable<PostGridCardProps["aspectRatio"]>, string> = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[9/16]",
}

export function PostGridCard({
  title,
  posts,
  aspectRatio = "square",
  columns = 3,
}: PostGridCardProps) {
  return (
    <InfoCard title={title}>
      <div
        className={cn(
          "grid gap-3",
          columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        )}
      >
        {posts.map((p) => {
          const Wrapper: React.ElementType = p.href ? "a" : "div"
          return (
            <Wrapper
              key={p.id}
              href={p.href}
              target="_blank"
              rel="noopener"
              className="group block overflow-hidden rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-2)] transition-colors hover:border-[var(--c-border-strong)]"
            >
              <motion.div
                className={cn("relative w-full overflow-hidden bg-[var(--c-surface-3)]", aspectClass[aspectRatio])}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.25 }}
              >
                {p.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.thumbnail}
                    alt={p.title ?? p.caption ?? ""}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full" />
                )}
              </motion.div>
              <div className="p-3">
                {(p.title ?? p.caption) && (
                  <p className="line-clamp-2 text-[12px] font-medium text-[var(--c-text)]">
                    {p.title ?? p.caption}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-3">
                  {p.stats.map((s, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[11px] text-[var(--c-text-muted)]"
                    >
                      {s.icon}
                      {typeof s.value === "number" ? s.value.toLocaleString("es-MX") : s.value}
                    </span>
                  ))}
                </div>
              </div>
            </Wrapper>
          )
        })}
      </div>
    </InfoCard>
  )
}
