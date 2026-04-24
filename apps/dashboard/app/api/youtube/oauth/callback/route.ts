import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { exchangeCodeForTokens, saveTokens } from "@/lib/analytics/youtube/oauth"

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url))
  }

  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(
      new URL(`/analytics?yt_oauth_error=${encodeURIComponent(error)}`, req.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(new URL("/analytics?yt_oauth_error=missing_code", req.url))
  }

  // Verify state
  const storedState = req.cookies.get("yt_oauth_state")?.value
  if (!state || state !== storedState) {
    return NextResponse.redirect(new URL("/analytics?yt_oauth_error=invalid_state", req.url))
  }

  try {
    const tokens = await exchangeCodeForTokens(code)
    if (!tokens.refresh_token) {
      // Already connected before — Google won't issue new refresh_token unless prompt=consent
      return NextResponse.redirect(
        new URL("/analytics?yt_oauth_error=no_refresh_token", req.url)
      )
    }
    await saveTokens({
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token,
      expiresIn: tokens.expires_in,
      scope: tokens.scope,
    })

    const response = NextResponse.redirect(new URL("/analytics?yt_oauth_ok=1", req.url))
    response.cookies.delete("yt_oauth_state")
    return response
  } catch (err) {
    console.error("[yt oauth callback] failed:", err)
    return NextResponse.redirect(
      new URL(
        `/analytics?yt_oauth_error=${encodeURIComponent(String(err).slice(0, 60))}`,
        req.url
      )
    )
  }
}
