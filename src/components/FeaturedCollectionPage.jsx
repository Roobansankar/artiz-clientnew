import ShopPage from '../views/ShopPage'
import { shopProduct } from '../catalog'
import { catalogData } from '../lib/server-catalog'

export default async function FeaturedCollectionPage({ name, slug, description, flag }) {
  const [{ categories }, listing] = await Promise.all([
    catalogData('categories'), catalogData('products', new URLSearchParams({ flag, pageSize: '12', sort: 'newest', facets: 'true' }).toString()),
  ])
  const { products, ...initial } = listing
  const collections = categories.filter(category => category.kind === 'category' && !category.parentSlug && category.showInMenu)
    .map(category => ({
      title: category.name,
      img: category.image || '/images/categories/decor.jpg',
      href: `/shop/${encodeURIComponent(category.slug)}`,
      count: initial.facets.categoryCounts[category.slug] || 0,
    })).filter(category => category.count > 0)
  return <ShopPage collection={{ name, slug, description }} categoryCollections={collections}
    categoryProducts={products.map(product => shopProduct(product, categories))}
    remoteCatalog={{ initial, categories, flag }} initialSort={flag === 'isNewArrival' ? 'created-descending' : 'manual'} />
}

