// Shared rate limiting using Upstash Redis + @upstash/ratelimit.
// Works in Vercel Edge Runtime (no Node.js required).
//
// Env vars required (set in Vercel → Project Settings → Environment Variables):
//   UPSTASH_REDIS_REST_URL   — from Upstash console → REST URL
//   UPSTASH_REDIS_REST_TOKEN — from Upstash console → REST Token

import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

function makeRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

// subscribe: 3 attempts per IP per 10 minutes
export function subscribeRatelimit(): Ratelimit | null {
  const redis = makeRedis()
  if (!redis) return null
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "10 m"),
    prefix: "rl:subscribe",
  })
}

// likes: 10 actions per IP per minute
export function likesRatelimit(): Ratelimit | null {
  const redis = makeRedis()
  if (!redis) return null
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    prefix: "rl:likes",
  })
}

export function getIP(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  )
}
