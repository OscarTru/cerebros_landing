import { Play } from "lucide-react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { FadeIn } from "@/components/FadeIn"
import { dynamicContent, type IgPost } from "@/content/dynamic"
import { easeOut, viewportOnce } from "@/lib/motion"
import { isCloudinaryId, cloudinaryUrl, cloudinarySrcSet } from "@/lib/cloudinary"
import { ALL_POSTS, type PostMeta } from "@/content/blogMeta"

function getLatestPosts(n: number): PostMeta[] {
  return ALL_POSTS.slice(0, n)
}

function formatDate(iso: string) {
  const [y, mo, d] = iso.split("-").map(Number)
  return new Date(y, mo - 1, d).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const cardAnim = (delay: number) => ({
  initial: { opacity: 0, y: 28, scale: 0.97 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: viewportOnce,
  transition: { duration: 0.65, delay, ease: easeOut },
})

export function Content() {
  const { latestVideo, instagramPosts } = dynamicContent
  const latestPosts = getLatestPosts(2)

  return (
    <section
      id="contenido"
      className="relative py-32 px-6 border-t border-[var(--c-border)] z-10"
    >
      <div className="max-w-6xl mx-auto">
        <FadeIn className="mb-16 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-text-subtle)] mb-4">
            Contenido
          </p>
          <h2
            className="font-serif text-[var(--c-text)] leading-[1.05] tracking-[-0.02em]"
            style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)" }}
          >
            El universo <span className="italic text-[var(--c-text-muted)]">Cerebros Esponjosos.</span>
          </h2>
        </FadeIn>

        {/* Row 1: 2 IG reels + YouTube video */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {instagramPosts.slice(0, 2).map((p, i) => (
            <motion.div key={p.id} {...cardAnim(i * 0.08)}>
              <ReelCard post={p} />
            </motion.div>
          ))}
          <motion.div {...cardAnim(0.16)}>
            <YouTubeCard video={latestVideo} />
          </motion.div>
        </div>

        {/* Row 2: Latest blog posts */}
        {latestPosts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {latestPosts.map((post, i) => (
              <motion.div key={post.slug} {...cardAnim(0.24 + i * 0.08)}>
                <BlogPostCard post={post} index={i} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function ReelCard({ post }: { post: IgPost }) {
  const thumb = post.thumbnailUrl ?? post.mediaUrl
  const alt = post.caption ? post.caption.slice(0, 100) : "Instagram reel"

  return (
    <a
      href={post.permalink}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] overflow-hidden hover:border-[var(--c-border-strong)] transition-all"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={thumb}
          alt={alt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-700"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.05) 60%, transparent)" }}
        />
        <div className="absolute top-4 left-4 text-[9px] font-mono uppercase tracking-[0.2em] text-white/80">
          Instagram · Reel
        </div>
        <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 text-black flex items-center justify-center group-hover:scale-110 transition-transform">
          <Play className="h-3.5 w-3.5 fill-black" aria-hidden="true" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-xs text-white/90 line-clamp-2 leading-snug">{alt}</p>
        </div>
      </div>
    </a>
  )
}

function YouTubeCard({ video }: { video: typeof dynamicContent.latestVideo }) {
  const href = video?.url ?? "#"
  const title = video?.title ?? "Próximamente"
  const thumb = video ? `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg` : null

  return (
    <a
      href={href}
      target={video ? "_blank" : undefined}
      rel={video ? "noopener noreferrer" : undefined}
      className="group block rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] overflow-hidden hover:border-[var(--c-border-strong)] transition-all"
    >
      <div className="relative aspect-video overflow-hidden">
        {thumb ? (
          <img
            src={thumb}
            alt={title}
            loading="eager"
            className="absolute inset-0 h-full w-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-700"
          />
        ) : (
          <div className="absolute inset-0 bg-[var(--c-surface-2)]" aria-hidden="true" />
        )}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.05) 60%, transparent)" }}
        />
        <div className="absolute top-4 left-4 text-[9px] font-mono uppercase tracking-[0.2em] text-white/80">
          YouTube
        </div>
        <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 text-black flex items-center justify-center group-hover:scale-110 transition-transform">
          <Play className="h-3.5 w-3.5 fill-black" aria-hidden="true" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/60 mb-1">
            Último video
          </p>
          <h3 className="font-serif text-white leading-tight text-sm line-clamp-2">
            {title}
          </h3>
        </div>
      </div>
    </a>
  )
}

const PLACEHOLDER_GRADIENTS = [
  "linear-gradient(135deg, #1e1b2e, #2d1f3d)",
  "linear-gradient(135deg, #0f1a12, #1a2e1f)",
  "linear-gradient(135deg, #1a1200, #2e2200)",
]

function BlogPostCard({ post, index }: { post: PostMeta; index: number }) {
  const gradient = PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length]

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group block rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] overflow-hidden hover:border-[var(--c-border-strong)] transition-all"
    >
      {/* Cover image */}
      <div className="relative aspect-video overflow-hidden">
        {post.image ? (
          isCloudinaryId(post.image) ? (
            <img
              src={cloudinaryUrl(post.image, 800)}
              srcSet={cloudinarySrcSet(post.image)}
              sizes="(max-width: 640px) 100vw, 50vw"
              alt={post.title}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-700"
            />
          ) : (
            <img
              src={post.image}
              alt={post.title}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-700"
            />
          )
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: gradient }}
            aria-hidden="true"
          />
        )}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent 70%)" }}
        />
        <div className="absolute top-4 left-4 text-[9px] font-mono uppercase tracking-[0.2em] text-white/80">
          Blog
        </div>
      </div>

      {/* Text */}
      <div className="p-5">
        <time className="text-[10px] font-mono text-[var(--c-text-subtle)] uppercase tracking-[0.15em] block mb-2">
          {formatDate(post.date)}
        </time>
        <h3 className="font-serif text-base text-[var(--c-text)] leading-snug mb-2 line-clamp-2">
          {post.title}
        </h3>
        <p className="text-xs text-[var(--c-text-muted)] leading-relaxed line-clamp-2">
          {post.description}
        </p>
      </div>
    </Link>
  )
}
