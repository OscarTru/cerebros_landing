// HMAC-SHA256 token helpers for unsubscribe links.
// Uses crypto.subtle — available natively in Vercel Edge Runtime.

async function getKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder()
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  )
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function signToken(email: string, secret: string): Promise<string> {
  const key = await getKey(secret)
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(email))
  return toHex(sig)
}

export async function verifyToken(
  email: string,
  token: string,
  secret: string,
): Promise<boolean> {
  try {
    const expected = await signToken(email, secret)
    // Constant-time comparison to prevent timing attacks
    if (expected.length !== token.length) return false
    let diff = 0
    for (let i = 0; i < expected.length; i++) {
      diff |= expected.charCodeAt(i) ^ token.charCodeAt(i)
    }
    return diff === 0
  } catch {
    return false
  }
}
