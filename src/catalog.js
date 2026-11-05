export function descendantSlugs(slug, categories) {
  const slugs = new Set([slug])
  let changed = true
  while (changed) {
    changed = false
    for (const category of categories) {
      if (slugs.has(category.parentSlug) && !slugs.has(category.slug)) {
        slugs.add(category.slug)
        changed = true
      }
    }
  }
  return slugs
}

export function categoryProducts(slug, categories, products) {
  const slugs = descendantSlugs(slug, categories)
  return products.filter(product => [product.categorySlug, ...(product.collectionSlugs || [])].some(value => slugs.has(value)))
}

export function shopProduct(product, categories) {
  const variants = Array.isArray(product.variants) ? product.variants : []
  const unique = values => [...new Set(values.filter(Boolean))]
  return {
    ...product,
    title: product.name,
    price: Number(product.amount),
    compare: product.mrp == null ? 0 : Number(product.mrp),
    img: product.images?.[0] || product.image || '/images/categories/decor.jpg',
    hover: product.images?.[1] || product.images?.[0] || product.image || '/images/categories/decor.jpg',
    available: Number(product.stock) > 0,
    created: product.createdAt || '',
    vendor: categories.find(category => category.slug === product.categorySlug)?.name || 'Artiz',
    colors: unique([...(product.swatches || []), ...variants.map(variant => variant.color)]),
    sizes: unique(variants.map(variant => variant.size)),
    fabrics: unique(variants.map(variant => variant.fabric)),
    specs: [],
    currency: 'INR',
  }
}

export function firstAvailableVariant(product) {
  const variants = product.variants || []
  return variants.length ? Math.max(0, variants.findIndex(option => Number(option.stock) > 0)) : null
}

export function productOption(product, index = firstAvailableVariant(product)) {
  if (product.variants?.length) {
    const option = product.variants[index]
    return option ? { ...option, price: Number(option.price), mrp: option.mrp == null ? null : Number(option.mrp), stock: Number(option.stock) || 0 } : { price: 0, mrp: null, stock: 0 }
  }
  return { price: Number(product.amount ?? product.price), mrp: product.mrp ?? product.compare ?? null, stock: product.stock == null ? Infinity : Number(product.stock) }
}

export function formatPrice(value, currency = 'INR') {
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value)
}
