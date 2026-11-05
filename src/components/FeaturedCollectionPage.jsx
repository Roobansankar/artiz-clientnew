import ShopPage from '../views/ShopPage'
import { categoryProducts, featuredProducts, shopProduct } from '../catalog'

export default async function FeaturedCollectionPage({ name, slug, description, flag }) {
  const base = process.env.API_BASE_URL || 'http://127.0.0.1:5000'
  const responses = await Promise.all(['categories', 'products'].map(resource => fetch(`${base}/api/${resource}`, {
    cache: 'no-store', signal: AbortSignal.timeout(10000),
  })))
  if (responses.some(response => !response.ok)) throw new Error('The collection is temporarily unavailable. Please try again.')
  const [{ categories }, { products }] = await Promise.all(responses.map(response => response.json()))
  const selected = featuredProducts(products, flag)
  const collections = categories.filter(category => category.kind === 'category' && !category.parentSlug && category.showInMenu)
    .map(category => ({
      title: category.name,
      img: category.image || '/images/categories/decor.jpg',
      href: `/shop/${encodeURIComponent(category.slug)}`,
      count: categoryProducts(category.slug, categories, selected).length,
    })).filter(category => category.count > 0)
  return <ShopPage collection={{ name, slug, description }} categoryCollections={collections}
    categoryProducts={selected.map(product => shopProduct(product, categories))}
    initialSort={flag === 'isNewArrival' ? 'created-descending' : 'manual'} />
}

