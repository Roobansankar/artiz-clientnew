import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseDirectCheckout, directCheckoutUrl, checkoutReturnPath } from '../src/lib/direct-checkout.js'

test('direct checkout preserves only product, variant and quantity, never client prices', () => {
  const selection = { id: 'product-123', variantIndex: 2, quantity: 3 }
  const url = directCheckoutUrl(selection)
  assert.deepEqual(parseDirectCheckout(Object.fromEntries(new URL(url, 'http://local').searchParams)), { selection, error: '' })
  assert.deepEqual(parseDirectCheckout({ buyNow: '1', product: 'simple', price: '0' }).selection, { id: 'simple', variantIndex: null, quantity: 1 })
  assert.deepEqual(parseDirectCheckout({}), { selection: null, error: '' })
});

test('invalid direct selections fail closed instead of falling back to cart checkout', () => {
  for (const change of [{ buyNow: '2' }, { product: '../private' }, { product: ['a', 'b'] }, { quantity: '0' }, { quantity: '11' }, { quantity: '1.5' }, { variant: '-1' }, { variant: '1001' }, { variant: ['0', '1'] }]) {
    const parsed = parseDirectCheckout({ buyNow: '1', product: 'product-123', ...change })
    assert.equal(parsed.selection, null)
    assert.ok(parsed.error)
  }
});

test('login return paths retain the direct selection and reject open redirects', () => {
  const url = directCheckoutUrl({ id: 'product-123', variantIndex: 0, quantity: 2 })
  assert.equal(checkoutReturnPath(url), url)
  assert.equal(checkoutReturnPath('checkout'), '/checkout')
  assert.equal(checkoutReturnPath('/checkout'), '/checkout')
  for (const path of ['https://outside.example/checkout', '//outside.example/checkout', '/checkout-other', '/checkout?buyNow=1&product=x&quantity=0', '/checkout?buyNow=1&product=a&product=b']) assert.equal(checkoutReturnPath(path), null)
});
