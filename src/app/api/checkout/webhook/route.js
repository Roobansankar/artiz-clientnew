export const runtime = 'nodejs'

export async function POST(request) {
  const limit = 256 * 1024
  if (Number(request.headers.get('content-length') || 0) > limit) return new Response(null, { status: 413 })
  try {
    const reader = request.body?.getReader()
    const chunks = []
    let size = 0
    if (reader) while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.length
      if (size > limit) { await reader.cancel(); return new Response(null, { status: 413 }) }
      chunks.push(value)
    }
    const body = new Uint8Array(size)
    let offset = 0
    for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.length }
    // Preserve the exact bytes: Razorpay's signature is verified by the Express API.
    const response = await fetch(`${process.env.API_BASE_URL || 'http://127.0.0.1:5000'}/api/checkout/webhook`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-razorpay-signature': request.headers.get('x-razorpay-signature') || '' }, body, cache: 'no-store', signal: AbortSignal.timeout(20000) })
    return new Response(await response.text(), { status: response.status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })
  } catch { return Response.json({ message: 'Webhook temporarily unavailable.' }, { status: 503 }) }
}
