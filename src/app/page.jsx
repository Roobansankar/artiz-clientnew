import { BundleBuilder, DiningBanner, FeaturedCollection, TabbedCollection } from '../sections/Commerce'
import { BeforeAfter, Blog, Faq, Lookbook, Marquee, Promotions, RoomStories, TrustedBy, VideoHero } from '../sections/Story'
import { CuratedCollections, Hero, ImageCollage, ShopByCategory } from '../sections/Top'
import { catalogData } from '../lib/server-catalog'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let featuredProducts = []
  let curatedProducts = []
  let collectionProducts = []
  let categories = []
  let collectionError = false
  {
    const results = await Promise.allSettled([
      catalogData('products', 'flag=isFeatured&pageSize=4'),
      catalogData('products', 'flag=isCurated&pageSize=8'),
      catalogData('products', 'category=furniture&pageSize=8'),
      catalogData('categories'),
    ])
    const [featured, curated, collection, categoryData] = results
    if (featured.status === 'fulfilled') featuredProducts = featured.value.products
    if (curated.status === 'fulfilled') curatedProducts = curated.value.products
    if (collection.status === 'fulfilled') collectionProducts = collection.value.products
    if (categoryData.status === 'fulfilled') categories = categoryData.value.categories
    collectionError = collection.status === 'rejected' || categoryData.status === 'rejected'
    for (const result of results) if (result.status === 'rejected') console.error('Could not load homepage catalog:', result.reason.message)
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
