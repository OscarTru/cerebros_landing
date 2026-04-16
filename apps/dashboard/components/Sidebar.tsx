"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
    <aside className="w-60 shrink-0 h-screen sticky top-0 bg-[var(--c-surface)] border-r border-[var(--c-border)] flex flex-col">
      <div className="px-5 py-6 border-b border-[var(--c-border)]">
        <span className="text-sm font-semibold text-[var(--c-text)]">
          Cerebros Esponjosos
        </span>
        <p className="text-xs text-[var(--c-text-muted)] mt-0.5">Dashboard</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-[var(--c-invert)] text-[var(--c-invert-fg)]"
                  : "text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)] hover:text-[var(--c-text)]"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
