import { LazyMotion, domAnimation } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowLeft, ArrowUpRight, Mail, Play } from "lucide-react"
import { NoiseOverlay } from "@/components/NoiseOverlay"
import { Footer } from "@/sections/Footer"
import { FadeIn } from "@/components/FadeIn"
import { Button } from "@/components/ui/button"
import { dynamicContent, type IgTopReel } from "@/content/dynamic"

const CONTACT_EMAIL = "contacto@cerebrosesponjosos.com"
const INSTAGRAM_PROFILE = "https://instagram.com/cerebrosesponjosos"

function formatNumber(n: number | null | undefined): string {
  if (n == null) return "—"
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export function MediaKit() {
  const stats = dynamicContent.instagramStats
  const reels = stats?.topReels ?? []

  const metrics = [
    {
      label: "Seguidores",
      value: formatNumber(stats?.followersCount ?? null),
      sub: "@cerebros.esponjosos",
    },
    {
      label: "Engagement rate",
      value:
        stats?.avgEngagementRate != null
          ? `${stats.avgEngagementRate.toFixed(2)}%`
          : "—",
      sub: `últimos ${stats?.reelsSampled ?? 0} reels`,
    },
    {
      label: "Views promedio",
      value: formatNumber(stats?.avgViewsPerReel ?? null),
      sub: "por reel",
    },
    {
      label: "Likes promedio",
      value: formatNumber(stats?.avgLikesPerReel ?? null),
      sub: "por reel",
    },
    {
      label: "Alcance · 30 días",
      value: formatNumber(stats?.reach30d ?? null),
      sub: "cuentas únicas",
    },
    {
      label: "Cuentas interactuadas",
      value: formatNumber(stats?.accountsEngaged30d ?? null),
      sub: "últimos 30 días",
    },
    {
      label: "Views totales",
      value: formatNumber(stats?.totalReelViews ?? null),
      sub: `suma ${stats?.reelsSampled ?? 0} reels`,
    },
    {
      label: "Publicaciones",
      value: formatNumber(stats?.mediaCount ?? null),
      sub: "total en Instagram",
    },
  ]

  return (
    <LazyMotion features={domAnimation}>
      <div className="relative min-h-screen bg-[#0a0a0b] text-zinc-100 overflow-x-hidden font-sans">
        <NoiseOverlay />

        {/* Minimal nav */}
        <nav className="relative z-20 px-6 py-6 border-b border-white/[0.06]">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="font-serif text-base text-white">
                Cerebros Esponjosos
              </span>
            </Link>
            <Button asChild size="sm" variant="primary">
              <a href={`mailto:${CONTACT_EMAIL}?subject=Colaboración`}>
                <Mail className="h-4 w-4" aria-hidden="true" />
                Escríbenos
              </a>
            </Button>
          </div>
        </nav>

        <main className="relative z-10">
          {/* Hero */}
          <section className="px-6 pt-28 pb-20">
            <div className="max-w-6xl mx-auto">
              <FadeIn>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-4">
                  Media Kit · 2026
                </p>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h1
                  className="font-serif text-white leading-[0.95] tracking-[-0.03em] mb-8 max-w-4xl"
                  style={{ fontSize: "clamp(2.75rem, 7vw, 6rem)" }}
                >
                  Colaboremos para{" "}
                  <span className="italic text-zinc-500">
                    hacer la neurología entendible.
                  </span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-lg text-zinc-400 max-w-2xl leading-relaxed">
                  Somos Oscar y Stephanie, dos residentes de neurología creando
                  contenido en español que traduce la ciencia del cerebro a una
                  audiencia que quiere entender su cuerpo, su mente y la de los
                  suyos.
                </p>
              </FadeIn>
            </div>
          </section>

          {/* Stats */}
          <section className="px-6 py-20 border-t border-white/[0.06]">
            <div className="max-w-6xl mx-auto">
              <FadeIn className="mb-12 max-w-2xl">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-4">
                  La audiencia
                </p>
                <h2
                  className="font-serif text-white leading-[1.05] tracking-[-0.02em]"
                  style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
                >
                  Una comunidad que{" "}
                  <span className="italic text-zinc-400">sí lee los captions.</span>
                </h2>
              </FadeIn>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metrics.map((m, i) => (
                  <FadeIn key={m.label} delay={i * 0.05}>
                    <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 h-full">
                      <p className="text-xs uppercase tracking-[0.15em] text-zinc-500 mb-3">
                        {m.label}
                      </p>
                      <p
                        className="font-serif text-white leading-none tracking-tight"
                        style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
                      >
                        {m.value}
                      </p>
                      <p className="text-xs text-zinc-500 mt-3">{m.sub}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
              <p className="text-xs text-zinc-600 mt-6">
                {stats
                  ? "Métricas en vivo desde Instagram Graph API."
                  : "Métricas disponibles pronto."}
              </p>
            </div>
          </section>

          {/* Top reels */}
          {reels.length > 0 && (
            <section className="px-6 py-20 border-t border-white/[0.06]">
              <div className="max-w-6xl mx-auto">
                <FadeIn className="mb-12 max-w-2xl">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-4">
                    Top reels
                  </p>
                  <h2
                    className="font-serif text-white leading-[1.05] tracking-[-0.02em]"
                    style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
                  >
                    Los que más{" "}
                    <span className="italic text-zinc-400">conectaron.</span>
                  </h2>
                </FadeIn>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {reels.map((r, i) => (
                    <FadeIn key={r.id} delay={i * 0.05}>
                      <TopReelCard reel={r} />
                    </FadeIn>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Formats */}
          <section className="px-6 py-20 border-t border-white/[0.06]">
            <div className="max-w-6xl mx-auto">
              <FadeIn className="mb-12 max-w-2xl">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-4">
                  Formatos
                </p>
                <h2
                  className="font-serif text-white leading-[1.05] tracking-[-0.02em]"
                  style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
                >
                  Cómo podemos{" "}
                  <span className="italic text-zinc-400">trabajar juntos.</span>
                </h2>
              </FadeIn>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  {
                    title: "Reel patrocinado",
                    body: "Una pieza educativa con tu marca integrada de forma orgánica — el formato que mejor funciona con nuestra audiencia.",
                  },
                  {
                    title: "Carrusel educativo",
                    body: "Contenido largo en slides, ideal para explicar productos o campañas con profundidad.",
                  },
                  {
                    title: "Menciones en YouTube",
                    body: "Integración natural dentro de los episodios largos del canal.",
                  },
                  {
                    title: "Newsletter patrocinado",
                    body: "Colocación dedicada en nuestra newsletter semanal a suscriptores de alta intención.",
                  },
                ].map((f, i) => (
                  <FadeIn key={f.title} delay={i * 0.05}>
                    <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-7 h-full">
                      <h3 className="text-lg font-medium text-white mb-2">
                        {f.title}
                      </h3>
                      <p className="text-sm text-zinc-400 leading-relaxed">
                        {f.body}
                      </p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="px-6 py-32 border-t border-white/[0.06]">
            <div className="max-w-3xl mx-auto text-center">
              <FadeIn>
                <h2
                  className="font-serif text-white leading-[1.05] tracking-[-0.02em] mb-6"
                  style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}
                >
                  ¿Hablamos?
                </h2>
              </FadeIn>
              <FadeIn delay={0.1}>
                <p className="text-lg text-zinc-400 mb-10">
                  Respondemos cada mensaje. Cuéntanos qué tienes en mente.
                </p>
              </FadeIn>
              <FadeIn delay={0.2}>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button asChild size="lg" variant="primary">
                    <a href={`mailto:${CONTACT_EMAIL}?subject=Colaboración`}>
                      <Mail className="h-4 w-4" aria-hidden="true" />
                      {CONTACT_EMAIL}
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="ghost">
                    <a
                      href={INSTAGRAM_PROFILE}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      DM en Instagram
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </Button>
                </div>
              </FadeIn>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </LazyMotion>
  )
}

function TopReelCard({ reel }: { reel: IgTopReel }) {
  const thumb = reel.thumbnailUrl
  const alt = reel.caption ? reel.caption.slice(0, 100) : "Instagram reel"
  return (
    <a
      href={reel.permalink}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl border border-white/[0.08] bg-[#111113] overflow-hidden hover:border-white/[0.2] transition-all"
    >
      <div className="relative aspect-[9/16] overflow-hidden">
        {thumb ? (
          <img
            src={thumb}
            alt={alt}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-700"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform">
          <Play className="h-4 w-4 fill-black" aria-hidden="true" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-sm text-white/90 line-clamp-2 mb-3">{alt}</p>
          <div className="flex gap-4 text-[11px] font-mono uppercase tracking-wider text-zinc-300">
            <span>{formatNumber(reel.views)} views</span>
            <span>{formatNumber(reel.likes)} likes</span>
            <span>{formatNumber(reel.comments)} com.</span>
          </div>
        </div>
      </div>
    </a>
  )
}
