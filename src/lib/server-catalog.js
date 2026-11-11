import { cache } from 'react'

// Request-scoped deduplication only. Stock and prices are never persisted here.
export const catalogData = cache(async (resource, query = '') => {
  const base = process.env.API_BASE_URL || 'http://127.0.0.1:5000'
  const response = await fetch(`${base}/api/${resource}${query ? `?${query}` : ''}`, {
    cache: 'no-store', signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) throw new Error('The catalog is temporarily unavailable. Please try again.')
  return response.json()
})
