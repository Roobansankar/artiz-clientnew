import { BundleBuilder, DiningBanner, FeaturedCollection, TabbedCollection } from '../sections/Commerce'
import { BeforeAfter, Blog, CountdownSale, Faq, Lookbook, Marquee, Promotions, RoomStories, TrustedBy, VideoHero } from '../sections/Story'
import { CuratedCollections, Hero, ImageCollage, ShopByCategory } from '../sections/Top'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let featuredProducts = []
  try {
    const base = process.env.API_BASE_URL || 'http://127.0.0.1:5000'
    const response = await fetch(`${base}/api/products`, { cache: 'no-store', signal: AbortSignal.timeout(10000) })
    if (!response.ok) throw new Error('Featured products are temporarily unavailable')
    const { products } = await response.json()
    featuredProducts = products.filter(product => product.published !== false && product.isFeatured).slice(0, 4)
  } catch (error) {
    console.error('Could not load featured products:', error.message)
  }
  return (
    <>
      <Hero />
      <CuratedCollections />
      <ImageCollage />
      <ShopByCategory />
      <FeaturedCollection />
      <DiningBanner />
      <BundleBuilder products={featuredProducts} />
      <TabbedCollection />
      <CountdownSale />
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
