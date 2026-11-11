import { test } from 'node:test'
import assert from 'node:assert/strict'
import { productImagePlaceholder, productImageSource } from '../src/lib/product-image.js'

test('unsupported product paths fall back before Next Image can throw', () => {
  for (const source of ['/test.jpg', '', undefined, null, '//example.com/image.jpg', 'https://example.com/image.jpg', '/api/auth/me', '/images/../test.jpg', '/images/%2e%2e/test.jpg', '/images/test.jpg?secret=1']) {
    assert.equal(productImageSource(source), productImagePlaceholder)
  }
});

test('valid catalog paths stay optimized and blob previews require explicit opt-in', () => {
  assert.equal(productImageSource('/images/product1.png'), '/images/product1.png')
  assert.equal(productImageSource('/api/media/example.webp'), '/api/media/example.webp')
  assert.equal(productImageSource('blob:http://localhost/upload'), productImagePlaceholder)
  assert.equal(productImageSource('blob:http://localhost/upload', true), 'blob:http://localhost/upload')
});
