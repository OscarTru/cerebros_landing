import type { Metadata } from "next"
import Link from "next/link"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Footer } from "@/sections/Footer"
import { PodcastFormClient } from "@/components/PodcastFormClient"

export const metadata: Metadata = {
  title: "Podcast",
  description:
    "El podcast de Cerebros Esponjosos — neurociencia en palabras claras. Pronto retomamos con nuevos episodios.",
}

export default function PodcastPage() {
  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)]">
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-[var(--c-bg)]/70 border-b border-[var(--c-border)]">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-16">
          <Link
            href="/"
            className="font-serif text-xl text-[var(--c-text)] tracking-tight hover:text-[var(--c-text-muted)] transition-colors"
          >
            Cerebros Esponjosos
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="inline-block px-4 py-1 border border-[var(--c-border)] rounded-full text-[11px] font-mono tracking-[0.25em] uppercase text-[var(--c-text-subtle)] mb-10">
          · Podcast ·
        </div>
        <h1
          className="font-serif leading-[1.05] tracking-[-0.02em] mb-8 max-w-2xl"
          style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
        >
          <span className="block text-[var(--c-text)]">Pronto volvemos</span>
          <span className="block italic text-[var(--c-text-faint)]">con más episodios.</span>
        </h1>
        <p className="text-base text-[var(--c-text-muted)] max-w-md leading-relaxed mb-10">
          Estamos trabajando para retomar el podcast con temas que te hagan entender tu cerebro de una
          forma diferente. Deja tu correo y te avisamos cuando llegue.
        </p>

        <PodcastFormClient />
      </main>
      <Footer />
    </div>
  )
}
