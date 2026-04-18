import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getAuthorizationUrl, getOAuthClientConfig } from "@/lib/analytics/youtube/oauth"
import { randomBytes } from "crypto"

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const cfg = getOAuthClientConfig()
  if (!cfg) {
    return NextResponse.json(
      { error: "YouTube OAuth not configured. Set YOUTUBE_OAUTH_CLIENT_ID and YOUTUBE_OAUTH_CLIENT_SECRET." },
      { status: 503 }
    )
  }

  // State protects against CSRF
  const state = randomBytes(16).toString("hex")
  const authUrl = getAuthorizationUrl(state)
  if (!authUrl) {
    return NextResponse.json({ error: "Could not build authorization URL" }, { status: 500 })
  }

  const response = NextResponse.redirect(authUrl)
  // Store state in cookie to verify in callback
  response.cookies.set("yt_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  })
  return response
}
