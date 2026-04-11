import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Loader2, ArrowRight } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"

export function Podcast() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg("Introduce un email válido.")
      return
    }
    setStatus("loading")
    setErrorMsg(null)
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent: true }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setErrorMsg(data.error ?? "Algo salió mal. Intenta de nuevo.")
        setStatus("error")
        return
      }
      navigate("/suscripcion/confirma")
    } catch {
      setErrorMsg("Error de red. Intenta de nuevo.")
      setStatus("error")
    }
  }

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)]">
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-[var(--c-bg)]/70 border-b border-[var(--c-border)]">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-16">
          <Link
            to="/"
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
          Estamos trabajando para retomar el podcast con temas que te hagan entender tu cerebro de una forma diferente. Deja tu correo y te avisamos cuando llegue.
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <div
            className={`relative h-14 rounded-full bg-[var(--c-surface)] border ${
              status === "error" ? "border-red-400/60" : "border-[var(--c-border)] focus-within:border-[var(--c-border-strong)]"
            } transition-colors`}
          >
            <input
              type="email"
              placeholder="Tu mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading"}
              className="absolute inset-0 h-full w-full bg-transparent pl-6 pr-36 text-sm text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)] focus:outline-none rounded-full"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-5 rounded-full bg-[var(--c-invert)] text-[var(--c-invert-fg)] text-sm font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2 disabled:opacity-60"
            >
              {status === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <>
                  Avísame
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
          {errorMsg && (
            <p className="mt-3 text-xs text-red-400">{errorMsg}</p>
          )}
          <p className="mt-4 text-xs text-[var(--c-text-faint)]">
            Al suscribirte aceptas la{" "}
            <Link to="/privacidad" className="underline hover:text-[var(--c-text-subtle)]">
              política de privacidad
            </Link>
            .
          </p>
        </form>
      </main>
    </div>
  )
}
