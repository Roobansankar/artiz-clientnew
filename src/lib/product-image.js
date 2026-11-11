export const productImagePlaceholder = '/images/product-placeholder.svg'

export function productImageSource(source, allowPreview = false) {
  if (typeof source !== 'string') return productImagePlaceholder
  if (allowPreview && source.startsWith('blob:')) return source
  // Keep this in sync with next.config.mjs. Unsupported legacy paths must never
  // reach Next Image: its validation throws before an onError handler can run.
  if (!source.startsWith('/images/') && !source.startsWith('/api/media/')) return productImagePlaceholder
  try {
    const decoded = decodeURIComponent(source)
    if (/[?#\\\u0000-\u001f]/.test(decoded) || decoded.split('/').some(part => part === '.' || part === '..')) return productImagePlaceholder
  } catch { return productImagePlaceholder }
  return source
}
