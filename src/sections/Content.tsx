import { ArrowUpRight, Play, Camera, BookOpen, AtSign } from "lucide-react"
import { FadeIn } from "@/components/FadeIn"
import { dynamicContent, type IgPost } from "@/content/dynamic"

const INSTAGRAM_PROFILE = "https://instagram.com/cerebrosesponjosos"

export function Content() {
  const { latestVideo, instagramPosts } = dynamicContent

  return (
    <section
      id="contenido"
      className="relative py-32 px-6 border-t border-white/[0.06] z-10"
    >
      <div className="max-w-6xl mx-auto">
        <FadeIn className="mb-16 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-4">
            Contenido
          </p>
          <h2
            className="font-serif text-white leading-[1.05] tracking-[-0.02em]"
            style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}
          >
            El universo <span className="italic text-zinc-400">Cerebros Esponjosos.</span>
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* YouTube — 8 cols, row-span-2 */}
          <FadeIn className="md:col-span-8 md:row-span-2">
            <YouTubeCard video={latestVideo} />
          </FadeIn>

          {/* Instagram — 4 cols, row-span-2 */}
          <FadeIn delay={0.1} className="md:col-span-4 md:row-span-2">
            <InstagramCard posts={instagramPosts} />
          </FadeIn>

          {/* Blog — full width */}
          <FadeIn delay={0.15} className="md:col-span-12">
            <BlogCard />
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

function YouTubeCard({ video }: { video: typeof dynamicContent.latestVideo }) {
  const href = video?.url ?? "#"
  const title = video?.title ?? "Próximamente"
  const thumb = video?.thumbnail

  return (
    <a
      href={href}
      target={video ? "_blank" : undefined}
      rel={video ? "noopener noreferrer" : undefined}
      className="group block h-full rounded-2xl border border-white/[0.08] bg-[#111113] overflow-hidden hover:border-white/[0.2] transition-all"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {thumb ? (
          <img
            src={thumb}
            alt={title}
            loading="eager"
            className="absolute inset-0 h-full w-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-[1.02] transition-all duration-700"
            onError={(e) => {
              const img = e.currentTarget
              if (video && img.src.includes("maxresdefault")) {
                img.src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`
              }
            }}
          />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black"
            aria-hidden="true"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="absolute top-6 right-6 w-14 h-14 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform">
          <Play className="h-5 w-5 fill-black" aria-hidden="true" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-400 mb-3">
            Último episodio
          </p>
          <h3
            className="font-serif text-white leading-tight"
            style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)" }}
          >
            {title}
          </h3>
        </div>
      </div>
    </a>
  )
}

function InstagramCard({ posts }: { posts: IgPost[] }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/[0.08] bg-[#111113] overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10">
            <AtSign className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-white leading-none">Instagram</p>
            <p className="text-xs text-zinc-500 mt-1">@cerebrosesponjosos</p>
          </div>
        </div>
      </div>

      {posts.length > 0 ? (
        <div className="flex-1 flex flex-col gap-1 px-1 pb-1">
          {posts.map((p) => (
            <a
              key={p.id}
              href={p.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block flex-1 overflow-hidden rounded-xl"
            >
              <img
                src={p.thumbnailUrl ?? p.mediaUrl}
                alt={p.caption ? p.caption.slice(0, 100) : "Instagram post"}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              {p.mediaType !== "IMAGE" && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-[10px] text-white uppercase tracking-wider">
                  {p.mediaType === "VIDEO" ? "Video" : "Carrusel"}
                </div>
              )}
            </a>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center px-6 pb-6">
          <div className="text-center">
            <Camera className="h-8 w-8 text-zinc-600 mx-auto mb-3" aria-hidden="true" />
            <p className="text-sm text-zinc-500">Próximamente</p>
          </div>
        </div>
      )}

      <a
        href={INSTAGRAM_PROFILE}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06] text-sm text-zinc-300 hover:text-white transition-colors"
      >
        <span>Ver comunidad</span>
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </a>
    </div>
  )
}

function BlogCard() {
  return (
    <a
      href="#"
      className="group flex items-center justify-between gap-6 rounded-2xl border border-white/[0.08] bg-[#111113] p-7 hover:border-white/[0.2] hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-center gap-6">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white group-hover:text-black transition-colors">
          <BookOpen className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-white mb-1">Artículos y Blog</h3>
          <p className="text-sm text-zinc-500">
            Literatura digerida para leer en 5 minutos.
          </p>
        </div>
      </div>
      <ArrowUpRight
        className="h-5 w-5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
        aria-hidden="true"
      />
    </a>
  )
}
