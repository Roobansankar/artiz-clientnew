import ShopPage from '../../views/ShopPage'
import { catalogData } from '../../lib/server-catalog'
import { shopProduct } from '../../catalog'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Shop – Artiz Interior Design Studio',
}

export default async function Page() {
  const [{ categories }, listing] = await Promise.all([
    catalogData('categories'), catalogData('products', 'pageSize=12&sort=name-asc&facets=true'),
  ])
  const { products, ...initial } = listing
  const collections = categories.filter(category => category.kind === 'category' && !category.parentSlug && category.showInMenu).map(category => ({
    title: category.name, img: category.image || '/images/categories/decor.jpg', href: `/shop/${category.slug}`, count: initial.facets.categoryCounts[category.slug] || 0,
  }))
  return <ShopPage collection={{ name: 'Shop', slug: 'all', description: 'Explore furniture and finishing touches for your home.' }} categoryCollections={collections} categoryProducts={products.map(product => shopProduct(product, categories))} remoteCatalog={{ initial, categories }} />
}
