import { getSupabase } from "@/lib/supabase"

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"

// Scopes needed:
// - youtube.readonly: read channel + video data (same as API Key)
// - yt-analytics.readonly: read YouTube Analytics (retention, traffic, demographics)
export const OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
].join(" ")

export function getOAuthClientConfig() {
  const clientId = process.env.YOUTUBE_OAUTH_CLIENT_ID
  const clientSecret = process.env.YOUTUBE_OAUTH_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return null
  }
  return { clientId, clientSecret }
}

export function getRedirectUri(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002"
  return `${base}/api/youtube/oauth/callback`
}

export function getAuthorizationUrl(state: string): string | null {
  const cfg = getOAuthClientConfig()
  if (!cfg) return null

  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: OAUTH_SCOPES,
    access_type: "offline", // needed to get refresh_token
    prompt: "consent", // force re-consent so Google returns refresh_token every time
    state,
  })
  return `${AUTH_ENDPOINT}?${params.toString()}`
}

export interface TokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
  scope: string
}

export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const cfg = getOAuthClientConfig()
  if (!cfg) throw new Error("OAuth not configured")

  const body = new URLSearchParams({
    code,
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    redirect_uri: getRedirectUri(),
    grant_type: "authorization_code",
  })

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OAuth token exchange failed: ${res.status} ${err}`)
  }
  return res.json() as Promise<TokenResponse>
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string
  expires_in: number
}> {
  const cfg = getOAuthClientConfig()
  if (!cfg) throw new Error("OAuth not configured")

  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    grant_type: "refresh_token",
  })

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OAuth token refresh failed: ${res.status} ${err}`)
  }
  return res.json() as Promise<{ access_token: string; expires_in: number }>
}

interface StoredToken {
  provider: string
  refresh_token: string
  access_token: string | null
  expires_at: string | null
  scope: string
  updated_at: string
}

export async function saveTokens(params: {
  refreshToken: string
  accessToken: string
  expiresIn: number
  scope: string
}): Promise<void> {
  const expiresAt = new Date(Date.now() + params.expiresIn * 1000).toISOString()
  const { error } = await getSupabase()
    .from("oauth_tokens")
    .upsert(
      {
        provider: "youtube",
        refresh_token: params.refreshToken,
        access_token: params.accessToken,
        expires_at: expiresAt,
        scope: params.scope,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "provider" }
    )
  if (error) throw error
}

export async function updateAccessToken(accessToken: string, expiresIn: number): Promise<void> {
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()
  const { error } = await getSupabase()
    .from("oauth_tokens")
    .update({
      access_token: accessToken,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("provider", "youtube")
  if (error) throw error
}

export async function loadStoredToken(): Promise<StoredToken | null> {
  const { data, error } = await getSupabase()
    .from("oauth_tokens")
    .select("*")
    .eq("provider", "youtube")
    .maybeSingle()
  if (error || !data) return null
  return data as StoredToken
}

/**
 * Get a valid access token for YouTube Analytics calls.
 * Returns null if OAuth not configured or no token stored.
 * Automatically refreshes if expired.
 */
export async function getValidAccessToken(): Promise<string | null> {
  const stored = await loadStoredToken()
  if (!stored) return null

  // Check if current access token is still valid (with 60s buffer)
  if (stored.access_token && stored.expires_at) {
    const expiresAt = new Date(stored.expires_at).getTime()
    if (expiresAt - Date.now() > 60_000) {
      return stored.access_token
    }
  }

  // Expired or missing — refresh
  try {
    const fresh = await refreshAccessToken(stored.refresh_token)
    await updateAccessToken(fresh.access_token, fresh.expires_in)
    return fresh.access_token
  } catch (err) {
    console.warn("[youtube/oauth] refresh failed:", err)
    return null
  }
}
