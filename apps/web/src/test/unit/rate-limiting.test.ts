import { describe, it, expect, vi } from 'vitest'

// Test the rate limit response helper
function rateLimitResponse(reset: number) {
  const retryAfter = Math.max(0, Math.ceil((reset - Date.now()) / 1000))
  return {
    status: 429,
    retryAfter,
    body: { error: 'Too many requests. Please wait before trying again.', retryAfter },
  }
}

describe('rate limiting', () => {
  it('returns 429 status', () => {
    const res = rateLimitResponse(Date.now() + 60000)
    expect(res.status).toBe(429)
  })

  it('calculates retry-after in seconds', () => {
    const res = rateLimitResponse(Date.now() + 30000)
    expect(res.retryAfter).toBeGreaterThan(25)
    expect(res.retryAfter).toBeLessThanOrEqual(30)
  })

  it('returns user-friendly error message', () => {
    const res = rateLimitResponse(Date.now() + 60000)
    expect(res.body.error).toContain('Too many requests')
  })

  it('retryAfter is never negative', () => {
    const res = rateLimitResponse(Date.now() - 10000) // reset in past
    expect(res.retryAfter).toBeGreaterThanOrEqual(0)
  })
})
