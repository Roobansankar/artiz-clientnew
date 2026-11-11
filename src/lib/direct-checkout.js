export function parseDirectCheckout(params = {}) {
  if (params.buyNow == null && params.product == null) return { selection: null, error: '' }
  const quantity = params.quantity ?? '1'
  const variant = params.variant
  if (params.buyNow !== '1' || typeof params.product !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(params.product)
    || typeof quantity !== 'string' || !/^(?:[1-9]|10)$/.test(quantity)
    || (variant != null && (typeof variant !== 'string' || !/^(?:0|[1-9]\d{0,3})$/.test(variant) || Number(variant) > 1000))) {
    return { selection: null, error: 'This direct checkout link is invalid. Please select the product again.' }
  }
  return { selection: { id: params.product, variantIndex: variant == null ? null : Number(variant), quantity: Number(quantity) }, error: '' }
}

export function directCheckoutUrl({ id, variantIndex, quantity }) {
  const params = new URLSearchParams({ buyNow: '1', product: id, quantity: String(quantity) })
  if (variantIndex != null) params.set('variant', String(variantIndex))
  const parsed = parseDirectCheckout(Object.fromEntries(params))
  if (parsed.error) throw new Error(parsed.error)
  return `/checkout?${params}`
}

export function checkoutReturnPath(value) {
  if (value === 'checkout' || value === '/checkout') return '/checkout'
  if (typeof value !== 'string' || !value.startsWith('/checkout?')) return null
  const params = new URL(value, 'http://checkout.local').searchParams
  if (['buyNow', 'product', 'quantity', 'variant'].some(key => params.getAll(key).length > 1)) return null
  const { selection, error } = parseDirectCheckout(Object.fromEntries(params))
  return selection && !error ? directCheckoutUrl(selection) : null
}
