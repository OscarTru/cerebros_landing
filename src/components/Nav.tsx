import { useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Menu } from "lucide-react"
import { Link } from "react-router-dom"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/ThemeToggle"
import { navLinks } from "@/content/site"

export function Nav() {
  const { scrollYProgress, scrollY } = useScroll()
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1])
  const [open, setOpen] = useState(false)

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-[var(--c-bg)]/70"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="absolute inset-x-0 bottom-0 h-px bg-[var(--c-border)]"
        style={{ opacity: borderOpacity }}
        aria-hidden="true"
      />
      <nav className="mx-auto max-w-6xl flex items-center justify-between px-6 h-16">
        <a
          href="#top"
          className="font-serif text-xl text-[var(--c-text)] tracking-tight"
        >
          Cerebros Esponjosos
        </a>

        <ul className="hidden md:flex items-center gap-10 text-sm text-[var(--c-text-muted)]">
          {navLinks.map((l) => (
            <li key={l.href}>
              {l.href.startsWith("/") ? (
                <Link to={l.href} className="hover:text-[var(--c-text)] transition-colors">
                  {l.label}
                </Link>
              ) : (
                <a href={l.href} className="hover:text-[var(--c-text)] transition-colors">
                  {l.label}
                </a>
              )}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                className="text-[var(--c-text-muted)] hover:text-[var(--c-text)] p-2"
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </SheetTrigger>
              <SheetContent>
                <div className="mt-16 flex flex-col gap-8">
                  {navLinks.map((l) => (
                    <SheetClose asChild key={l.href}>
                      {l.href.startsWith("/") ? (
                        <Link
                          to={l.href}
                          className="font-serif text-3xl text-[var(--c-text)] hover:text-[var(--c-text-muted)] transition-colors"
                        >
                          {l.label}
                        </Link>
                      ) : (
                        <a
                          href={l.href}
                          className="font-serif text-3xl text-[var(--c-text)] hover:text-[var(--c-text-muted)] transition-colors"
                        >
                          {l.label}
                        </a>
                      )}
                    </SheetClose>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      <motion.div
        className="h-px bg-[var(--c-text)] origin-left"
        style={{ scaleX: scrollYProgress }}
        aria-hidden="true"
      />
    </motion.header>
  )
}
