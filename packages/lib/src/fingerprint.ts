// Lazy-loaded browser fingerprint using FingerprintJS (open source).
// Result is cached in sessionStorage so the library only runs once per session.

const CACHE_KEY = "ce_fp"

let promise: Promise<string> | null = null

export function getFingerprint(): Promise<string> {
  if (promise) return promise

  // Return cached value immediately if available
  try {
    const cached = sessionStorage.getItem(CACHE_KEY)
    if (cached) {
      promise = Promise.resolve(cached)
      return promise
    }
  } catch {
    // sessionStorage unavailable (private mode etc.) — proceed without cache
  }

  promise = import("@fingerprintjs/fingerprintjs")
    .then((FingerprintJS) => FingerprintJS.load())
    .then((fp) => fp.get())
    .then((result) => {
      try {
        sessionStorage.setItem(CACHE_KEY, result.visitorId)
      } catch {
        // ignore
      }
      return result.visitorId
    })
    .catch(() => "")

  return promise
}
