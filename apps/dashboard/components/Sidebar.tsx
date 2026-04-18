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
import { motion } from "framer-motion"
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
    <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-[var(--c-border)] bg-[var(--c-surface)] backdrop-blur-xl shadow-[1px_0_0_var(--c-border)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-10 -top-16 h-60 w-60 z-0"
        style={{ background: "radial-gradient(circle, var(--c-glow) 0%, transparent 65%)" }}
      />

      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-[var(--c-border)] px-4 py-5">
          <div className="h-7 w-7 shrink-0 rounded-md bg-[var(--c-invert)]" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold leading-tight tracking-tight text-[var(--c-text)]">
              Cerebros Esponjosos
            </p>
            <p className="mt-0.5 text-[10px] leading-none text-[var(--c-text-subtle)]">
              Dashboard
            </p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2.5 py-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <motion.div
                key={href}
                whileHover={!active ? { x: 2 } : undefined}
                transition={{ duration: 0.15 }}
              >
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors",
                    active
                      ? "bg-[var(--c-invert)] font-medium text-[var(--c-invert-fg)]"
                      : "text-[var(--c-text-muted)] hover:bg-[var(--c-surface-2)] hover:text-[var(--c-text)]"
                  )}
                >
                  <Icon className="h-[15px] w-[15px] shrink-0" />
                  {label}
                </Link>
              </motion.div>
            )
          })}
        </nav>

        <div className="flex items-center gap-2.5 border-t border-[var(--c-border)] px-4 py-3">
          <UserButton appearance={{ elements: { avatarBox: { width: 28, height: 28 } } }} />
        </div>
      </div>
    </aside>
  )
}
