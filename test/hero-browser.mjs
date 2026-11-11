// Requires Playwright (or PLAYWRIGHT_MODULE) and a built Next server at WEB_URL.
// Admin mutations are mocked; this script never changes application rows.
import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright')
const base = process.env.WEB_URL || 'http://127.0.0.1:3101'
const api = process.env.API_URL || 'http://127.0.0.1:5000'
let slides = (await (await fetch(`${api}/api/hero-slides`)).json()).slides
assert.ok(slides.length > 0)
const browser = await chromium.launch({ channel: 'msedge', headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.addInitScript(() => localStorage.setItem('artiz-popup', '1'))
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(base, { waitUntil: 'domcontentloaded' })
  const hero = page.getByRole('region', { name: 'Featured collections' })
  const image = hero.locator('img').first()
  await hero.waitFor()
  await page.waitForFunction(() => { const image = document.querySelector('section[aria-label="Featured collections"] img'); return image?.complete && image.naturalWidth > 0 })
  assert.equal(await image.getAttribute('loading'), null, 'First hero must not be lazy loaded')
  assert.ok(await page.locator('link[rel="preload"][as="image"]').count() > 0, 'Hero has a responsive image preload')
  assert.equal(await hero.locator('h2').first().evaluate(node => node.classList.contains('slide-anim')), false, 'First heading is immediately visible')
  const firstSource = await image.evaluate(node => node.currentSrc)
  await hero.getByRole('link', { name: slides[0].buttonText, exact: true }).first().click()
  await page.waitForURL('**/shop/furniture')
  await page.getByRole('link', { name: 'Artiz Interior Design Studio', exact: true }).first().click()
  await hero.waitFor()
  await page.waitForFunction(source => { const image = document.querySelector('section[aria-label="Featured collections"] img'); return image?.complete && image.naturalWidth > 0 && image.currentSrc === source }, firstSource)

  await page.route('**/api/admin/**', async route => {
    const pathname = new URL(route.request().url()).pathname
    const method = route.request().method()
    if (pathname.endsWith('/auth/me')) return route.fulfill({ json: { admin: { id: 'browser-admin', name: 'Browser Admin', email: 'browser@example.com' } } })
    if (pathname.endsWith('/notifications')) return route.fulfill({ json: { notifications: [], unreadCount: 0 } })
    if (!pathname.includes('/hero-slides')) return route.fulfill({ status: 404, json: {} })
    const endpoint = pathname.split('/hero-slides')[1]
    if (method === 'GET') return route.fulfill({ json: { slides } })
    if (method === 'DELETE') { slides = slides.filter(slide => slide.id !== endpoint.slice(1)); return route.fulfill({ status: 204, body: '' }) }
    const raw = route.request().postData() || ''
    if (endpoint === '/order') {
      const { ids } = JSON.parse(raw)
      slides = ids.map((id, sortOrder) => ({ ...slides.find(slide => slide.id === id), sortOrder }))
      return route.fulfill({ json: { slides } })
    }
    const match = raw.match(/name="data"\r\n\r\n([\s\S]*?)\r\n--/)
    const data = JSON.parse(match ? match[1] : raw)
    const slide = { ...data, id: endpoint ? endpoint.slice(1) : 'browser-hero-created', image: data.image || '/images/slider1.png', sortOrder: data.sortOrder ?? slides.length, updatedAt: new Date().toISOString() }
    slides = [...slides.filter(item => item.id !== slide.id), slide].sort((a, b) => a.sortOrder - b.sortOrder)
    return route.fulfill({ status: method === 'POST' ? 201 : 200, json: { slide } })
  })
  await page.goto(`${base}/admin/home-hero`, { waitUntil: 'domcontentloaded' })
  await page.getByRole('heading', { name: 'Home hero', exact: true }).waitFor()
  assert.equal(await page.getByRole('link', { name: 'Home Hero', exact: true }).getAttribute('href'), '/admin/home-hero')
  await page.getByRole('button', { name: 'Add slide', exact: true }).click()
  await page.getByLabel(/^Slide name/).fill('Browser image-only banner')
  await page.getByLabel('Slide type', { exact: true }).selectOption('image')
  await page.getByLabel('Hero image', { exact: true }).setInputFiles({ name: 'hero.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64') })
  await page.getByLabel('Image fit', { exact: true }).selectOption('contain')
  assert.equal(await page.locator('.ad-hero-preview-copy').count(), 0)
  await page.getByRole('button', { name: 'Save slide', exact: true }).click()
  const row = page.locator('.ad-hero-list > li').filter({ hasText: 'Browser image-only banner' })
  await row.waitFor()
  assert.equal(slides.find(slide => slide.id === 'browser-hero-created').mode, 'image')
  await row.getByRole('button', { name: 'Edit', exact: true }).click()
  await page.getByLabel('Slide type', { exact: true }).selectOption('text')
  await page.getByLabel('Heading before highlight', { exact: true }).fill('Dynamic home heading')
  await page.getByLabel('Show on homepage', { exact: true }).uncheck()
  await page.getByRole('button', { name: 'Save slide', exact: true }).click()
  await row.getByText('Image + text · Hidden', { exact: true }).waitFor()
  await row.getByRole('button', { name: /Move .* up/ }).click()
  await page.waitForFunction(() => document.querySelectorAll('.ad-hero-list > li')[2]?.textContent.includes('Browser image-only banner'))
  await row.getByRole('button', { name: 'Delete', exact: true }).click()
  await row.getByRole('button', { name: 'Confirm delete', exact: true }).click()
  await row.waitFor({ state: 'detached' })
  assert.deepEqual(errors, [])
  console.log('Passed: responsive hero preload, first heading visible, cached-image return navigation, admin sidebar, image-only create, text edit, hide, reorder and delete UI.')
} finally { await browser.close() }
