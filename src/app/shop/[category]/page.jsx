import { notFound } from 'next/navigation'
import ShopPage from '../../../views/ShopPage'
import { categoryProducts, shopProduct } from '../../../catalog'

export const dynamic = 'force-dynamic'

async function catalogData(resource) {
  const response = await fetch(`${process.env.API_BASE_URL || 'http://127.0.0.1:5000'}/api/${resource}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) throw new Error('The catalog is temporarily unavailable. Please try again.')
  return response.json()
}

export default async function CategoryPage({ params }) {
  const { category: slug } = await params
  const { categories } = await catalogData('categories')
  const category = categories.find(item => item.slug === slug)
  if (!category) notFound()
  const { products } = await catalogData('products')
  const matchingProducts = categoryProducts(slug, categories, products).map(product => shopProduct(product, categories))
  const collections = categories.filter(item => item.parentSlug === slug && item.showInMenu).map(child => ({
    title: child.name,
    img: child.image || category.image || '/images/categories/decor.jpg',
    href: `/shop/${encodeURIComponent(child.slug)}`,
    count: categoryProducts(child.slug, categories, products).length,
  }))
  const ancestors = []
  const seen = new Set([slug])
  let parent = categories.find(item => item.slug === category.parentSlug)
  while (parent && !seen.has(parent.slug)) {
    seen.add(parent.slug)
    ancestors.unshift({ title: parent.name, href: `/shop/${encodeURIComponent(parent.slug)}` })
    parent = categories.find(item => item.slug === parent.parentSlug)
  }
  return <ShopPage key={slug} category={category} categoryCollections={collections} categoryProducts={matchingProducts} ancestors={ancestors} />
}
