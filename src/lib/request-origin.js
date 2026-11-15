const artizHosts = new Set(['artizdesignstudio.in', 'www.artizdesignstudio.in'])
const localHosts = new Set(['localhost', '127.0.0.1'])

export function isAllowedRequestOrigin(request) {
  const origin = request.headers.get('origin')
  const fetchSite = request.headers.get('sec-fetch-site')
  if (!origin) return fetchSite !== 'cross-site'

  try {
    const actual = new URL(origin)
    const expectedOrigins = new Set([new URL(request.nextUrl.origin).origin])
    const hosts = [request.headers.get('host'), request.headers.get('x-forwarded-host')?.split(',')[0].trim()].filter(Boolean)
    const protocols = [new URL(request.nextUrl.origin).protocol.slice(0, -1), request.headers.get('x-forwarded-proto')?.split(',')[0].trim()].filter(protocol => ['http', 'https'].includes(protocol))
    for (const host of hosts) for (const protocol of protocols) {
      try { expectedOrigins.add(new URL(`${protocol}://${host}`).origin) }
      catch { /* Ignore an invalid host and retain the other request origins. */ }
    }
    if (expectedOrigins.has(actual.origin)) return fetchSite !== 'cross-site'

    // Local development can be opened as localhost or 127.0.0.1, and Next may
    // move between the standard dev ports while another local process is running.
    const localDevelopment = process.env.NODE_ENV !== 'production' &&
      actual.protocol === 'http:' && localHosts.has(actual.hostname) &&
      [...expectedOrigins].some(value => {
        const expected = new URL(value)
        return expected.protocol === 'http:' && localHosts.has(expected.hostname)
      })
    if (localDevelopment) return true

    if (fetchSite === 'cross-site') return false

    // The production storefront may be reached through either canonical host.
    return actual.protocol === 'https:' && artizHosts.has(actual.hostname) &&
      [...expectedOrigins].some(value => {
        const expected = new URL(value)
        return expected.protocol === 'https:' && artizHosts.has(expected.hostname)
      })
  } catch {
    return false
  }
}
