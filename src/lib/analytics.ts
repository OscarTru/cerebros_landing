const GA_ID = "G-2FGB8YCMLX"

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

let loaded = false

export function loadGA() {
  if (loaded || typeof window === "undefined") return
  loaded = true

  // Initialize dataLayer and gtag stub before the script loads
  window.dataLayer = window.dataLayer || []
  window.gtag = function (...args) { window.dataLayer.push(args) }
  window.gtag("js", new Date())
  window.gtag("config", GA_ID)

  // Load the gtag script — it reads dataLayer on load
  const script = document.createElement("script")
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.insertBefore(script, document.head.firstChild)
}
