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
    <aside
      className="w-56 shrink-0 h-screen sticky top-0 flex flex-col card-elevated"
      style={{
        background: "var(--c-surface)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRight: "1px solid var(--c-border)",
        position: "relative",
      }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-60px",
          left: "-40px",
          width: "240px",
          height: "240px",
          background: "radial-gradient(circle, var(--c-glow) 0%, transparent 65%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Branding */}
        <div
          className="px-4 py-5"
          style={{ borderBottom: "1px solid var(--c-border)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="shrink-0 rounded-md"
              style={{
                width: 24,
                height: 24,
                background: "var(--c-invert)",
              }}
            />
            <div>
              <p className="text-xs font-semibold" style={{ color: "var(--c-text)", letterSpacing: "-0.01em" }}>
                Cerebros Esponjosos
              </p>
              <p style={{ fontSize: "10px", color: "var(--c-text-subtle)", marginTop: 1 }}>
                Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-3 flex flex-col gap-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                  active
                    ? "font-medium"
                    : "hover:bg-[var(--c-surface-2)]"
                )}
                style={
                  active
                    ? {
                        background: "var(--c-invert)",
                        color: "var(--c-invert-fg)",
                      }
                    : {
                        color: "var(--c-text-muted)",
                      }
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div
          className="px-4 py-3 flex items-center gap-2.5"
          style={{ borderTop: "1px solid var(--c-border)" }}
        >
          <UserButton
            appearance={{
              elements: { avatarBox: "w-7 h-7" },
            }}
          />
        </div>
      </div>
    </aside>
  )
}
