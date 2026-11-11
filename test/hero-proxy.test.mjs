import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
const source = await readFile(new URL('../src/app/api/admin/[...path]/route.js', import.meta.url), 'utf8')
const { GET, POST, PATCH, DELETE } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
const originalFetch = globalThis.fetch
after(() => { globalThis.fetch = originalFetch })

test('hero list, upload, edit, order and delete proxy to protected backend routes', async () => {
  for (const [method, endpoint] of [['GET', 'hero-slides'], ['POST', 'hero-slides'], ['PATCH', 'hero-slides/hero-initial-1'], ['PATCH', 'hero-slides/order'], ['DELETE', 'hero-slides/hero-initial-1']]) {
    globalThis.fetch = async (url, options) => {
      assert.ok(url.endsWith(`/api/admin/${endpoint}`))
      assert.equal(options.method, method)
      assert.equal(options.headers.get('cookie'), 'artiz_admin_session=test')
      return method === 'DELETE' ? new Response(null, { status: 204 }) : Response.json({ slides: [] })
    }
    const request = { method, nextUrl: new URL(`http://localhost:3001/api/admin/${endpoint}`), headers: new Headers({ cookie: 'artiz_admin_session=test' }) }
    const handler = { GET, POST, PATCH, DELETE }[method]
    const response = await handler(request, { params: Promise.resolve({ path: endpoint.split('/') }) })
    assert.equal(response.status, method === 'DELETE' ? 204 : 200)
  }
})
