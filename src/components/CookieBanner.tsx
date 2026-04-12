import { useState } from "react"
import { Link } from "react-router-dom"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { loadGA } from "@/lib/analytics"

type CookieConsent = {
  necessary: true
  analytics: boolean
  marketing: boolean
}

const STORAGE_KEY = "ce_cookie_consent"

function getStoredConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CookieConsent) : null
  } catch {
    return null
  }
}

function storeConsent(consent: CookieConsent) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent))
}

export function CookieBanner() {
  const [visible, setVisible] = useState(() => {
    const stored = getStoredConsent()
    if (stored?.analytics) loadGA()
    return stored === null
  })
  const [showDetails, setShowDetails] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  const accept = () => {
    storeConsent({ necessary: true, analytics: true, marketing: true })
    loadGA()
    setVisible(false)
  }

  const reject = () => {
    storeConsent({ necessary: true, analytics: false, marketing: false })
    setVisible(false)
  }

  const saveCustom = () => {
    storeConsent({ necessary: true, analytics, marketing })
    if (analytics) loadGA()
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Preferencias de cookies"
        >
          <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] backdrop-blur-xl shadow-2xl p-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--c-text-subtle)] mb-1">
                  Cookies
                </p>
                <h2 className="font-serif text-lg text-[var(--c-text)] leading-snug">
                  Tu privacidad importa
                </h2>
              </div>
              <button
                onClick={reject}
                aria-label="Rechazar todas y cerrar"
                className="text-[var(--c-text-subtle)] hover:text-[var(--c-text)] transition-colors shrink-0 mt-0.5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-[var(--c-text-muted)] leading-relaxed mb-5">
              Usamos cookies para mejorar tu experiencia y analizar el tráfico. Puedes aceptar todas, rechazar las opcionales o elegir cuáles activar. Más info en nuestra{" "}
              <Link to="/cookies" className="underline hover:text-[var(--c-text)]">
                política de cookies
              </Link>
              .
            </p>


            {/* Detail toggles */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-3 mb-5 pt-1">
                    {/* Necessary — always on */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-[var(--c-text)]">Necesarias</p>
                        <p className="text-[11px] text-[var(--c-text-subtle)]">Sesión, seguridad, preferencias básicas</p>
                      </div>
                      <div className="w-8 h-4 rounded-full bg-[var(--c-invert)] opacity-50 cursor-not-allowed" aria-label="Siempre activas" />
                    </div>

                    {/* Analytics */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-[var(--c-text)]">Analíticas</p>
                        <p className="text-[11px] text-[var(--c-text-subtle)]">Google Analytics — entender cómo se usa el sitio (anónimo)</p>
                      </div>
                      <button
                        role="switch"
                        aria-checked={analytics}
                        onClick={() => setAnalytics((v) => !v)}
                        className={`w-8 h-4 rounded-full transition-colors ${analytics ? "bg-[var(--c-invert)]" : "bg-[var(--c-border-strong)]"}`}
                        aria-label="Cookies analíticas"
                      >
                        <span className={`block w-3 h-3 rounded-full bg-white shadow mx-0.5 transition-transform ${analytics ? "translate-x-4" : "translate-x-0"}`} />
                      </button>
                    </div>

                    {/* Marketing */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-[var(--c-text)]">Marketing</p>
                        <p className="text-[11px] text-[var(--c-text-subtle)]">Personalización y anuncios relevantes</p>
                      </div>
                      <button
                        role="switch"
                        aria-checked={marketing}
                        onClick={() => setMarketing((v) => !v)}
                        className={`w-8 h-4 rounded-full transition-colors ${marketing ? "bg-[var(--c-invert)]" : "bg-[var(--c-border-strong)]"}`}
                        aria-label="Cookies de marketing"
                      >
                        <span className={`block w-3 h-3 rounded-full bg-white shadow mx-0.5 transition-transform ${marketing ? "translate-x-4" : "translate-x-0"}`} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={accept}
                className="flex-1 px-4 py-2.5 rounded-full bg-[var(--c-invert)] text-[var(--c-invert-fg)] text-xs font-medium hover:opacity-90 transition-opacity"
              >
                Aceptar todas
              </button>
              {showDetails ? (
                <button
                  onClick={saveCustom}
                  className="flex-1 px-4 py-2.5 rounded-full border border-[var(--c-border-strong)] text-[var(--c-text)] text-xs font-medium hover:bg-[var(--c-surface-2)] transition-colors"
                >
                  Guardar selección
                </button>
              ) : (
                <button
                  onClick={() => setShowDetails(true)}
                  className="flex-1 px-4 py-2.5 rounded-full border border-[var(--c-border-strong)] text-[var(--c-text)] text-xs font-medium hover:bg-[var(--c-surface-2)] transition-colors"
                >
                  Personalizar
                </button>
              )}
              <button
                onClick={reject}
                className="flex-1 px-4 py-2.5 rounded-full border border-[var(--c-border-strong)] text-[var(--c-text-subtle)] text-xs font-medium hover:bg-[var(--c-surface-2)] transition-colors"
              >
                Rechazar
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
