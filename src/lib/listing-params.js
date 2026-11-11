export const listingSort = {
  manual: 'newest', 'most-relevant': 'newest', 'best-selling': 'best-selling',
  'title-ascending': 'name-asc', 'title-descending': 'name-desc',
  'price-ascending': 'price-asc', 'price-descending': 'price-desc',
  'created-ascending': 'oldest', 'created-descending': 'newest',
}

export function listingParams({ category, flag, filters, sort, search = '', maxPrice }) {
  const params = new URLSearchParams({ pageSize: '12', sort: listingSort[sort] || 'newest' })
  if (category) params.set('category', category)
  if (flag) params.set('flag', flag)
  if (search.trim()) params.set('q', search.trim())
  for (const key of ['color', 'size', 'fabric', 'brand']) if (filters[key].length) params.set(key, JSON.stringify([...filters[key]].sort()))
  if (filters.availability.length === 1) params.set('inStock', String(filters.availability[0] === 'In stock'))
  if (filters.price[0] > 0) params.set('minPrice', String(filters.price[0]))
  if (filters.price[1] < maxPrice) params.set('maxPrice', String(filters.price[1]))
  return params.toString()
}
