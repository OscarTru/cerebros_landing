import { cn } from "@cerebros/lib"

interface InfoCardProps {
  title?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  padded?: boolean
}

export function InfoCard({
  title,
  action,
  children,
  className,
  padded = true,
}: InfoCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-[0_1px_4px_rgba(0,0,0,0.06)]",
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-[var(--c-border)] px-5 py-3.5">
          {title && (
            <p className="text-[13px] font-medium text-[var(--c-text)]">{title}</p>
          )}
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </div>
  )
}
