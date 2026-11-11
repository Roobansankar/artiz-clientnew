import { BundleBuilder, DiningBanner, FeaturedCollection, TabbedCollection } from '../sections/Commerce'
import { BeforeAfter, Blog, Faq, Lookbook, Marquee, Promotions, RoomStories, TrustedBy, VideoHero } from '../sections/Story'
import { CuratedCollections, Hero, ImageCollage, ShopByCategory } from '../sections/Top'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let featuredProducts = []
  let curatedProducts = []
  let collectionProducts = []
  let categories = []
  let collectionError = false
  try {
    const base = process.env.API_BASE_URL || 'http://127.0.0.1:5000'
    const response = await fetch(`${base}/api/products`, { cache: 'no-store', signal: AbortSignal.timeout(10000) })
    if (!response.ok) throw new Error('Featured products are temporarily unavailable')
    const { products } = await response.json()
    collectionProducts = products.filter(product => product.published !== false)
    featuredProducts = products.filter(product => product.published !== false && product.isFeatured).slice(0, 4)
    curatedProducts = products.filter(product => product.published !== false && product.isCurated).slice(0, 8)
  } catch (error) {
    collectionError = true
    console.error('Could not load featured products:', error.message)
  }
  try {
    const base = process.env.API_BASE_URL || 'http://127.0.0.1:5000'
    const response = await fetch(`${base}/api/categories`, { cache: 'no-store', signal: AbortSignal.timeout(10000) })
    if (!response.ok) throw new Error('Categories are temporarily unavailable')
    categories = (await response.json()).categories
  } catch (error) {
    collectionError = true
    console.error('Could not load collection categories:', error.message)
  }
  return (
    <>
      <Hero />
      <CuratedCollections />
      <ImageCollage />
      <ShopByCategory />
      <FeaturedCollection products={curatedProducts} />
      <DiningBanner />
      <BundleBuilder products={featuredProducts} />
      <TabbedCollection products={collectionProducts} categories={categories} loadError={collectionError} />
      <Lookbook />
      <TrustedBy />
      <Marquee />
      <VideoHero />
      <RoomStories />
      <BeforeAfter />
      <Faq />
      <Blog />
      <Promotions />
    </>
  )
}
