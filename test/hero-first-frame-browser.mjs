// Verifies real first-frame markup with JS disabled and full-size hero images blocked.
import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright')
const base = process.env.WEB_URL || 'http://127.0.0.1:3101'
const browser = await chromium.launch({ channel: 'msedge', headless: true })
try {
  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } })
  const page = await noJs.newPage()
  await page.route('**/_next/image?**', route => route.abort())
  await page.goto(base, { waitUntil: 'domcontentloaded' })
  const hero = page.locator('section[aria-label="Featured collections"]')
  assert.equal(await hero.count(), 1, 'Hero must already exist in SSR HTML without client JS')
  assert.equal(await page.locator('[aria-label="Loading featured collections"]').count(), 0)
  const preview = await hero.locator('.hero-slide-frame').first().evaluate(node => getComputedStyle(node).backgroundImage)
  assert.ok(preview.includes('data:image/webp;base64,'), 'Actual image preview must be inline before any network image loads')
  assert.ok((await hero.boundingBox()).height >= 420)
  await noJs.close()

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await context.addInitScript(() => localStorage.setItem('artiz-popup', '1'))
  const returning = await context.newPage()
  let metadataFinished = false
  const errors = []
  returning.on('pageerror', error => errors.push(error.message))
  await returning.goto(`${base}/shop/furniture`, { waitUntil: 'domcontentloaded' })
  await returning.route('**/api/hero-slides', async route => {
    await new Promise(resolve => setTimeout(resolve, 1200))
    const response = await route.fetch()
    const data = await response.json()
    data.slides[0] = { ...data.slides[0], titleBefore: 'Fresh admin banner', titleAccent: '', titleAfter: '', updatedAt: new Date().toISOString() }
    metadataFinished = true
    await route.fulfill({ response, json: data })
  })
  // Block full-size images again during return; the shared metadata/preview
  // must remain sufficient to paint a nonempty hero.
  await returning.route('**/_next/image?**', route => route.abort())
  await returning.getByRole('link', { name: 'Artiz Interior Design Studio', exact: true }).first().click()
  await returning.waitForURL(base + '/')
  const returnedHero = returning.locator('section[aria-label="Featured collections"]')
  await returnedHero.waitFor()
  assert.equal(metadataFinished, false, 'Return-home hero must not wait for its background refresh')
  assert.equal(await returning.locator('[aria-label="Loading featured collections"]').count(), 0)
  assert.ok((await returnedHero.locator('.hero-slide-frame').first().getAttribute('style')).includes('data:image/webp;base64,'))
  await returnedHero.getByRole('heading', { name: 'Fresh admin banner', exact: true }).waitFor()
  assert.deepEqual(errors, [])
  console.log('Passed: hero present in initial HTML without JS, inline real-image preview with image downloads blocked, no empty hero fallback, and return-home rendering.')
} finally { await browser.close() }
