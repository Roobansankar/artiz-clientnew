// All auth/cart/order responses are mocked. No real cart, order or payment is modified.
import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright')
const base = process.env.WEB_URL || 'http://127.0.0.1:3101'
const products = (await (await fetch(`${process.env.API_URL || 'http://127.0.0.1:5000'}/api/products?pageSize=48&inStock=true`)).json()).products
const product = products.find(product => product.variants?.some(option => Number(option.stock) >= 2))
const other = products.find(item => item.id !== product?.id)
assert.ok(product && other, 'Use two development products, one with a variant stock of at least two')
const variantIndex = product.variants.findIndex(option => Number(option.stock) >= 2)
const variant = product.variants[variantIndex]
const customer = { id: 'browser-buyer', name: 'Browser Buyer', email: 'buyer@example.com', phone: '9876543210' }
const savedCart = { id: 'preserved-cart', items: [
  { id: 'saved-selected', productId: product.id, variantIndex, quantity: Math.min(10, variant.stock), stock: variant.stock, name: product.name, image: product.image, price: Number(variant.price), currency: 'INR' },
  { id: 'saved-other', productId: other.id, variantIndex: other.variants?.length ? 0 : null, quantity: 1, stock: other.stock, name: other.name, image: other.image, price: Number(other.amount), currency: 'INR' },
] }
const address = { id: 'browser-address', fullName: customer.name, phone: customer.phone, line1: '12 Test Road', city: 'Pune', state: 'Maharashtra', postalCode: '411001', country: 'India', isDefault: true }
const browser = await chromium.launch({ channel: 'msedge', headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.addInitScript(() => { localStorage.setItem('artiz-popup', '1'); localStorage.setItem('artiz-cart-imported-v1', '1') })
  const errors = []
  const orders = []
  let signedIn = false
  let cartMutations = 0
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/api/auth/**', async route => {
    const url = new URL(route.request().url())
    const method = route.request().method()
    if (url.pathname === '/api/auth/me') return route.fulfill({ json: { customer: signedIn ? customer : null } })
    if (url.pathname === '/api/auth/login') { signedIn = true; return route.fulfill({ json: { customer } }) }
    if (url.pathname === '/api/auth/config') return route.fulfill({ json: { googleEnabled: false } })
    if (url.pathname.startsWith('/api/auth/cart')) {
      if (method !== 'GET') { cartMutations++; return route.fulfill({ status: 409, json: { message: 'Direct checkout must not mutate the cart' } }) }
      return route.fulfill({ json: { cart: savedCart } })
    }
    if (url.pathname === '/api/auth/wishlist') return route.fulfill({ json: { productIds: [] } })
    if (url.pathname === '/api/auth/addresses') return route.fulfill({ json: { addresses: [address] } })
    if (url.pathname === '/api/auth/checkout/config') return route.fulfill({ json: { onlineEnabled: false, codEnabled: true } })
    if (url.pathname === '/api/auth/checkout/order') {
      const body = route.request().postDataJSON()
      assert.deepEqual(body.items, [{ id: product.id, color: variantIndex, quantity: 2 }])
      orders.push(body)
      if (orders.length === 1) return route.fulfill({ status: 503, json: { message: 'Temporary checkout failure' } })
      return route.fulfill({ json: { order: { number: 'BROWSER-DIRECT', status: 'CONFIRMED', paymentMethod: 'COD', amount: Number(variant.price) * 2 } } })
    }
    return route.fulfill({ status: 404, json: {} })
  })
  await page.goto(`${base}/products/${product.slug}`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => localStorage.getItem('artiz-cart-v1')?.includes('saved-selected'))
  if (variant.color) await page.getByRole('button', { name: `Choose color ${variant.color}`, exact: true }).click()
  await page.getByRole('button', { name: 'Increase quantity', exact: true }).click()
  assert.equal(await page.locator('output[aria-label="Quantity"]').textContent(), '2')
  const cartBefore = await page.evaluate(() => localStorage.getItem('artiz-cart-v1'))
  await page.evaluate(() => sessionStorage.setItem('artiz-payment-verification', 'preserve-cart-payment-state'))
  const buyNow = page.getByRole('link', { name: 'Buy Now', exact: true })
  const target = new URL(await buyNow.getAttribute('href'), base)
  assert.equal(target.pathname, '/checkout')
  assert.equal(target.searchParams.get('buyNow'), '1')
  assert.equal(target.searchParams.get('product'), product.id)
  assert.equal(target.searchParams.get('quantity'), '2')
  await buyNow.click()
  await page.waitForURL(url => url.pathname === '/checkout' && url.searchParams.get('buyNow') === '1')
  const directUrl = new URL(page.url()).pathname + new URL(page.url()).search
  await page.getByRole('heading', { name: 'Sign in to checkout', exact: true }).waitFor()
  const signIn = page.getByRole('link', { name: 'Sign in / Create account', exact: true })
  assert.equal(new URL(await signIn.getAttribute('href'), base).searchParams.get('next'), directUrl)
  assert.equal(cartMutations, 0)
  await signIn.click()
  await page.getByLabel('Email address', { exact: true }).fill(customer.email)
  await page.getByLabel('Password', { exact: true }).fill('browser-only-password')
  await page.locator('form').filter({ has: page.locator('#account-email') }).getByRole('button', { name: 'Sign in', exact: true }).click()
  await page.waitForURL(url => url.pathname + url.search === directUrl)
  const summary = page.locator('aside').filter({ has: page.getByRole('heading', { name: 'Order summary', exact: true }) })
  await summary.waitFor()
  assert.equal(await summary.locator('li').count(), 1)
  await summary.getByText(product.name, { exact: true }).waitFor()
  assert.equal(await summary.getByText(other.name, { exact: true }).count(), 0)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await summary.waitFor()
  assert.equal(await summary.locator('li').count(), 1)
  const placeOrder = page.getByRole('button', { name: /^Place order/ })
  await placeOrder.click()
  await page.getByRole('alert').filter({ hasText: 'Temporary checkout failure' }).waitFor()
  await placeOrder.click()
  await page.getByRole('heading', { name: 'Order confirmed', exact: true }).waitFor()
  assert.equal(orders.length, 2)
  assert.equal(orders[0].checkoutKey, orders[1].checkoutKey, 'Retry must reuse the direct checkout idempotency key')
  assert.equal(cartMutations, 0, 'Buy Now and completion must not add, remove or clear cart items')
  assert.equal(await page.evaluate(() => localStorage.getItem('artiz-cart-v1')), cartBefore)
  assert.equal(await page.evaluate(() => sessionStorage.getItem('artiz-payment-verification')), 'preserve-cart-payment-state')
  await page.goto(`${base}/checkout`, { waitUntil: 'domcontentloaded' })
  await summary.waitFor()
  assert.equal(await summary.locator('li').count(), 2, 'Normal checkout still shows the saved cart')
  await page.goto(`${base}/checkout?buyNow=1&product=${product.id}&quantity=11`, { waitUntil: 'domcontentloaded' })
  await page.getByRole('alert').filter({ hasText: 'direct checkout link is invalid' }).waitFor()
  assert.equal(await page.getByRole('heading', { name: 'Order summary', exact: true }).count(), 0)
  assert.deepEqual(errors, [])
  console.log('Passed: direct selected-product checkout, variant/quantity, login return, refresh, order retry, existing cart preserved after completion, normal cart checkout and invalid-link rejection.')
} finally { await browser.close() }
