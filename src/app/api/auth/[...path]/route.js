export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function proxy(request, { params }) {
  const endpoint = (await params).path.join('/')
  if (!['me', 'login', 'register', 'logout'].includes(endpoint)) return Response.json({ message: 'Endpoint not found.' }, { status: 404 })
  if ((request.method === 'GET') !== (endpoint === 'me')) return Response.json({ message: 'Method not allowed.' }, { status: 405 })
  const origin = request.headers.get('origin')
  if ((origin && origin !== request.nextUrl.origin) || request.headers.get('sec-fetch-site') === 'cross-site') return Response.json({ message: 'This origin is not allowed.' }, { status: 403 })
  try {
    let body
    if (request.method === 'POST') {
      if (Number(request.headers.get('content-length') || 0) > 32768) return Response.json({ message: 'Request is too large.' }, { status: 413 })
      body = await request.text()
      if (new TextEncoder().encode(body).length > 32768) return Response.json({ message: 'Request is too large.' }, { status: 413 })
    }
    // The browser origin is checked above; the upstream request is server to server.
    const response = await fetch(`${process.env.API_BASE_URL || 'http://127.0.0.1:5000'}/api/auth/${endpoint}`, {
      method: request.method, body, headers: { 'Content-Type': 'application/json', cookie: request.headers.get('cookie') || '' },
      cache: 'no-store', redirect: 'manual', signal: AbortSignal.timeout(20000),
    })
    const headers = new Headers({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
    for (const cookie of response.headers.getSetCookie()) headers.append('set-cookie', cookie)
    return new Response(response.status === 204 ? null : await response.text(), { status: response.status, headers })
  } catch {
    return Response.json({ message: 'Account services are temporarily unavailable. Please try again.' }, { status: 503 })
  }
}

export const GET = proxy
export const POST = proxy
