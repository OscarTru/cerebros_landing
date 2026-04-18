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
    <aside style={{
      width: "224px",
      flexShrink: 0,
      height: "100vh",
      position: "sticky",
      top: 0,
      display: "flex",
      flexDirection: "column",
      background: "var(--c-surface)",
      borderRight: "1px solid var(--c-border)",
      boxShadow: "1px 0 0 var(--c-border)",
    }}>
      {/* Ambient glow */}
      <div aria-hidden="true" style={{
        position: "absolute",
        top: "-60px",
        left: "-40px",
        width: "240px",
        height: "240px",
        background: "radial-gradient(circle, var(--c-glow) 0%, transparent 65%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>

        {/* Branding */}
        <div style={{
          padding: "20px 16px",
          borderBottom: "1px solid var(--c-border)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: "7px",
            background: "var(--c-invert)",
            flexShrink: 0,
          }} />
          <div>
            <p style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--c-text)",
              letterSpacing: "-0.01em",
              margin: 0,
              lineHeight: 1.3,
            }}>
              Cerebros Esponjosos
            </p>
            <p style={{
              fontSize: "10px",
              color: "var(--c-text-subtle)",
              margin: 0,
              marginTop: "1px",
              lineHeight: 1,
            }}>
              Dashboard
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{
          flex: 1,
          padding: "12px 10px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          overflowY: "auto",
        }}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: active ? 500 : 400,
                  color: active ? "var(--c-invert-fg)" : "var(--c-text-muted)",
                  background: active ? "var(--c-invert)" : "transparent",
                  textDecoration: "none",
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.background = "var(--c-surface-2)"
                    ;(e.currentTarget as HTMLAnchorElement).style.color = "var(--c-text)"
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent"
                    ;(e.currentTarget as HTMLAnchorElement).style.color = "var(--c-text-muted)"
                  }
                }}
              >
                <Icon style={{ width: 15, height: 15, flexShrink: 0 }} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--c-border)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}>
          <UserButton appearance={{ elements: { avatarBox: { width: 28, height: 28 } } }} />
        </div>
      </div>
    </aside>
  )
}
