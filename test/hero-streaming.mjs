// Isolated API proxy: delays catalog reads and serves one image-only hero.
// Verifies streaming without altering application data.
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
const upstream = process.env.API_URL || 'http://127.0.0.1:5000'
const first = (await (await fetch(`${upstream}/api/hero-slides`)).json()).slides[0]
assert.ok(first)
const proxy = createServer(async (request, response) => {
  try {
    if (request.url.startsWith('/api/hero-slides')) {
      response.setHeader('content-type', 'application/json')
      response.end(JSON.stringify({ slides: [{ ...first, mode: 'image', buttonHref: '/shop/furniture' }] }))
      return
    }
    if (request.url.startsWith('/api/products')) await new Promise(resolve => setTimeout(resolve, 2200))
    const result = await fetch(`${upstream}${request.url}`)
    response.writeHead(result.status, { 'content-type': result.headers.get('content-type') || 'application/json' })
    response.end(Buffer.from(await result.arrayBuffer()))
  } catch { response.writeHead(503); response.end('{}') }
})
await new Promise(resolve => proxy.listen(0, '127.0.0.1', resolve))
const processUnderTest = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '3102'], {
  cwd: process.cwd(), env: { ...process.env, API_BASE_URL: `http://127.0.0.1:${proxy.address().port}` }, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
})
try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Next verification server did not start')), 15000)
    processUnderTest.stdout.on('data', chunk => { if (chunk.toString().includes('Ready')) { clearTimeout(timer); resolve() } })
    processUnderTest.once('exit', code => { clearTimeout(timer); reject(new Error(`Next exited: ${code}`)) })
  })
  const start = performance.now()
  const result = await fetch('http://127.0.0.1:3102/')
  assert.equal(result.status, 200)
  let html = ''
  let heroAt
  const decoder = new TextDecoder()
  for await (const chunk of result.body) {
    html += decoder.decode(chunk, { stream: true })
    if (heroAt == null && html.includes('aria-label="Featured collections"')) heroAt = performance.now() - start
  }
  const completeAt = performance.now() - start
  const section = html.match(/<section[^>]*aria-label="Featured collections"[\s\S]*?<\/section>/)?.[0]
  assert.ok(section)
  assert.ok(!section.includes('<h2'), 'Image-only mode must omit heading/text overlays')
  assert.ok(section.includes('href="/shop/furniture"'), 'Image-only banner may link to a collection')
  assert.ok(heroAt < 1800, `Hero waited for catalog: ${heroAt}ms`)
  assert.ok(completeAt >= 2100, 'Proxy must actually delay the product sections')
  console.log(JSON.stringify({ passed: true, heroStreamedMs: Math.round(heroAt), catalogCompleteMs: Math.round(completeAt), imageOnly: true }))
} finally {
  processUnderTest.kill()
  await new Promise(resolve => proxy.close(resolve))
}
