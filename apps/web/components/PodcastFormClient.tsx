"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, ArrowRight } from "lucide-react"

export function PodcastFormClient() {
  const router = useRouter()
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
      router.push("/suscripcion/confirma")
    } catch {
      setErrorMsg("Error de red. Intenta de nuevo.")
      setStatus("error")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      <div
        className={`relative h-14 rounded-full bg-[var(--c-surface)] border ${
          status === "error"
            ? "border-red-400/60"
            : "border-[var(--c-border)] focus-within:border-[var(--c-border-strong)]"
        } transition-colors`}
      >
        <input
          type="email"
          aria-label="Tu dirección de correo"
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
      {errorMsg && <p role="alert" className="mt-3 text-xs text-red-400">{errorMsg}</p>}
      <p className="mt-4 text-xs text-[var(--c-text-faint)]">
        Al suscribirte aceptas la{" "}
        <Link href="/privacidad" className="underline hover:text-[var(--c-text-subtle)]">
          política de privacidad
        </Link>
        .
      </p>
    </form>
  )
}
