'use client'

import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Autoplay, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Rail, RailArrows, useScrollRail } from '../components/ScrollRail'
import { ProductCard, Reveal } from '../components/ui'
import { money, products } from '../data'
import { HOME_URL, SHOP_URL } from '../routes'
import ShopGrid from '../sections/ShopGrid'
import { shopProducts } from '../shopData'

const collections = [
  { title: 'Armchairs', img: '/images/shop/shop1.png' },
  { title: 'Lighting', img: '/images/shop/shop2.png' },
  { title: 'Smart Dining', img: '/images/shop/shop3.png' },
  { title: 'Warm Wood Storage', img: '/images/shop/shop4.png' },
  { title: 'Tables', img: '/images/shop/shop5.png' },
  { title: 'Lighting', img: '/images/shop/shop2.png' },
]

const banners = [
  { img: '/images/shop/shop-banner1.png', mobile: '/images/shop/shop-banner1-mobile.png', sub: 'The Living Capsule', pre: 'Elevate Your', accent: 'Everyday', desc: 'Bouclé, oiled oak and a low, easy silhouette for the room.' },
  { img: '/images/shop/shop-banner2.png', mobile: '/images/shop/shop-banner2-mobile.png', sub: 'The Workroom', pre: 'Built to Be', accent: 'Kept', desc: 'Solid timber desks and storage, finished by hand and made.' },
]

const reviews = [
  { name: 'Amara Whitfield', role: 'Developer', avatar: '/images/shop/Ellipse_1034.png', text: 'Excellent furniture quality, stylish design, and comfortable finishing. The product exceeded my expectations', product: 'Fabric Lounge Chair' },
  { name: 'Daniel Kovač', role: 'Architect · Rotterdam', avatar: '/images/shop/team1.webp', text: 'The furniture is beautifully crafted, highly comfortable, and durable. Its premium quality and elegant', product: 'Comfort Sofa Set' },
  { name: 'Priya Nandakumar', role: 'Homeowner · Bristol', avatar: '/images/shop/testimonial-thumb3.webp', text: 'The design is modern and impressive, with excellent finishing and comfort. I am completely satisfied', product: 'Leather Recliner Chair' },
  { name: 'Daniel Kovač', role: 'Architect · Rotterdam', avatar: '/images/shop/team1.webp', text: 'The furniture is beautifully crafted, highly comfortable, and durable. Its premium quality and elegant', product: 'Vrawer bedside table' },
]

const byTitle = (t) => shopProducts.find((p) => p.title === t)
const latest = ['Comfort Sofa Set', 'Fabric Lounge Chair', 'Leather Recliner Chair', 'Round Sculptural Table', 'Nickel Floor Lamp', 'Green Pillow Covers', 'Living Room Sofa', 'Ceramic table lamp', 'Arquette Shoe Cabinet'].map(byTitle).filter(Boolean)

