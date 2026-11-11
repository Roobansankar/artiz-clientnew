'use client'

import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { Autoplay, EffectFade, FreeMode, Mousewheel, Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Rail, RailArrows, RailBar, useScrollRail } from '../components/ScrollRail'
import { ArrowBtn, Reveal, SectionHeading, ViewAll } from '../components/ui'
import Image from '../components/ProductImage'
import Link from 'next/link'
import { useCategories } from '../components/useCategories'

export function Hero({ slides = [] }) {
  if (!slides.length) return null
  return (
    <section className="relative bg-cream" aria-label="Featured collections">
      <Swiper
        key={slides.map(slide => `${slide.id}:${slide.updatedAt}`).join('|')}
        className="hero-swiper"
        modules={[EffectFade, Autoplay, Pagination, Navigation]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={700}
        loop={slides.length > 1}
        autoplay={slides.length > 1 ? { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true } : false}
        pagination={slides.length > 1 ? { clickable: true, el: '.hero-pagination' } : false}
        navigation={slides.length > 1 ? { nextEl: '.hero-next', prevEl: '.hero-prev' } : false}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-[440px] overflow-hidden md:h-[420px] lg:h-[460px] xl:h-[500px]">
              <Image src={slide.image} alt={slide.alt || slide.name} fill sizes="100vw" preload={index === 0} className={slide.imageFit === 'contain' ? 'object-contain' : 'object-cover'} />
              {slide.mode === 'image' ? slide.buttonHref && <Link href={slide.buttonHref} className="absolute inset-0" aria-label={slide.alt || slide.name} /> : <div className={`container-x absolute inset-0 flex items-center ${slide.alignment === 'left' ? 'justify-start' : slide.alignment === 'right' ? 'justify-end' : 'justify-center'}`}>
                <div className={`max-w-2xl ${slide.alignment === 'left' ? 'text-left' : slide.alignment === 'right' ? 'text-right' : 'text-center'} ${slide.textTone === 'light' ? 'text-white' : 'text-ink'}`}>
                  <h2 className={`${index ? 'slide-anim d1' : ''} font-heading text-[40px] font-semibold leading-[1.1] md:text-[64px] xl:text-[80px]`}>
                    {slide.titleBefore} <span className="text-terra">{slide.titleAccent}</span> {slide.titleAfter}
                  </h2>
                  {slide.description && <p className={`${index ? 'slide-anim d2' : ''} mt-5 max-w-md text-[16px] md:text-[18px] ${slide.alignment === 'center' ? 'mx-auto' : slide.alignment === 'right' ? 'ml-auto' : ''} ${slide.textTone === 'light' ? 'text-white/90' : 'text-muted'}`}>{slide.description}</p>}
                  {slide.buttonText && slide.buttonHref && <div className={`${index ? 'slide-anim d3' : ''} mt-8`}><Link href={slide.buttonHref} className={slide.textTone === 'light' ? 'btn-light' : 'btn-dark'}>{slide.buttonText}<ArrowRight size={16} /></Link></div>}
                </div>
              </div>}
            </div>
          </SwiperSlide>
        ))}
        {slides.length > 1 && <>
          <div className="hero-pagination absolute bottom-6 left-0 right-0 z-10 flex justify-center gap-2" />
          <button className="hero-prev nav-circle absolute left-6 top-1/2 z-10 -translate-y-1/2 max-md:hidden!" aria-label="Previous slide"><ArrowLeft size={18} /></button>
          <button className="hero-next nav-circle absolute right-6 top-1/2 z-10 -translate-y-1/2 max-md:hidden!" aria-label="Next slide"><ArrowRight size={18} /></button>
        </>}
      </Swiper>
    </section>
  )
}

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

function CollageItem({ img, title, sub, cta, big, className = '' }) {
  return (
    <a href="#" className={`group relative block overflow-hidden rounded-2xl ${className}`}>
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
          <Reveal><CollageItem img="/images/banner1.png" title="Modern Accent Stool for Corners" cta="Shop Dining" className="aspect-[418/220]" /></Reveal>
          <Reveal delay={0.1}><CollageItem img="/images/banner4.png" sub="Up to 25% Off" title="Contemporary Sofa" cta="Shop Living Room" className="aspect-[418/220]" /></Reveal>
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
        <SectionHeading sub="Browse" title="Find Your Perfect Piece" right={<ViewAll href="/shop" />} />
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
