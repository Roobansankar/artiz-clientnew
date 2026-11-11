'use client'

import { ArrowUpRight } from 'lucide-react'
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
        <SectionHeading sub="Curated for you" title="Smart Living Solutions" right={<RailArrows prev={prev} next={next} state={state} />} />
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

function CollageItem({ img, title, sub, cta, big, href = '#', className = '' }) {
  return (
    <a href={href} className={`group relative block overflow-hidden rounded-2xl ${className}`}>
      <img src={img} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
      <div className={`absolute inset-0 flex flex-col justify-center p-6 text-white md:p-8 ${big ? 'items-start' : 'items-start'}`}>
        {sub && <span className="mb-2 text-sm font-medium text-white/85">{sub}</span>}
        <h3 className={big ? 'font-heading text-[30px] leading-tight md:text-[40px]' : 'max-w-[60%] text-[20px] leading-snug md:text-[22px]'}>{title}</h3>
        {big && <p className="mt-3 max-w-xs text-white/85">Bring warmth to every corner of your home.</p>}
        <span className={`mt-5 inline-flex items-center gap-2 ${big ? 'btn-light' : 'border-b border-white pb-0.5 text-sm font-medium'}`}>
          {cta} <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:rotate-45" />
        </span>
      </div>
    </a>
  )
}

export function ImageCollage() {
  return (
    <section className="pb-[60px] lg:pb-[90px]">
      <div className="container-x grid gap-5 lg:grid-cols-[1fr_1.4fr_1fr]">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
          <Reveal><CollageItem img="/images/banner1.png" title="Modern Accent Stool for Corners" cta="Shop Sofas" href="/shop/sofas" className="aspect-[418/220]" /></Reveal>
          <Reveal delay={0.1}><CollageItem img="/images/banner4.png" sub="Up to 25% Off" title="Chairs" cta="Shop Chairs" href="/shop/chairs" className="aspect-[418/220]" /></Reveal>
        </div>
        <Reveal delay={0.15} className="h-full">
          <CollageItem big img="/images/banner3.png" title={<>Where Calm Meets<br />Comfort.</>} cta="Explore Collection" className="h-full min-h-[380px]" />
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
          <Reveal delay={0.2}><CollageItem img="/images/banner2.png" title="Refresh Your Space with Storage Designs" cta="Shop Now" className="aspect-[418/220]" /></Reveal>
          <Reveal delay={0.3}><CollageItem img="/images/banner5.png" sub="Up to 35% Off" title="Organize in Style" cta="Shop Now" className="aspect-[418/220]" /></Reveal>
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
