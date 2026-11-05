import { notFound } from 'next/navigation'
import { cache } from 'react'
import ProductDetail from '../../../views/ProductDetail'
import { descendantSlugs, shopProduct } from '../../../catalog'

export const dynamic = 'force-dynamic'

const getProduct = cache(async id => {
  const response = await fetch(`${process.env.API_BASE_URL || 'http://127.0.0.1:5000'}/api/products/${encodeURIComponent(id)}`, { cache: 'no-store', signal: AbortSignal.timeout(10000) })
  if (response.status === 404) return null
  if (!response.ok) throw new Error('This product is temporarily unavailable. Please try again.')
  return (await response.json()).product
})

export async function generateMetadata({ params }) {
  const product = await getProduct((await params).id)
  return product ? { title: `${product.name} | Artiz`, description: product.description.slice(0, 160) } : { title: 'Product not found | Artiz' }
}

export default async function ProductPage({ params }) {
  const product = await getProduct((await params).id)
  if (!product) notFound()
  const base = process.env.API_BASE_URL || 'http://127.0.0.1:5000'
  const responses = await Promise.all(['categories', 'products'].map(resource => fetch(`${base}/api/${resource}`, { cache: 'no-store', signal: AbortSignal.timeout(10000) })))
  if (responses.some(response => !response.ok)) throw new Error('The catalog is temporarily unavailable. Please try again.')
  const [{ categories }, { products }] = await Promise.all(responses.map(response => response.json()))
  const category = categories.find(item => item.slug === product.categorySlug)
  let root = category
  const seen = new Set()
  while (root?.parentSlug && !seen.has(root.slug)) {
    seen.add(root.slug)
    root = categories.find(item => item.slug === root.parentSlug)
  }
  const family = root ? descendantSlugs(root.slug, categories) : new Set([product.categorySlug])
  const related = products.filter(item => item.id !== product.id && [item.categorySlug, ...(item.collectionSlugs || [])].some(slug => family.has(slug))).slice(0, 4)
  return <ProductDetail key={product.id} product={shopProduct(product, categories)} category={category || null} related={related.map(item => shopProduct(item, categories))} />
}
