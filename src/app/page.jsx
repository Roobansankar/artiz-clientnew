import { BundleBuilder, DiningBanner, FeaturedCollection, FeaturedSlides, TabbedCollection } from '../sections/Commerce'
import { BeforeAfter, Blog, CountdownSale, Faq, Lookbook, Marquee, Promotions, RoomStories, TrustedBy, VideoHero } from '../sections/Story'
import { CuratedCollections, Hero, ImageCollage, ShopByCategory } from '../sections/Top'

export default function HomePage() {
  return (
    <>
      <Hero />
      <CuratedCollections />
      <ImageCollage />
      <ShopByCategory />
      <FeaturedCollection />
      <DiningBanner />
      <FeaturedSlides />
      <BundleBuilder />
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
