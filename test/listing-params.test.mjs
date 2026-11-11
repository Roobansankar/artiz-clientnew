import { test } from 'node:test'
import assert from 'node:assert/strict'
import { listingParams } from '../src/lib/listing-params.js'

test('collection requests are bounded and send global search, filter and sort criteria', () => {
  const filters = { availability: ['In stock'], color: ['#FFFFFF'], size: ['24, 36 inches'], fabric: ['Linen'], brand: ['coffee-tables'], price: [100, 500] }
  const params = new URLSearchParams(listingParams({ category: 'furniture', flag: 'isCurated', filters, sort: 'price-descending', search: ' oak ', maxPrice: 1000 }))
  assert.equal(params.get('pageSize'), '12')
  assert.equal(params.get('category'), 'furniture')
  assert.equal(params.get('flag'), 'isCurated')
  assert.equal(params.get('sort'), 'price-desc')
  assert.equal(params.get('q'), 'oak')
  assert.deepEqual(JSON.parse(params.get('size')), ['24, 36 inches'])
  assert.equal(params.get('inStock'), 'true')
  assert.equal(params.get('minPrice'), '100')
  assert.equal(params.get('maxPrice'), '500')
  assert.equal(params.has('page'), false, 'A changed query always starts at the first page')
})

test('clearing filters removes every restriction, including selecting both availability options', () => {
  const filters = { availability: ['In stock', 'Out of stock'], color: [], size: [], fabric: [], brand: [], price: [0, 1000] }
  const params = new URLSearchParams(listingParams({ filters, sort: 'title-ascending', maxPrice: 1000 }))
  assert.deepEqual([...params.entries()], [['pageSize', '12'], ['sort', 'name-asc']])
})
