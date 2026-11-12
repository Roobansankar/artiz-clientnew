// Uses an isolated API proxy and existing public images; no application rows change.
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { pathToFileURL } from 'node:url'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright')
const api = process.env.API_URL || 'http://127.0.0.1:5000'
const { slides } = await (await fetch(`${api}/api/hero-slides`)).json()
assert.ok(slides.length >= 2)
let first = { ...slides[0], mode: 'image', mobileImage: slides[1].image, mobileBlurDataUrl: slides[1].blurDataUrl }
const proxy = createServer(async (request, response) => {
  try {
    response.setHeader('content-type', 'application/json')
    if (request.url.startsWith('/api/hero-slides')) return response.end(JSON.stringify({ slides: [first] }))
    if (request.url.startsWith('/api/admin/hero-slides')) { first = { ...first, mobileImage: '', mobileBlurDataUrl: '', updatedAt: new Date().toISOString() }; return response.end(JSON.stringify({ slide: first })) }
    const result = await fetch(`${api}${request.url}`)
    response.statusCode = result.status
    response.end(await result.text())
  } catch { response.statusCode = 503; response.end('{}') }
})
await new Promise(resolve => proxy.listen(0, '127.0.0.1', resolve))
const next = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '3102'], { env: { ...process.env, API_BASE_URL: `http://127.0.0.1:${proxy.address().port}` }, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true })
let browser
try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Next did not start')), 15000)
    next.stdout.on('data', chunk => { if (chunk.toString().includes('Ready')) { clearTimeout(timer); resolve() } })
    next.once('exit', code => { clearTimeout(timer); reject(new Error(`Next exited: ${code}`)) })
  })
  browser = await chromium.launch({ channel: 'msedge', headless: true })
  async function check(width, expected, notExpected) {
    const context = await browser.newContext({ viewport: { width, height: 900 } })
    await context.addInitScript(() => localStorage.setItem('artiz-popup', '1'))
    const page = await context.newPage()
    const requested = []
    page.on('request', request => { const url = new URL(request.url()); if (url.pathname === '/_next/image') requested.push(url.searchParams.get('url')) })
    await page.route('**/api/hero-slides', route => route.fulfill({ json: { slides: [first] } }))
    await page.goto('http://127.0.0.1:3102/', { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(expected => {
      const image = document.querySelector('section[aria-label="Featured collections"] picture img')
      return image?.complete && image.naturalWidth > 0 && new URL(image.currentSrc).searchParams.get('url') === expected
    }, expected)
    assert.ok(requested.includes(expected))
    if (notExpected) assert.ok(!requested.includes(notExpected), `Wrong viewport image was also downloaded: ${notExpected}`)
    await context.close()
  }
  await check(390, slides[1].image, slides[0].image)
  await check(1440, slides[0].image, slides[1].image)
  const updated = await fetch('http://127.0.0.1:3102/api/admin/hero-slides/hero-initial-1', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: '{}' })
  assert.equal(updated.status, 200)
  await check(390, slides[0].image, slides[1].image)
  console.log('Passed: mobile selects/downloads only mobile hero; desktop selects/downloads only desktop hero; removal invalidates cache and mobile falls back to desktop.')
} finally {
  await browser?.close()
  next.kill()
  await new Promise(resolve => proxy.close(resolve))
}
