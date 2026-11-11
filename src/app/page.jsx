import { BundleBuilder, DiningBanner, FeaturedCollection, TabbedCollection } from '../sections/Commerce'
import { BeforeAfter, Faq, Lookbook, Marquee, Promotions, RoomStories, TrustedBy, VideoHero } from '../sections/Story'
import { CuratedCollections, Hero, ImageCollage, ShopByCategory } from '../sections/Top'
import { catalogData } from '../lib/server-catalog'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

async function HomeHero() {
  try {
    const { slides } = await catalogData('hero-slides')
    return <Hero slides={slides} />
  } catch (error) {
    console.error('Could not load home hero:', error.message)
    return null
  }
}

export default function HomePage() {
  return <>
    <Suspense fallback={<div aria-label="Loading featured collections" role="status" className="h-[440px] animate-pulse bg-cream md:h-[420px] lg:h-[460px] xl:h-[500px]" />}><HomeHero /></Suspense>
    <Suspense fallback={<div role="status" aria-label="Loading collections" className="container-x py-16"><div className="h-48 animate-pulse rounded-2xl bg-sand/40" /></div>}><HomeContent /></Suspense>
  </>
}

async function HomeContent() {
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
      <Promotions />
    </>
  )
}
