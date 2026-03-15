import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Gracefully degrade if Upstash not configured
function createRatelimiter(requests: number, windowSeconds: number) {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    // Return a no-op limiter that always passes
    return {
      limit: async (_id: string) => ({ success: true, limit: requests, reset: 0, remaining: requests }),
    }
  }

  const redis = new Redis({ url, token })
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, `${windowSeconds}s`),
    analytics: false,
  })
}

// CV parse: 5 per minute per user (prevents abuse + cost control)
export const cvParseRatelimit = createRatelimiter(5, 60)

// Employer/institution leads: 3 per hour per IP (prevents spam signups)
export const leadSubmitRatelimit = createRatelimiter(3, 3600)

// Auth endpoints: 10 per minute per IP
export const authRatelimit = createRatelimiter(10, 60)

export function getRateLimitKey(request: Request, prefix: string): string {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || '127.0.0.1'
  return `${prefix}:${ip}`
}

export function rateLimitResponse(reset: number): Response {
  const retryAfter = Math.max(0, Math.ceil((reset - Date.now()) / 1000))
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please wait before trying again.', retryAfter }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
        'X-RateLimit-Reset': String(reset),
      },
    }
  )
}