function PageBanner({ title = 'Products', description = '' }) {
  return (
    <section className="border-b border-sand bg-gradient-to-r from-peach/50 via-cream to-cream">
      <div className="container-x py-8 md:py-10">
        <Reveal y={16}>
          <h1 className="font-heading text-[32px] font-semibold leading-tight tracking-tight text-ink md:text-[42px]">{title}</h1>
          <nav aria-label="Breadcrumb" className="mt-3 flex items-center gap-2 text-[13px]">
            <Link href={HOME_URL} className="text-muted transition-colors hover:text-terra">Home</Link>
            <span aria-hidden="true" className="text-muted/50">/</span>
            <span aria-current="page" className="font-medium text-terra">{title}</span>
          </nav>
          {description && <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted md:text-[15px]">{description}</p>}
        </Reveal>
      </div>
    </section>
  )
}

function ShopByCollection({ items = collections, category = false }) {
  const { rail, state, prev, next } = useScrollRail()
  return (
    <section className="border-b border-ink/10 bg-white py-[60px] lg:py-[80px]">
      <div className="container-x">
        <Reveal className="mb-10 flex items-end justify-between gap-6">
          <div>
            <h2 className="text-[26px] md:text-[32px]">{category ? 'Shop by category' : 'Shop by collection'}</h2>
            <p className="mt-2 text-muted">{category ? 'Explore the collection by category.' : 'Five rooms, one material language.'}</p>
          </div>
          <RailArrows prev={prev} next={next} state={state} />
        </Reveal>
        <Reveal>
          <Rail rail={rail} className="gap-5">
            {items.map((c, i) => (
              <Link key={c.href || i} href={c.href || SHOP_URL} draggable={false} className="group block w-[calc((100%-20px)/1.5)] shrink-0 snap-start sm:w-[calc((100%-40px)/3)] lg:w-[calc((100%-80px)/5)]">
                <div className="overflow-hidden rounded-lg">
                  <img src={c.img} alt={c.title} draggable={false} className="aspect-[328/250] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <h3 className="mt-4 text-[18px] transition-colors group-hover:text-terra">{c.title}</h3>
                <p className="text-sm text-muted">{c.count == null ? '12 Items' : `${c.count} ${c.count === 1 ? 'product' : 'products'}`}</p>
              </Link>
            ))}
          </Rail>
        </Reveal>
      </div>
    </section>
  )
}

function NewArrivals() {
  return (
    <section className="border-t border-ink/10 bg-white py-[60px] lg:py-[90px]">
      <div className="container-x">
        <Reveal className="mb-12 text-center">
          <span className="text-sm font-medium">Just landed</span>
          <h2 className="mt-2 text-[28px] md:text-[36px]">New Arrivals</h2>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-2">
          {banners.map((b, i) => (
            <Reveal key={b.sub} delay={i * 0.12}>
              <Link href={SHOP_URL} className="group relative block overflow-hidden rounded-xl">
                <picture>
                  <source media="(min-width: 768px)" srcSet={b.img} />
                  <img src={b.mobile} alt="" className="aspect-[750/550] w-full object-cover transition-transform duration-700 group-hover:scale-105 md:aspect-[727/338]" />
                </picture>
                <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-8 lg:p-10">
                  <span className="text-sm tracking-wide">{b.sub}</span>
                  <h3 className="mt-3 max-w-[60%] text-[24px] leading-tight md:text-[28px]">{b.pre} <span className="text-terra">{b.accent}</span></h3>
                  <p className="mt-3 max-w-[55%] text-sm text-ink/80">{b.desc}</p>
                  <span className="mt-6 inline-flex w-fit items-center gap-1 rounded-md bg-terra px-5 py-3 text-sm font-medium text-white transition-colors group-hover:bg-espresso">
                    Shop Now <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
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

function LatestNine() {
  const [swiper, setSwiper] = useState(null)
  return (
    <section className="bg-white pb-[60px] lg:pb-[90px]">
      <div className="container-x">
        <Reveal>
          <div className="rounded-xl border border-ink/10 bg-cream">
            <div className="flex items-center justify-between border-b border-ink/10 bg-white px-5 py-4 rounded-t-xl">
              <h2 className="text-[18px]">The latest nine</h2>
              <div className="flex gap-2">
                <button onClick={() => swiper?.slidePrev()} aria-label="Previous" className="grid h-8 w-8 place-items-center rounded-full border border-ink/15 bg-white transition-colors hover:bg-terra hover:text-white cursor-pointer"><ChevronLeft size={15} /></button>
                <button onClick={() => swiper?.slideNext()} aria-label="Next" className="grid h-8 w-8 place-items-center rounded-full border border-ink/15 bg-white transition-colors hover:bg-terra hover:text-white cursor-pointer"><ChevronRight size={15} /></button>
              </div>
            </div>
            <div className="p-4 md:p-5">
              <Swiper modules={[Autoplay, Pagination]} onSwiper={setSwiper} spaceBetween={16} slidesPerView={1.1} slidesPerGroup={1}
                autoplay={{ delay: 4000, disableOnInteraction: true, pauseOnMouseEnter: true }}
                pagination={{ clickable: true, el: '.latest-dots' }}
                breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3, slidesPerGroup: 1 } }}>
                {latest.map((p) => (
                  <SwiperSlide key={p.id}>
                    <a href="#" onClick={(e) => e.preventDefault()} className="group flex items-center gap-4 rounded-lg border border-ink/10 bg-white p-3">
                      <img src={p.img} alt="" className="h-16 w-16 shrink-0 rounded-md bg-cream object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wider text-muted">{p.vendor}</p>
                        <p className="truncate font-heading text-[15px] font-semibold transition-colors group-hover:text-terra">{p.title}</p>
                        <p className="mt-0.5 text-sm">
                          <span className="font-semibold text-terra">{money(p.price)}</span>
                          {p.compare > 0 && <s className="ml-2 text-muted">{money(p.compare)}</s>}
                        </p>
                      </div>
                    </a>
                  </SwiperSlide>
                ))}
              </Swiper>
              <div className="latest-dots mt-4 flex justify-center gap-1.5 [&_.swiper-pagination-bullet]:m-0! [&_.swiper-pagination-bullet]:h-1.5 [&_.swiper-pagination-bullet]:w-1.5 [&_.swiper-pagination-bullet]:bg-ink/25 [&_.swiper-pagination-bullet]:opacity-100 [&_.swiper-pagination-bullet]:transition-all [&_.swiper-pagination-bullet-active]:w-4 [&_.swiper-pagination-bullet-active]:rounded [&_.swiper-pagination-bullet-active]:bg-terra" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function YouMayAlsoLike() {
  const { rail, state, prev, next } = useScrollRail()
  return (
    <section className="border-y border-ink/10 bg-cream py-[60px] lg:py-[90px]">
      <div className="container-x">
        <Reveal className="mb-10 flex items-end justify-center gap-6 md:justify-between">
          <h2 className="text-center text-[28px] md:text-[36px]">You may also like</h2>
          <div className="hidden md:block"><RailArrows prev={prev} next={next} state={state} /></div>
        </Reveal>
        <Rail rail={rail}>
          {products.slice(0, 8).map((p) => (
            <div key={p.id} className="w-[calc((100%-24px)/1.4)] shrink-0 snap-start sm:w-[calc((100%-48px)/2.5)] lg:w-[calc((100%-72px)/4)]">
              <ProductCard p={p} />
            </div>
          ))}
        </Rail>
      </div>
    </section>
  )
}

function Feedback() {
  const { rail, state, prev, next } = useScrollRail()
  return (
    <section className="bg-white py-[60px] lg:py-[90px]">
      <div className="container-x">
        <Reveal className="mb-10 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-terra">4.8 average · 1,240 reviews</span>
          <h2 className="mt-2 text-[28px] md:text-[36px]">Feedback</h2>
        </Reveal>
        <Rail rail={rail}>
          {reviews.map((r, i) => {
            const item = byTitle(r.product)
            return (
              <article key={i} className="flex w-[calc((100%-24px)/1.1)] shrink-0 snap-start flex-col rounded-xl bg-white p-6 shadow-[0_4px_24px_rgba(31,27,22,0.07)] sm:w-[calc((100%-24px)/2)] lg:w-[calc((100%-48px)/3)]">
                <div className="flex items-center gap-3">
                  <img src={r.avatar} alt="" className="h-12 w-12 rounded-full border border-ink/10 object-cover" />
                  <div>
                    <p className="font-heading text-[17px] font-semibold">{r.name}</p>
                    <p className="text-xs text-muted">{r.role}</p>
                  </div>
                </div>
                <div className="mt-5 flex gap-1 text-[#f5b301]">{Array.from({ length: 5 }, (_, s) => <Star key={s} size={16} fill="currentColor" strokeWidth={0} />)}</div>
                <p className="mt-4 flex-1 text-[15px] leading-relaxed">{r.text}</p>
                {item && (
                  <div className="mt-5 flex items-center gap-3 border-t border-ink/10 pt-4">
                    <img src={item.img} alt="" className="h-10 w-10 rounded-full bg-cream object-cover" />
                    <div>
                      <p className="text-[11px] text-muted">{item.vendor}</p>
                      <p className="text-sm font-medium">{item.title}</p>
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </Rail>
        <div className="mt-8 flex justify-center md:hidden"><RailArrows prev={prev} next={next} state={state} /></div>
      </div>
    </section>
  )
}

function Promises() {
  const items = [
    ['Free Shipping', 'Tracked delivery on every order.'],
    ['Secure Payment', 'Visa, Mastercard, Amex, PayPal.'],
    ['24/7 Support', 'Real people, any hour you write.'],
    ['Easy Returns', 'Thirty days, collection included.'],
  ]
  return (
    <section className="border-b border-ink/10 bg-cream py-10">
      <div className="container-x grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(([t, d], i) => (
          <Reveal key={t} delay={i * 0.08}>
            <div className="h-full rounded-xl border border-ink/10 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-terra hover:shadow-lg">
              <h3 className="text-[17px]">{t}</h3>
              <p className="mt-2 text-sm text-muted">{d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Letter() {
  const [done, setDone] = useState(false)
  return (
    <section className="bg-cream py-[60px] lg:py-[80px]">
      <div className="container-x">
        <Reveal>
          <div className="rounded-2xl bg-white px-6 py-14 text-center md:py-16">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-terra">The Artiz letter</span>
            <h2 className="mt-3 text-[28px] md:text-[36px]">First look, every drop</h2>
            <p className="mx-auto mt-4 max-w-md text-muted">One considered email a month — new pieces, restocks and the occasional workshop note. No noise.</p>
            {done ? (
              <p className="mt-8 font-medium text-terra">Thanks — you're on the list.</p>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setDone(true) }} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
                <input type="email" required placeholder="you@example.com" aria-label="Enter your email" className="h-12 flex-1 rounded-md border border-ink/15 px-4 outline-none focus:border-terra" />
                <button className="h-12 rounded-md bg-terra px-6 font-medium text-white transition-colors hover:bg-espresso cursor-pointer">Subscribe</button>
              </form>
            )}
            <p className="mt-4 text-xs text-muted">By subscribing you agree to our privacy policy. Unsubscribe any time.</p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default function ShopPage({ category, collection, categoryCollections = [], categoryProducts, initialSort, remoteCatalog }) {
  const currentCollection = category || collection
  return (
    <>
      <PageBanner title={currentCollection?.name} description={currentCollection?.description} />
      {(!currentCollection || categoryCollections.length > 0) && <ShopByCollection items={currentCollection ? categoryCollections : collections} category={Boolean(currentCollection)} />}
      <ShopGrid key={currentCollection?.slug || 'all'} products={categoryProducts} catalogMode={Boolean(currentCollection) || Boolean(remoteCatalog)} currency={currentCollection || remoteCatalog ? 'INR' : 'USD'} initialSort={initialSort} remoteCatalog={remoteCatalog} />
      {!collection && <NewArrivals />}
      {!currentCollection && <><LatestNine /><YouMayAlsoLike /><Feedback /></>}
      <Promises />
      <Letter />
    </>
  )
}
