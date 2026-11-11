// Coalesce simultaneous public requests; do not retain customer or catalog data.
let pending
export function fetchPublicCategories() {
  if (!pending) {
    pending = fetch('/api/categories', { cache: 'no-store', signal: AbortSignal.timeout(10000) })
      .then(async response => {
        if (!response.ok) throw new Error('Categories unavailable')
        const data = await response.json()
        if (!Array.isArray(data.categories)) throw new Error('Invalid categories')
        return data.categories
      }).finally(() => { pending = null })
  }
  return pending
}
