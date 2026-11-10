import FeaturedCollectionPage from '../../components/FeaturedCollectionPage'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Curated Collection | Artiz',
  description: 'Thoughtfully chosen furniture and decor, designed for modern homes.',
}

export default function Page() {
  return <FeaturedCollectionPage name="Curated Collection" slug="curated-collection" description="Thoughtfully chosen pieces, designed for modern homes." flag="isCurated" />
}
