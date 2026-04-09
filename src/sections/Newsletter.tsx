import { useState } from "react"
import { useNavigate } from "react-router-dom"
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
  const navigate = useNavigate()
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
      navigate("/suscripcion/confirma")
    } catch {
      setErrorMsg("Error de red. Intenta de nuevo.")
      setStatus("error")
    }
  }

  return (
    <section
      id="newsletter"
      className="relative py-40 px-6 bg-[#111113] border-y border-white/[0.06] z-10"
    >
      <div className="max-w-3xl mx-auto text-center">
        <FadeIn>
          <div className="inline-block px-4 py-1 border border-white/10 rounded-full text-[11px] font-mono tracking-[0.25em] uppercase text-zinc-400 mb-10">
            · {newsletter.eyebrow} ·
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h2
            className="font-serif leading-[1.05] tracking-[-0.02em] mb-10"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
          >
            <span className="block text-white">{newsletter.titleA}</span>
            <span className="block italic text-zinc-500">
              {newsletter.titleB}
            </span>
          </h2>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="text-base text-zinc-400 max-w-xl mx-auto mb-12 leading-relaxed">
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
              className={`relative h-14 rounded-full bg-black/40 border ${
                errors.email || status === "error"
                  ? "border-red-400/60"
                  : "border-white/10 focus-within:border-white/30"
              } transition-colors`}
            >
              <input
                type="email"
                placeholder={newsletter.placeholder}
                aria-label="Email"
                disabled={status === "loading"}
                {...register("email")}
                className="absolute inset-0 h-full w-full bg-transparent pl-6 pr-36 text-sm text-white placeholder:text-zinc-500 focus:outline-none rounded-full"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-6 rounded-full bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors inline-flex items-center gap-2 disabled:opacity-60"
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
              <p className="mt-3 text-xs text-red-400">{errors.email.message}</p>
            )}
            {errorMsg && !errors.email && (
              <p className="mt-3 text-xs text-red-400">{errorMsg}</p>
            )}
            <label className="mt-5 flex items-start gap-3 text-xs text-zinc-500 text-left cursor-pointer">
              <input
                type="checkbox"
                {...register("consent")}
                className="mt-0.5 h-4 w-4 rounded border-white/20 bg-black/40 accent-white cursor-pointer"
              />
              <span>
                Acepto recibir la newsletter y la{" "}
                <a
                  href="/privacidad"
                  className="underline decoration-zinc-600 hover:decoration-white"
                >
                  política de privacidad
                </a>
                .
              </span>
            </label>
            {errors.consent && (
              <p className="mt-2 text-xs text-red-400 text-left">
                {errors.consent.message}
              </p>
            )}
            <p className="mt-4 text-xs text-zinc-600">{newsletter.finePrint}</p>
          </form>
        </FadeIn>
      </div>
    </section>
  )
}
