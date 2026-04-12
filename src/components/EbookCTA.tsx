import { cloudinaryUrl, cloudinarySrcSet } from "@/lib/cloudinary"

const EBOOK_IMAGE_ID = "100_retos_eBook_c43arl"
const DOWNLOAD_URL =
  "https://shop.beacons.ai/cerebros.esponjosos/c9df420e-8074-48c1-a036-a5436f9f0cf1?pageViewSource=lib_view&referrer=https%3A%2F%2Fbeacons.ai%2Fcerebros.esponjosos&show_back_button=true"

export function EbookCTA() {
  return (
    <div className="not-prose my-10 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-2)] overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Cover image */}
        <div className="sm:w-48 shrink-0 bg-[var(--c-surface)]">
          <img
            src={cloudinaryUrl(EBOOK_IMAGE_ID, 400)}
            srcSet={cloudinarySrcSet(EBOOK_IMAGE_ID)}
            sizes="(max-width: 640px) 100vw, 192px"
            alt="100 ejercicios para mantener tu cerebro activo — ebook gratuito"
            className="w-full h-48 sm:h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* Text + CTA */}
        <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-text-subtle)] mb-2">
              Ebook gratuito
            </p>
            <h3 className="font-serif text-xl text-[var(--c-text)] leading-snug">
              100 ejercicios para mantener tu cerebro activo
            </h3>
            <p className="mt-2 text-sm text-[var(--c-text-muted)] leading-relaxed">
              Organizados por función cognitiva — memoria, atención, lenguaje, función ejecutiva y
              habilidades visuoespaciales. Con instrucciones claras y progresión de dificultad.
              Funciona impreso o en pantalla.
            </p>
          </div>
          <a
            href={DOWNLOAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-[var(--c-text)] text-[var(--c-bg)] text-sm font-medium px-6 py-2.5 hover:opacity-90 active:scale-95 transition-all duration-150"
          >
            Descargar gratis
          </a>
        </div>
      </div>
    </div>
  )
}
