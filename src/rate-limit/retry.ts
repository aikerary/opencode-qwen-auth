import { sleep } from "../utils/sleep.js"

export const MAX_RATE_LIMIT_RETRIES = 5
export const INITIAL_RATE_LIMIT_DELAY_MS = 3000
export const RATE_LIMIT_BACKOFF_MULTIPLIER = 3
export const MAX_RATE_LIMIT_DELAY_MS = 30000

export interface RateLimitConfig {
  maxRetries?: number
  initialDelayMs?: number
  backoffMultiplier?: number
  maxDelayMs?: number
}

export async function retryOnRateLimit(
  requestFn: () => Promise<Response>,
  config: RateLimitConfig = {},
): Promise<Response> {
  const {
    maxRetries = MAX_RATE_LIMIT_RETRIES,
    initialDelayMs = INITIAL_RATE_LIMIT_DELAY_MS,
    backoffMultiplier = RATE_LIMIT_BACKOFF_MULTIPLIER,
    maxDelayMs = MAX_RATE_LIMIT_DELAY_MS,
  } = config

  let waitMs = initialDelayMs
  let lastResponse: Response | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    await sleep(waitMs)

    try {
      const response = await requestFn()
      if (response.status !== 429) {
        return response
      }
      lastResponse = response

      const retryAfter = parseRetryAfterHeader(response)
      waitMs = retryAfter || Math.min(waitMs * backoffMultiplier, maxDelayMs)
    } catch (_error) {
      if (attempt === maxRetries) throw _error
      waitMs = Math.min(waitMs * backoffMultiplier, maxDelayMs)
    }
  }

  return lastResponse!
}

function parseRetryAfterHeader(response: Response): number | null {
  const retryAfterMs = response.headers.get("retry-after-ms")
  if (retryAfterMs) {
    const parsed = parseInt(retryAfterMs, 10)
    if (!isNaN(parsed)) return parsed
  }

  const retryAfter = response.headers.get("retry-after")
  if (retryAfter) {
    const parsed = parseInt(retryAfter, 10)
    if (!isNaN(parsed)) return parsed * 1000
  }

  return null
}
