'use client'

import { ArrowRight } from 'lucide-react'
import { Autoplay, FreeMode, Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Rail, RailArrows, RailBar, useScrollRail } from '../components/ScrollRail'
import { ArrowBtn, Reveal, SectionHeading, ViewAll } from '../components/ui'
import Link from 'next/link'
import { useCategories } from '../components/useCategories'

export { default as Hero } from '../components/HomeHero'

export function CuratedCollections() {
  const { rail, state, prev, next } = useScrollRail()
  const { categories, error, refresh } = useCategories()
  const featuredCategories = categories.filter(category => category.kind === 'category' && category.showOnHome &&
    categories.some(parent => parent.slug === category.parentSlug && !parent.parentSlug))
  return (
    <section className="section-py">
      <div className="container-x">
        <SectionHeading sub="Curated for you" title="Smart Living Solutions" right={<div className="hidden md:block"><RailArrows prev={prev} next={next} state={state} /></div>} />
        {error && <button onClick={refresh} className="btn-outline mb-6">Retry loading categories</button>}
        <Reveal>
          <Rail rail={rail}>
            {featuredCategories.map(category => (
              <Link key={category.slug} href={`/shop/${category.slug}`} draggable={false} className="group block w-[calc((100%-24px)/1.5)] shrink-0 snap-start sm:w-[calc((100%-48px)/2.5)] lg:w-[calc((100%-72px)/4)] xl:w-[calc((100%-96px)/5)]">
                <div className="overflow-hidden rounded-2xl bg-sand">
                  <img src={categoryPhoto(category, categories)} alt={category.name} loading="lazy" draggable={false} className="aspect-[310/387] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <h3 className="mt-4 text-center text-[17px] font-medium transition-colors group-hover:text-terra">{category.name}</h3>
              </Link>
            ))}
          </Rail>
          <RailBar rail={rail} state={state} />
        </Reveal>
      </div>
    </section>
  )
}

const collageTiles = [
  { img: '/images/banner4.png', sub: 'Up to 25% Off', title: 'Chairs', cta: 'Shop Chairs', href: '/shop/chairs' },
  { img: '/images/banner2.png', sub: 'Storage', title: 'Refresh Your Space', cta: 'Shop Storage', href: '/shop/storage-cabinets' },
  { img: '/images/banner5.png', sub: 'Up to 35% Off', title: 'Organize in Style', cta: 'Shop Decor', href: '/shop/decor-storage' },
]

export function ImageCollage() {
  return (
    <section className="pb-[60px] lg:pb-[90px]" aria-label="Featured collections">
      <div className="container-x space-y-5">
        {/* Wide feature banner */}
        <Reveal>
          <Link href="/shop/living-room" className="group relative block h-[420px] overflow-hidden rounded-2xl bg-sand md:h-[400px] lg:h-[440px]">
            <div className="absolute inset-0">
              <img src="/images/banner3.png" alt="Blush storage cabinet with ceramic vases in a warm ivory living room" className="absolute inset-0 h-full w-full object-cover object-right transition-transform duration-700 group-hover:scale-[1.03]" />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(52,39,31,0.88)_0%,rgba(52,39,31,0.35)_55%,transparent_100%)] md:bg-[linear-gradient(90deg,rgba(52,39,31,0.88)_0%,rgba(52,39,31,0.6)_35%,transparent_75%)]" />
            <div className="relative flex h-full items-end p-7 text-cream md:items-center md:px-10 lg:px-14">
              <div className="max-w-lg">
                <span className="subtitle text-[#edbea6]!">The Living Room Edit</span>
                <h2 className="font-heading text-[32px] font-semibold leading-[1.1] md:text-[46px] lg:text-[54px]">Where Calm Meets <span className="text-[#edbea6]">Comfort.</span></h2>
                <p className="mt-4 max-w-sm text-cream/90 md:text-[17px]">Bring warmth to every corner of your home.</p>
                <span className="btn-light mt-7 group-hover:bg-[#edbea6]">Explore Collection <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" /></span>
              </div>
            </div>
          </Link>
        </Reveal>

        {/* Three photo tiles */}
        <div className="grid gap-5 md:grid-cols-3">
          {collageTiles.map((tile, i) => (
            <Reveal key={tile.href} delay={0.1 * (i + 1)}>
              <Link href={tile.href} className="group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-sand transition-shadow duration-300 hover:shadow-lg md:aspect-[5/4] lg:aspect-[4/3]">
                <div className="absolute inset-0">
                  <img src={tile.img} alt={tile.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(52,39,31,0.9)_0%,rgba(52,39,31,0.5)_35%,transparent_75%)]" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-cream lg:p-6">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#edbea6]">{tile.sub}</span>
                  <h3 className="mt-1 text-[22px] leading-snug lg:text-[24px]">{tile.title}</h3>
                  <span className="btn-light mt-4 px-5 py-2.5 text-sm group-hover:bg-[#edbea6]">
                    {tile.cta} <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function categoryPhoto(category, categories) {
  const seen = new Set()
  let current = category
  while (current && !seen.has(current.slug)) {
    if (current.image) return current.image
    seen.add(current.slug)
    current = categories.find(item => item.slug === current.parentSlug)
  }
  return '/images/categories/decor.jpg'
}

export function ShopByCategory() {
  const { categories, error, refresh } = useCategories()
  const subcategories = categories.filter(category => {
    if (category.kind !== 'category' || !category.showOnHome) return false
    const parent = categories.find(item => item.slug === category.parentSlug)
    return parent?.parentSlug && categories.some(main => main.slug === parent.parentSlug && !main.parentSlug)
  })
  return (
    <section id="shop-by-category" className="pb-[60px] lg:pb-[90px]">
      <div className="container-x">
        <SectionHeading sub="Browse" title="Find Your Perfect Piece" right={<ViewAll variant="button" href="/shop" />} />
        {error && <button onClick={refresh} className="btn-outline mb-6">Retry loading subcategories</button>}
        <Swiper
          modules={[Autoplay, Mousewheel, FreeMode]}
          mousewheel={{ forceToAxis: true, releaseOnEdges: true, sensitivity: 1 }}
          freeMode={{ enabled: true, momentum: true }}
          spaceBetween={24}
          slidesPerView={2.4}
          rewind
          breakpoints={{ 640: { slidesPerView: 4 }, 1024: { slidesPerView: 6 }, 1280: { slidesPerView: 7 } }}>
          {subcategories.map(category => (
            <SwiperSlide key={category.slug}>
            <Link href={`/shop/${category.slug}`} className="group block min-w-0 text-center">
              <div className="mx-auto aspect-square max-w-[180px] overflow-hidden rounded-full border border-sand bg-[#f6f0ec] transition-all duration-300 group-hover:border-terra group-hover:shadow-lg">
                <img src={categoryPhoto(category, categories)} alt={category.name} loading="lazy" className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105" />
              </div>
              <h3 className="mt-4 text-base font-medium group-hover:text-terra">{category.name}</h3>
            </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}
