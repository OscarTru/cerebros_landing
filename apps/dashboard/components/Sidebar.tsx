"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import {
  BarChart2,
  Mail,
  Handshake,
  FileText,
  Bot,
  Users,
  LayoutDashboard,
} from "lucide-react"
import { cn } from "@cerebros/lib"
import Image from "next/image"

const navGroups = [
  {
    label: "Hoy",
    items: [
      { href: "/", label: "Overview", icon: LayoutDashboard },
      { href: "/analytics", label: "Analytics", icon: BarChart2 },
      { href: "/agentes", label: "Agentes IA", icon: Bot, badge: "nuevo" },
    ],
  },
  {
    label: "Operación",
    items: [
      { href: "/newsletter", label: "Newsletter", icon: Mail },
      { href: "/colaboraciones", label: "Colaboraciones", icon: Handshake },
      { href: "/contenido", label: "Contenido", icon: FileText },
      { href: "/equipo", label: "Equipo", icon: Users },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-[var(--c-border)] bg-[var(--c-surface)]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-[var(--c-border)] px-4 py-4">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--c-invert)]">
          <Image
            src="/assets/brain.png"
            alt="Cerebros Esponjosos"
            width={18}
            height={18}
            className="invert dark:invert-0"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold leading-tight tracking-tight text-[var(--c-text)]">
            Cerebros
          </p>
          <p className="mt-0.5 text-[10px] leading-none tracking-[0.05em] text-[var(--c-text-subtle)] uppercase">
            Dashboard
          </p>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-2.5 py-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-1 px-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--c-text-subtle)]">
              {group.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map(({ href, label, icon: Icon, badge }) => {
                const active = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] transition-colors",
                      active
                        ? "bg-[var(--c-invert)] font-medium text-[var(--c-invert-fg)]"
                        : "text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)] hover:text-[var(--c-text)]"
                    )}
                  >
                    <Icon className="h-[15px] w-[15px] shrink-0" strokeWidth={1.75} />
                    <span className="flex-1">{label}</span>
                    {badge && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-px text-[10px] font-medium",
                          active
                            ? "bg-white/15 text-white/90"
                            : "bg-[var(--c-surface-2)] text-[var(--c-text-muted)]"
                        )}
                      >
                        {badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="flex items-center gap-2.5 border-t border-[var(--c-border)] px-4 py-3">
        <UserButton appearance={{ elements: { avatarBox: { width: 28, height: 28 } } }} />
      </div>
    </aside>
  )
}
