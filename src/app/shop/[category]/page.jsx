import { notFound } from 'next/navigation'
import ShopPage from '../../../views/ShopPage'
import { shopProduct } from '../../../catalog'
import { catalogData } from '../../../lib/server-catalog'

export const dynamic = 'force-dynamic'

export default async function CategoryPage({ params }) {
  const { category: slug } = await params
  const { categories } = await catalogData('categories')
  const category = categories.find(item => item.slug === slug)
  if (!category) notFound()
  const listing = await catalogData('products', new URLSearchParams({ category: slug, pageSize: '12', sort: 'name-asc', facets: 'true' }).toString())
  const { products, ...initial } = listing
  const matchingProducts = products.map(product => shopProduct(product, categories))
  const collections = categories.filter(item => item.parentSlug === slug && item.showInMenu).map(child => ({
    title: child.name,
    img: child.image || category.image || '/images/categories/decor.jpg',
    href: `/shop/${encodeURIComponent(child.slug)}`,
    count: initial.facets.categoryCounts[child.slug] || 0,
  }))
  const ancestors = []
  const seen = new Set([slug])
  let parent = categories.find(item => item.slug === category.parentSlug)
  while (parent && !seen.has(parent.slug)) {
    seen.add(parent.slug)
    ancestors.unshift({ title: parent.name, href: `/shop/${encodeURIComponent(parent.slug)}` })
    parent = categories.find(item => item.slug === parent.parentSlug)
  }
  return <ShopPage key={slug} category={category} categoryCollections={collections} categoryProducts={matchingProducts} ancestors={ancestors} remoteCatalog={{ initial, categories, category: slug }} />
}
