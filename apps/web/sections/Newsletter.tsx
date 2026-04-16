"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, ArrowRight } from "lucide-react"
import { FadeIn } from "@/components/FadeIn"
import { newsletter } from "@/content/site"

const schema = z.object({
  email: z.string().email("Introduce un email válido."),
  consent: z.literal(true, {
    message: "Debes aceptar la política de privacidad.",
  }),
})
type FormValues = z.infer<typeof schema>

type Status = "idle" | "loading" | "error"

export function Newsletter() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    setStatus("loading")
    setErrorMsg(null)
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email, consent: values.consent }),
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
    <section
      id="newsletter"
      className="relative py-40 px-6 bg-[var(--c-surface)] border-y border-[var(--c-border)] z-10"
    >
      <div className="max-w-3xl mx-auto text-center">
        <FadeIn>
          <div className="inline-block px-4 py-1 border border-[var(--c-border)] rounded-full text-[11px] font-mono tracking-[0.25em] uppercase text-[var(--c-text-subtle)] mb-10">
            · {newsletter.eyebrow} ·
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h2
            className="font-serif leading-[1.05] tracking-[-0.02em] mb-10"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
          >
            <span className="block text-[var(--c-text)]">{newsletter.titleA}</span>
            <span className="block italic text-[var(--c-text-faint)]">
              {newsletter.titleB}
            </span>
          </h2>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="text-base text-[var(--c-text-muted)] max-w-xl mx-auto mb-12 leading-relaxed">
            {newsletter.subcopy}
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto max-w-md"
            noValidate
          >
            <div
              className={`relative h-14 rounded-full bg-[var(--c-surface-2)] ring-1 ${
                errors.email || status === "error"
                  ? "ring-red-400/60"
                  : "ring-transparent focus-within:ring-2 focus-within:ring-[var(--c-text-muted)]"
              } transition-all`}
            >
              <input
                type="email"
                placeholder={newsletter.placeholder}
                aria-label="Email"
                disabled={status === "loading"}
                {...register("email")}
                className="absolute inset-0 h-full w-full bg-transparent pl-6 pr-36 text-sm text-[var(--c-text)] placeholder:text-[var(--c-text-subtle)] outline-none focus:outline-none focus:ring-0 rounded-full"
                style={{ outline: "none", boxShadow: "none" }}
              />
              <button
                type="submit"
                disabled={status === "loading"}
                aria-label={status === "loading" ? "Enviando..." : undefined}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-6 rounded-full bg-[var(--c-invert)] text-[var(--c-invert-fg)] text-sm font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {status === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <>
                    {newsletter.cta}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
            {errors.email && (
              <p role="alert" className="mt-3 text-xs text-red-400">{errors.email.message}</p>
            )}
            {errorMsg && !errors.email && (
              <p role="alert" className="mt-3 text-xs text-red-400">{errorMsg}</p>
            )}
            <label className="mt-5 flex items-center justify-center gap-3 text-xs text-[var(--c-text-subtle)] text-center cursor-pointer">
              <input
                type="checkbox"
                {...register("consent")}
                className="h-4 w-4 rounded border-[var(--c-border-strong)] bg-[var(--c-surface-2)] accent-[var(--c-invert)] cursor-pointer shrink-0"
              />
              <span>
                Acepto recibir la newsletter y la{" "}
                <a
                  href="/privacidad"
                  className="underline decoration-[var(--c-border-strong)] hover:decoration-[var(--c-text)]"
                >
                  política de privacidad
                </a>
                .
              </span>
            </label>
            {errors.consent && (
              <p role="alert" className="mt-2 text-xs text-red-400 text-center">
                {errors.consent.message}
              </p>
            )}
            <p className="mt-4 text-xs text-[var(--c-text-faint)]">{newsletter.finePrint}</p>
          </form>
        </FadeIn>
      </div>
    </section>
  )
}
