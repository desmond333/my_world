import type { MiddlewareHandler } from 'hono'

type RateLimitOptions = {
  windowMs: number
  max: number
}

type ClientRecord = {
  count: number
  resetAt: number
}

export const rateLimit = (options: RateLimitOptions): MiddlewareHandler => {
  const tracker = new Map<string, ClientRecord>()

  return async (c, next) => {
    const ip =
      c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for')?.split(',')[0].trim() || c.req.header('x-real-ip') || 'unknown'

    const now = Date.now()
    let record = tracker.get(ip)

    if (!record || record.resetAt <= now) {
      record = {
        count: 1,
        resetAt: now + options.windowMs,
      }
      tracker.set(ip, record)
    } else {
      record.count += 1
    }

    if (tracker.size > 10000) {
      for (const [key, item] of tracker.entries()) {
        if (item.resetAt <= now) {
          tracker.delete(key)
        }
      }
    }

    const remaining = Math.max(0, options.max - record.count)
    const retryAfter = Math.max(1, Math.ceil((record.resetAt - now) / 1000))

    c.header('X-RateLimit-Limit', String(options.max))
    c.header('X-RateLimit-Remaining', String(remaining))
    c.header('X-RateLimit-Reset', String(Math.ceil(record.resetAt / 1000)))

    if (record.count > options.max) {
      c.header('Retry-After', String(retryAfter))
      return c.json(
        {
          error: 'Too many requests. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
        },
        429,
      )
    }

    await next()
  }
}
