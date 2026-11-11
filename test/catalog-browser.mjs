// Run against a built Next server and a development catalog with >24 products.
// Uses read-only requests; stale-response/retry cases are mocked in the browser.
import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright')
const base = process.env.WEB_URL || 'http://127.0.0.1:3101'
const api = process.env.API_URL || 'http://127.0.0.1:5000'
const first = await (await fetch(`${api}/api/products?pageSize=12&sort=name-asc&facets=true`)).json()
assert.ok(first.total > 24, 'Use a development catalog with more than 24 products')
const browser = await chromium.launch({ channel: 'msedge', headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 850 } })
  await page.addInitScript(() => localStorage.setItem('artiz-popup', '1'))
  const errors = []
  const requests = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('request', request => { const url = new URL(request.url()); if (url.pathname === '/api/products') requests.push(url) })
  await page.goto(`${base}/shop`, { waitUntil: 'domcontentloaded' })
  const grid = page.locator('section').filter({ has: page.locator('#collection-search') })
  const cards = grid.locator('[class~="group/card"]')
  await page.waitForFunction(() => document.querySelectorAll('[class~="group/card"]').length === 12)
  assert.equal(requests.length, 0, 'Hydration must reuse the SSR page')
  const next = page.waitForResponse(response => new URL(response.url()).searchParams.get('page') === '2')
  await grid.getByRole('button', { name: 'Load more', exact: true }).scrollIntoViewIfNeeded()
  await next
  await page.waitForFunction(() => document.querySelectorAll('[class~="group/card"]').length === 24)
  assert.equal(requests.filter(url => url.searchParams.get('page') === '2').length, 1)
  assert.ok(requests.every(url => url.searchParams.get('pageSize') === '12'))
  const third = page.waitForResponse(response => new URL(response.url()).searchParams.get('page') === '3')
  await grid.getByRole('button', { name: 'Load more', exact: true }).scrollIntoViewIfNeeded()
  await third
  await page.waitForFunction(expected => document.querySelectorAll('[class~="group/card"]').length === expected, Math.min(36, first.total))
  if (first.total <= 36) await grid.getByText(/all products are loaded/).waitFor()
  const search = page.locator('#collection-search')
  await search.fill('no-such-catalog-product-987654')
  await grid.getByText('No products match your filters', { exact: true }).waitFor()
  assert.equal(await cards.count(), 0)
  await search.fill('')
  await page.waitForFunction(() => document.querySelectorAll('[class~="group/card"]').length === 12)
  await grid.getByRole('button').filter({ hasText: 'SORT BY' }).click()
  const sorted = page.waitForResponse(response => new URL(response.url()).searchParams.get('sort') === 'price-desc')
  await grid.getByRole('button', { name: 'Price, high to low', exact: true }).click()
  const sortedData = await (await sorted).json()
  await cards.first().getByText(sortedData.products[0].name, { exact: true }).waitFor()
  assert.equal(sortedData.products[0].amount, first.facets.maxPrice)
  await page.setViewportSize({ width: 390, height: 850 })
  await grid.getByRole('button', { name: 'Filter', exact: true }).click()
  const [stockResponse] = await Promise.all([
    page.waitForResponse(response => new URL(response.url()).searchParams.get('inStock') === 'true'),
    grid.locator('aside:visible').getByText('In stock', { exact: true }).click(),
  ])
  const stock = await stockResponse.json()
  assert.equal(stock.total, first.facets.counts.availability['In stock'])
  await grid.getByRole('button', { name: /^Show \d/ }).click()
  await page.setViewportSize({ width: 1440, height: 850 })
  await grid.getByRole('button', { name: 'Clear all', exact: true }).click()

  const fixture = { ...first.products[0], id: 'browser-fixture', name: 'Current search result' }
  let attempts = 0
  await page.route('**/api/products?**', async route => {
    const query = new URL(route.request().url()).searchParams.get('q')
    if (!['slow-request', 'fast-request', 'retry-test'].includes(query)) return route.continue()
    if (query === 'slow-request') await new Promise(resolve => setTimeout(resolve, 800))
    if (query === 'retry-test' && attempts++ === 0) return route.fulfill({ status: 503, json: { message: 'Temporary test failure' } })
    await route.fulfill({ json: { ...first, products: [{ ...fixture, name: query === 'slow-request' ? 'Obsolete search result' : 'Current search result' }], page: 1, total: 1, hasMore: false } }).catch(() => {})
  })
  const slow = page.waitForRequest(request => new URL(request.url()).searchParams.get('q') === 'slow-request')
  await search.fill('slow-request')
  await slow
  await search.fill('fast-request')
  await cards.getByText('Current search result', { exact: true }).waitFor()
  await new Promise(resolve => setTimeout(resolve, 1000))
  assert.equal(await cards.getByText('Obsolete search result', { exact: true }).count(), 0)
  await search.fill('retry-test')
  await grid.getByRole('alert').waitFor()
  await grid.getByRole('button', { name: 'Retry loading products', exact: true }).click()
  await cards.getByText('Current search result', { exact: true }).waitFor()
  assert.equal(await grid.getByRole('alert').count(), 0)
  const furniture = await (await fetch(`${api}/api/products?category=furniture&pageSize=12&sort=name-asc&facets=true`)).json()
  const furniturePage = await page.goto(`${base}/shop/furniture`, { waitUntil: 'domcontentloaded' })
  assert.equal(furniturePage.status(), 200)
  assert.equal(await page.locator('section').filter({ has: page.locator('#collection-search') }).locator('[class~="group/card"]').count(), furniture.products.length)
  assert.ok(furniture.products.length <= 12)
  assert.deepEqual(errors, [])
  console.log('Passed: SSR 12, scroll API pages 2/3, no duplicate page, global search/sort, mobile stock filter, stale-response cancellation, retry, no runtime errors.')
} finally { await browser.close() }
