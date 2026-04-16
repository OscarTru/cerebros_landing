const GA_ID_DEFAULT = process.env.NEXT_PUBLIC_GA_ID ?? "G-2FGB8YCMLX"

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

let loaded = false

export function loadGA(gaId: string = GA_ID_DEFAULT) {
  if (loaded || typeof window === "undefined") return
  loaded = true
  window.dataLayer = window.dataLayer || []
  window.gtag = function (...args) { window.dataLayer.push(args) }
  window.gtag("js", new Date())
  window.gtag("config", gaId)
  const script = document.createElement("script")
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
  document.head.insertBefore(script, document.head.firstChild)
}

// Safe event tracker — silently no-ops if GA hasn't been loaded (user declined cookies)
export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return
  window.gtag("event", name, params)
}

// ─── Named events ────────────────────────────────────────────────────────────

export const analytics = {
  // Newsletter
  newsletterSignup: (location: "homepage" | "podcast" | "blog") =>
    trackEvent("newsletter_signup", { location }),

  // Ebook gratuito
  ebookFreeClick: (location: "homepage" | "blog") =>
    trackEvent("ebook_free_click", { location }),

  // Ebook de pago (100 retos)
  ebookPaidClick: (post_slug: string) =>
    trackEvent("ebook_paid_click", { post_slug }),

  // Sponsor contact form
  sponsorContactSubmit: (pkg: string) =>
    trackEvent("sponsor_contact_submit", { package: pkg || "no_package" }),

  // Speaker inquiry
  speakerInquiry: () =>
    trackEvent("speaker_inquiry"),

  // Blog engagement
  blogPostView: (slug: string) =>
    trackEvent("blog_post_view", { slug }),

  blogPostLike: (slug: string) =>
    trackEvent("blog_post_like", { slug }),

  // Social links
  socialClick: (platform: string) =>
    trackEvent("social_click", { platform }),
}
