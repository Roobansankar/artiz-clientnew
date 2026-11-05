import FeaturedCollectionPage from '../../components/FeaturedCollectionPage'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'New Arrivals | Artiz', description: 'Discover the latest arrivals at Artiz.' }

export default function Page() {
  return <FeaturedCollectionPage name="New Arrivals" slug="new-arrivals" description="Fresh finds for thoughtfully styled spaces. Explore our latest additions." flag="isNewArrival" />
}
