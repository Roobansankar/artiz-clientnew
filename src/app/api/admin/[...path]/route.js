import { revalidateTag } from 'next/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
async function proxy(request, context) {
    const { path } = await context.params;
    const endpoint = path.join('/');
    const collectCash = /^orders\/[a-z0-9]{20,40}\/collect$/.test(endpoint);
    if (collectCash && request.method !== 'POST') return Response.json({ message: 'Method not allowed.' }, { status: 405 });
    const orderDetail = /^orders\/[a-z0-9]{20,40}$/.test(endpoint);
    if (orderDetail && request.method !== 'GET') return Response.json({ message: 'Method not allowed.' }, { status: 405 });
    const customerDeletion = /^customers\/[a-z0-9]{20,40}$/.test(endpoint);
    if (customerDeletion && request.method !== 'DELETE') return Response.json({ message: 'Method not allowed.' }, { status: 405 });
    if (!['auth/login', 'auth/me', 'auth/logout', 'contact-messages', 'notifications', 'dashboard', 'customers', 'orders', 'products', 'products/template', 'products/bulk', 'categories', 'categories/order', 'gallery', 'hero-slides', 'hero-slides/order'].includes(endpoint) && !/^contact-messages\/[a-z0-9]{20,40}$/.test(endpoint) && !/^products\/[A-Za-z0-9_-]{1,40}$/.test(endpoint) && !/^categories\/[a-z0-9-]{1,140}$/.test(endpoint) && !/^gallery\/[a-z0-9]{20,40}$/.test(endpoint) && !/^hero-slides\/[a-z0-9-]{1,100}$/.test(endpoint))
        if (!customerDeletion && !orderDetail && !collectCash) return Response.json({ message: 'Endpoint not found.' }, { status: 404 });
    const base = process.env.API_BASE_URL || 'http://127.0.0.1:5000';
    const headers = new Headers({ 'content-type': request.headers.get('content-type') || 'application/json' });
    for (const name of ['cookie', 'origin']) {
        const value = request.headers.get(name);
        if (value)
            headers.set(name, value);
    }
    try {
        let body;
        if (request.method !== 'GET' && request.body) {
            const reader = request.body.getReader();
            const chunks = [];
            let size = 0;
            while (true) {
                const { value, done } = await reader.read();
                if (done)
                    break;
                size += value.length;
                if (size > 50 * 1024 * 1024) {
                    await reader.cancel();
                    return Response.json({ message: 'Upload is too large (50 MB maximum).' }, { status: 413 });
                }
                chunks.push(value);
            }
            body = new Uint8Array(size);
            let offset = 0;
            for (const chunk of chunks) {
                body.set(chunk, offset);
                offset += chunk.length;
            }
        }
        const response = await fetch(`${base}/api/admin/${endpoint}${request.nextUrl.search}`, {
            method: request.method,
            headers,
            body: body,
            cache: 'no-store',
            redirect: 'error',
            signal: AbortSignal.timeout((endpoint.startsWith('products') || endpoint.startsWith('categories') || endpoint.startsWith('gallery') || endpoint.startsWith('hero-slides')) && request.method !== 'GET' ? 60000 : 8000),
        });
        if (response.ok && request.method !== 'GET' && (endpoint === 'hero-slides' || endpoint.startsWith('hero-slides/'))) {
            revalidateTag('home-hero', { expire: 0 });
        }
        const contentType = response.headers.get('content-type') || 'application/json';
        const binary = !contentType.includes('application/json');
        const resultHeaders = new Headers({ 'content-type': contentType, 'cache-control': 'no-store' });
        const disposition = response.headers.get('content-disposition');
        if (disposition) resultHeaders.set('content-disposition', disposition);
        for (const cookie of response.headers.getSetCookie())
            resultHeaders.append('set-cookie', cookie);
        const payload = response.status === 204 ? null : binary ? await response.arrayBuffer() : await response.text();
        return new Response(payload, { status: response.status, headers: resultHeaders });
    }
    catch {
        return Response.json({ message: 'Cannot reach the admin server. Please try again shortly.' }, { status: 503, headers: { 'cache-control': 'no-store' } });
    }
}
export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
