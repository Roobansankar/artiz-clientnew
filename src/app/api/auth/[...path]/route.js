export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function proxy(request, { params }) {
  const endpoint = (await params).path.join('/')
  const methods = { me: ['GET'], config: ['GET'], google: ['GET'], 'google/callback': ['GET'], login: ['POST'], register: ['POST'], logout: ['POST'], profile: ['PATCH'], addresses: ['GET', 'POST'], wishlist: ['GET', 'POST'], orders: ['GET'] }
  const allowed = methods[endpoint] || (/^addresses\/[a-z0-9]+$/.test(endpoint) ? ['PUT', 'DELETE'] : /^wishlist\/[a-z0-9]+$/.test(endpoint) ? ['DELETE'] : null)
  if (!allowed) return Response.json({ message: 'Endpoint not found.' }, { status: 404 })
  if (!allowed.includes(request.method)) return Response.json({ message: 'Method not allowed.' }, { status: 405 })
  const origin = request.headers.get('origin')
  // Google's top-level callback is cross-site; the server verifies state, nonce and PKCE.
  const googleCallback = endpoint === 'google/callback' && request.method === 'GET'
  if (!googleCallback && ((origin && origin !== request.nextUrl.origin) || request.headers.get('sec-fetch-site') === 'cross-site')) return Response.json({ message: 'This origin is not allowed.' }, { status: 403 })
  try {
    let body
    if (request.method !== 'GET') {
      if (Number(request.headers.get('content-length') || 0) > 32768) return Response.json({ message: 'Request is too large.' }, { status: 413 })
      body = await request.text()
      if (new TextEncoder().encode(body).length > 32768) return Response.json({ message: 'Request is too large.' }, { status: 413 })
    }
    // The browser origin is checked above; the upstream request is server to server.
    const response = await fetch(`${process.env.API_BASE_URL || 'http://127.0.0.1:5000'}/api/auth/${endpoint}${request.nextUrl.search}`, {
      method: request.method, body, headers: { 'Content-Type': 'application/json', cookie: request.headers.get('cookie') || '' },
      cache: 'no-store', redirect: 'manual', signal: AbortSignal.timeout(20000),
    })
    const headers = new Headers({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' })
    for (const cookie of response.headers.getSetCookie()) headers.append('set-cookie', cookie)
    const location = response.headers.get('location')
    if (location) headers.set('location', location)
    return new Response(response.status === 204 || location ? null : await response.text(), { status: response.status, headers })
  } catch {
    return Response.json({ message: 'Account services are temporarily unavailable. Please try again.' }, { status: 503 })
  }
}

export const GET = proxy
export const POST = proxy
export const PATCH = proxy
export const PUT = proxy
export const DELETE = proxy
