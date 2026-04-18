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

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/newsletter", label: "Newsletter", icon: Mail },
  { href: "/colaboraciones", label: "Colaboraciones", icon: Handshake },
  { href: "/contenido", label: "Contenido", icon: FileText },
  { href: "/agentes", label: "Agentes IA", icon: Bot },
  { href: "/equipo", label: "Equipo", icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="relative w-56 shrink-0 h-screen sticky top-0 flex flex-col bg-[var(--c-surface)] border-r border-[var(--c-border)] backdrop-blur-xl">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -left-10 w-60 h-60 z-0"
        style={{ background: "radial-gradient(circle, var(--c-glow) 0%, transparent 65%)" }}
      />

      <div className="relative z-10 flex flex-col flex-1 overflow-hidden">
        {/* Branding */}
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-[var(--c-border)]">
          <div className="w-7 h-7 rounded-md bg-[var(--c-invert)] shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[var(--c-text)] tracking-tight leading-tight truncate">
              Cerebros Esponjosos
            </p>
            <p className="text-[10px] text-[var(--c-text-subtle)] leading-none mt-0.5">
              Dashboard
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-3 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors",
                  active
                    ? "bg-[var(--c-invert)] text-[var(--c-invert-fg)] font-medium"
                    : "text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)] hover:text-[var(--c-text)]"
                )}
              >
                <Icon className="w-[15px] h-[15px] shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-t border-[var(--c-border)]">
          <UserButton appearance={{ elements: { avatarBox: { width: 28, height: 28 } } }} />
        </div>
      </div>
    </aside>
  )
}
