import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { cloudinaryUrl, cloudinarySrcSet } from "@/lib/cloudinary"
import { easeOut, viewportOnce } from "@/lib/motion"

const EBOOK_IMAGE_ID = "100_retos_eBook_c43arl"
const DOWNLOAD_URL =
  "https://shop.beacons.ai/cerebros.esponjosos/c9df420e-8074-48c1-a036-a5436f9f0cf1?pageViewSource=lib_view&referrer=https%3A%2F%2Fbeacons.ai%2Fcerebros.esponjosos&show_back_button=true"

export function EbookCTA() {
  return (
    <motion.a
      href={DOWNLOAD_URL}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={viewportOnce}
      transition={{ duration: 0.7, ease: easeOut }}
      className="not-prose group relative flex flex-col sm:flex-row items-center gap-10 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-8 sm:p-12 hover:border-[var(--c-border-strong)] transition-all overflow-hidden my-10"
    >
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 15% 50%, var(--c-glow) 0%, transparent 60%)",
        }}
      />

      {/* Book cover */}
      <motion.div
        className="relative shrink-0 w-40 sm:w-48"
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={viewportOnce}
        transition={{ duration: 0.8, delay: 0.1, ease: easeOut }}
      >
        <img
          src={cloudinaryUrl(EBOOK_IMAGE_ID, 400)}
          srcSet={cloudinarySrcSet(EBOOK_IMAGE_ID)}
          sizes="(max-width: 640px) 160px, 192px"
          alt="100 retos para activar tu cerebro — ebook"
          className="w-full rounded-xl shadow-2xl group-hover:scale-[1.03] transition-transform duration-500"
          loading="lazy"
          decoding="async"
        />
      </motion.div>

      {/* Text */}
      <div className="relative flex-1 min-w-0 text-center sm:text-left">
        <div className="inline-block px-3 py-0.5 rounded-full bg-[var(--c-surface-2)] border border-[var(--c-border)] text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--c-text-subtle)] mb-4">
          Ebook
        </div>
        <h3
          className="font-serif leading-snug text-[var(--c-text)] mb-4"
          style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}
        >
          100 retos para activar<br />
          <span className="italic text-[var(--c-text-muted)]">tu cerebro</span>
        </h3>
        <p className="text-sm text-[var(--c-text-muted)] leading-relaxed max-w-lg mb-8">
          Organizados por función cognitiva — memoria, atención, lenguaje, función ejecutiva y
          habilidades visuoespaciales. Con instrucciones claras y progresión de dificultad.
          Funciona impreso o en pantalla.
        </p>
        <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--c-invert)] text-[var(--c-invert-fg)] text-sm font-medium group-hover:opacity-90 transition-opacity">
          Conseguir ebook
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </motion.a>
  )
}
