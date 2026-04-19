import Link from "next/link"
import { ArrowRight, Play, BookOpen, Heart } from "lucide-react"
import { cn } from "@cerebros/lib"

export interface TopContentItem {
  id: string
  title: string
  thumbnail?: string
  platform: "instagram" | "youtube" | "blog"
  metric: string
  metricValue: string
  href: string
}

const platformConfig = {
  instagram: {
    label: "IG",
    iconBg: "bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af]",
    icon: Heart,
  },
  youtube: {
    label: "YT",
    iconBg: "bg-[#ff0000]",
    icon: Play,
  },
  blog: {
    label: "BLOG",
    iconBg: "bg-[#0F2633]",
    icon: BookOpen,
  },
}

interface TopContentFeedProps {
  items: TopContentItem[]
  actionHref?: string
}

export function TopContentFeed({ items, actionHref = "/analytics" }: TopContentFeedProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--c-border)] px-5 py-3.5">
        <p className="text-[13px] font-medium text-[var(--c-text)]">
          Lo que mejor funcionó <span className="text-[var(--c-text-muted)]">esta semana</span>
        </p>
        <Link
          href={actionHref}
          className="flex items-center gap-1 text-[12px] text-[var(--c-text-muted)] hover:text-[var(--c-text)] transition-colors"
        >
          Ver todo <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Feed */}
      {items.length === 0 ? (
        <div className="px-5 py-10 text-center text-[13px] text-[var(--c-text-muted)]">
          Aún no hay suficiente data esta semana.
        </div>
      ) : (
        <ul>
          {items.map((item, i) => {
            const cfg = platformConfig[item.platform]
            const Icon = cfg.icon
            return (
              <li key={item.id} className={cn(i > 0 && "border-t border-[var(--c-border)]")}>
                <a
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener"
                  className="group grid grid-cols-[56px_1fr_auto] items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-[var(--c-surface-2)]"
                >
                  {/* Thumbnail or platform icon */}
                  {item.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnail}
                      alt=""
                      className="h-14 w-14 rounded-[10px] object-cover"
                    />
                  ) : (
                    <div
                      className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-[10px] text-white",
                        cfg.iconBg
                      )}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                  )}

                  {/* Meta */}
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-[0.04em] text-[var(--c-text-muted)]">
                      {cfg.label} · {item.metric}
                    </p>
                    <p className="mt-1 truncate text-[13.5px] font-medium leading-snug text-[var(--c-text)]">
                      {item.title}
                    </p>
                  </div>

                  {/* Big number */}
                  <div className="text-right">
                    <p className="text-[22px] font-semibold leading-none tracking-[-0.02em] text-[var(--c-text)]">
                      {item.metricValue}
                    </p>
                  </div>
                </a>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
