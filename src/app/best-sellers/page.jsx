import FeaturedCollectionPage from '../../components/FeaturedCollectionPage'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Best Sellers | Artiz', description: 'Explore the Artiz best sellers collection.' }

export default function Page() {
  return <FeaturedCollectionPage name="Best Sellers" slug="best-sellers" description="Explore our best sellers, selected for your home." flag="isBestSeller" />
}
