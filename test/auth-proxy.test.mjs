import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const source = await readFile(new URL('../src/app/api/auth/[...path]/route.js', import.meta.url), 'utf8')
const { GET, POST, PATCH, PUT, DELETE } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
const realFetch = globalThis.fetch
after(() => { globalThis.fetch = realFetch })

function request(endpoint, { method = 'GET', headers = {} } = {}) {
  const url = new URL(`http://localhost:3001/api/auth/${endpoint}`)
  return { method, nextUrl: url, headers: new Headers(headers), text: async () => '{}' }
}
const context = endpoint => ({ params: Promise.resolve({ path: endpoint.split('?')[0].split('/') }) })

test('Google config is proxied without exposing credentials', async () => {
  globalThis.fetch = async url => {
    assert.match(url, /\/api\/auth\/config$/)
    return Response.json({ googleEnabled: true })
  }
  const response = await GET(request('config'), context('config'))
  assert.deepEqual(await response.json(), { googleEnabled: true })
})

test('Google start preserves redirect and state cookie', async () => {
  globalThis.fetch = async (_url, options) => {
    assert.equal(options.redirect, 'manual')
    return new Response(null, { status: 302, headers: { location: 'https://accounts.google.com/o/oauth2/v2/auth?state=test', 'set-cookie': 'artiz_google_state=test; HttpOnly; SameSite=Lax; Path=/api/auth' } })
  }
  const response = await GET(request('google'), context('google'))
  assert.equal(response.status, 302)
  assert.match(response.headers.get('location'), /^https:\/\/accounts.google.com\//)
  assert.match(response.headers.get('set-cookie'), /artiz_google_state=test/)
})

test('cross-site Google callback forwards query and cookie for server verification', async () => {
  globalThis.fetch = async (url, options) => {
    assert.match(url, /google\/callback\?state=test&code=code$/)
    assert.equal(options.headers.cookie, 'artiz_google_state=test')
    return new Response(null, { status: 303, headers: { location: 'http://localhost:3001/account', 'set-cookie': 'artiz_customer_session=session; HttpOnly; Path=/api/auth' } })
  }
  const response = await GET(request('google/callback?state=test&code=code', { headers: { 'sec-fetch-site': 'cross-site', cookie: 'artiz_google_state=test' } }), context('google/callback'))
  assert.equal(response.status, 303)
  assert.equal(response.headers.get('location'), 'http://localhost:3001/account')
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer')
})

test('cross-site login and Google start remain blocked; callback POST is rejected', async () => {
  globalThis.fetch = async () => { throw new Error('Must not call upstream') }
  assert.equal((await POST(request('login', { method: 'POST', headers: { origin: 'https://attacker.example' } }), context('login'))).status, 403)
  assert.equal((await GET(request('google', { headers: { 'sec-fetch-site': 'cross-site' } }), context('google'))).status, 403)
  assert.equal((await POST(request('google/callback', { method: 'POST' }), context('google/callback'))).status, 405)
  assert.equal((await GET(request('unknown'), context('unknown'))).status, 404)
})

test('account methods forward scoped profile, address, wishlist and order requests', async () => {
  for (const [endpoint, method, handler] of [['profile', 'PATCH', PATCH], ['addresses', 'GET', GET], ['addresses', 'POST', POST], ['addresses/cm123', 'PUT', PUT], ['addresses/cm123', 'DELETE', DELETE], ['wishlist', 'GET', GET], ['wishlist', 'POST', POST], ['wishlist/cm123', 'DELETE', DELETE], ['orders', 'GET', GET], ['checkout/config', 'GET', GET], ['checkout/order', 'POST', POST], ['checkout/verify', 'POST', POST]]) {
    globalThis.fetch = async (url, options) => {
      assert.ok(url.endsWith(`/api/auth/${endpoint}`))
      assert.equal(options.method, method)
      assert.equal(options.headers.cookie, 'artiz_customer_session=test')
      return Response.json({ ok: true })
    }
    const response = await handler(request(endpoint, { method, headers: { cookie: 'artiz_customer_session=test', origin: 'http://localhost:3001' } }), context(endpoint))
    assert.equal(response.status, 200)
  }
})

test('account mutations reject cross-site requests and wrong methods', async () => {
  globalThis.fetch = async () => { throw new Error('Must not call upstream') }
  assert.equal((await PATCH(request('profile', { method: 'PATCH', headers: { 'sec-fetch-site': 'cross-site' } }), context('profile'))).status, 403)
  assert.equal((await DELETE(request('addresses/cm123', { method: 'DELETE', headers: { origin: 'https://attacker.example' } }), context('addresses/cm123'))).status, 403)
  assert.equal((await POST(request('orders', { method: 'POST' }), context('orders'))).status, 405)
})
