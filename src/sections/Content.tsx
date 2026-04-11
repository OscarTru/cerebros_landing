import { ArrowUpRight, Play, BookOpen } from "lucide-react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { FadeIn } from "@/components/FadeIn"
import { dynamicContent, type IgPost } from "@/content/dynamic"
import { easeOut, viewportOnce } from "@/lib/motion"

interface PostMeta {
  slug: string
  title: string
  date: string
  description: string
  author: string
}

const blogModules = import.meta.glob("../content/blog/*.mdx", { eager: true })

function getLatestPost(): PostMeta | null {
  const posts = Object.values(blogModules)
    .map((m) => (m as { frontmatter?: PostMeta }).frontmatter)
    .filter(Boolean)
    .sort((a, b) => (a!.date < b!.date ? 1 : -1)) as PostMeta[]
  return posts[0] ?? null
}

export function Content() {
  const { latestVideo, instagramPosts } = dynamicContent

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

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Reels — 2 últimos, tall 9:16 */}
          {instagramPosts.slice(0, 2).map((p, i) => (
            <motion.div
              key={p.id}
              className="md:col-span-4"
              initial={{ opacity: 0, y: 32, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={viewportOnce}
              transition={{ duration: 0.7, delay: i * 0.08, ease: easeOut }}
            >
              <ReelCard post={p} />
            </motion.div>
          ))}

          {/* YouTube short — tall 9:16 */}
          <motion.div
            className="md:col-span-4"
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={viewportOnce}
            transition={{ duration: 0.7, delay: 0.16, ease: easeOut }}
          >
            <YouTubeShortCard video={latestVideo} />
          </motion.div>

          {/* Blog — full width */}
          <motion.div
            className="md:col-span-12"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.7, delay: 0.24, ease: easeOut }}
          >
            <BlogCard />
          </motion.div>
        </div>
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
      className="group block h-full rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] overflow-hidden hover:border-[var(--c-border-strong)] transition-all"
    >
      <div className="relative aspect-[9/16] overflow-hidden">
        <img
          src={thumb}
          alt={alt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-700"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.1) 55%, transparent)",
          }}
        />
        <div className="absolute top-5 left-5 text-[10px] font-mono uppercase tracking-[0.2em] text-white/85">
          Instagram · Reel
        </div>
        <div className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform">
          <Play className="h-4 w-4 fill-black" aria-hidden="true" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-sm text-white/90 line-clamp-2">{alt}</p>
        </div>
      </div>
    </a>
  )
}

function YouTubeShortCard({ video }: { video: typeof dynamicContent.latestVideo }) {
  const href = video?.url ?? "#"
  const title = video?.title ?? "Próximamente"
  const thumb = video ? `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg` : null

  return (
    <a
      href={href}
      target={video ? "_blank" : undefined}
      rel={video ? "noopener noreferrer" : undefined}
      className="group block h-full rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] overflow-hidden hover:border-[var(--c-border-strong)] transition-all"
    >
      <div className="relative aspect-[9/16] overflow-hidden">
        {thumb ? (
          <img
            src={thumb}
            alt={title}
            loading="eager"
            className="absolute inset-0 h-full w-full object-cover scale-[1.8] opacity-85 group-hover:opacity-100 group-hover:scale-[1.85] transition-all duration-700"
          />
        ) : (
          <div
            className="absolute inset-0 bg-[var(--c-surface-2)]"
            aria-hidden="true"
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.1) 55%, transparent)",
          }}
        />
        <div className="absolute top-5 left-5 text-[10px] font-mono uppercase tracking-[0.2em] text-white/85">
          YouTube · Short
        </div>
        <div className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform">
          <Play className="h-4 w-4 fill-black" aria-hidden="true" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-white/70 mb-2">
            Último episodio
          </p>
          <h3 className="font-serif text-white leading-tight text-lg line-clamp-2">
            {title}
          </h3>
        </div>
      </div>
    </a>
  )
}

function BlogCard() {
  const post = getLatestPost()
  if (!post) return null

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex items-center justify-between gap-6 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-7 hover:border-[var(--c-border-strong)] hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-center gap-6">
        <div className="p-3 rounded-xl bg-[var(--c-surface-2)] border border-[var(--c-border)] group-hover:bg-[var(--c-invert)] group-hover:text-[var(--c-invert-fg)] transition-colors shrink-0">
          <BookOpen className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--c-text-subtle)] mb-2">
            Blog · Último artículo
          </p>
          <h3 className="font-serif text-xl text-[var(--c-text)] leading-snug mb-1">
            {post.title}
          </h3>
          <p className="text-sm text-[var(--c-text-subtle)]">
            por {post.author}
          </p>
        </div>
      </div>
      <ArrowUpRight
        className="h-5 w-5 text-[var(--c-text-subtle)] group-hover:text-[var(--c-text)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0"
        aria-hidden="true"
      />
    </Link>
  )
}
