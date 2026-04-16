import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

function makeRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

let _subscribeRatelimit: Ratelimit | null | undefined
export function subscribeRatelimit(): Ratelimit | null {
  if (_subscribeRatelimit !== undefined) return _subscribeRatelimit
  const redis = makeRedis()
  _subscribeRatelimit = redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, "10 m"), prefix: "rl:subscribe" })
    : null
  return _subscribeRatelimit
}

let _likesRatelimit: Ratelimit | null | undefined
export function likesRatelimit(): Ratelimit | null {
  if (_likesRatelimit !== undefined) return _likesRatelimit
  const redis = makeRedis()
  _likesRatelimit = redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "1 m"), prefix: "rl:likes" })
    : null
  return _likesRatelimit
}

export function getIP(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  )
}
