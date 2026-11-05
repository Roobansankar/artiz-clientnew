import { test } from 'node:test'
import assert from 'node:assert/strict'
import { categoryProducts, descendantSlugs, firstAvailableVariant, productOption, shopProduct } from '../src/catalog.js'

const categories = [
  { slug: 'furniture', name: 'Furniture', parentSlug: null },
  { slug: 'tables', name: 'Tables', parentSlug: 'furniture' },
  { slug: 'coffee-tables', name: 'Coffee Tables', parentSlug: 'tables' },
  { slug: 'chairs', name: 'Chairs', parentSlug: 'furniture' },
]

test('category listings include direct, descendant, and additional assignments exactly once', () => {
  const products = [
    { id: 'direct', categorySlug: 'tables' },
    { id: 'child', categorySlug: 'coffee-tables', collectionSlugs: ['tables'] },
    { id: 'additional', categorySlug: 'chairs', collectionSlugs: ['coffee-tables'] },
    { id: 'unrelated', categorySlug: 'chairs' },
  ]
  assert.deepEqual(categoryProducts('tables', categories, products).map(p => p.id), ['direct', 'child', 'additional'])
  assert.deepEqual(categoryProducts('coffee-tables', categories, products).map(p => p.id), ['child', 'additional'])
  assert.deepEqual(categoryProducts('empty', categories, products), [])
})

test('descendant traversal stops even if malformed data contains a cycle', () => {
  assert.deepEqual([...descendantSlugs('a', [{ slug: 'a', parentSlug: 'b' }, { slug: 'b', parentSlug: 'a' }])], ['a', 'b'])
})

test('live product normalization preserves numeric prices, stock, images and available variant filters', () => {
  const product = shopProduct({
    id: 'table', name: 'Oak Coffee Table', categorySlug: 'coffee-tables',
    amount: 12500, price: '₹12,500', mrp: 15000, stock: 0,
    images: ['/api/media/table.webp'], swatches: ['#ffffff'],
    variants: [{ color: '#ffffff', size: 'Large', fabric: null }, { color: '#000000', size: 'Large', fabric: 'Linen' }],
  }, categories)
  assert.equal(product.price, 12500)
  assert.equal(product.compare, 15000)
  assert.equal(product.available, false)
  assert.equal(product.hover, product.img)
  assert.equal(product.vendor, 'Coffee Tables')
  assert.deepEqual(product.colors, ['#ffffff', '#000000'])
  assert.deepEqual(product.sizes, ['Large'])
  assert.deepEqual(product.fabrics, ['Linen'])
})

test('purchase selection uses an available variant and its own price and stock', () => {
  const product = { amount: 400, stock: 7, variants: [
    { color: '#000000', price: 400, mrp: 500, stock: 0 },
    { color: '#ffffff', price: 600, mrp: 800, stock: 7 },
  ] }
  assert.equal(firstAvailableVariant(product), 1)
  assert.equal(productOption(product).price, 600)
  assert.equal(productOption(product, 0).stock, 0)
  assert.equal(productOption(product, 99).stock, 0)
  assert.equal(productOption({ amount: 300, stock: 2 }).price, 300)
})
