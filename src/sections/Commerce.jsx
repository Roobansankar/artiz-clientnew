'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Phone, Plus } from 'lucide-react'
import { useState } from 'react'
import { Autoplay, EffectFade } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { ArrowBtn, Price, ProductCard, Reveal, SectionHeading, ViewAll } from '../components/ui'
import { featuredSlides, money, products, tabs } from '../data'
import { useStore } from '../store'

export function FeaturedCollection() {
  return (
    <section className="pb-[60px] lg:pb-[90px]">
      <div className="container-x">
        <SectionHeading sub="Curated Selection" title="Designed for Modern Homes" right={<ViewAll />} />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
          <Reveal>
            <a href="#" className="group relative block h-full min-h-[460px] overflow-hidden rounded-2xl">
              <img src="/images/banner6.png" alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                <span className="mb-2 text-sm text-white/85">Living Room Refresh</span>
                <h3 className="text-[28px] leading-tight">Up to 30% Off on Sofas & Tables</h3>
                <span className="mt-6"><span className="btn-light">Shop Collection</span></span>
              </div>
            </a>
          </Reveal>
          <Reveal delay={0.1} className="min-w-0">
            <Swiper modules={[Autoplay]} spaceBetween={24} slidesPerView={1.3} autoplay={{ delay: 4000, disableOnInteraction: true, pauseOnMouseEnter: true }} breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}>
              {products.slice(0, 8).map((p) => (
                <SwiperSlide key={p.id}><ProductCard p={p} /></SwiperSlide>
              ))}
            </Swiper>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export function DiningBanner() {
  return (
    <section className="relative overflow-hidden">
      <motion.img
        src="/images/banner7.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ scale: 1.15 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2.5, ease: 'easeOut' }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-transparent" />
      <div className="container-x relative flex min-h-[420px] items-center py-16 md:min-h-[560px]">
        <Reveal className="max-w-lg text-white">
          <span className="mb-3 block font-medium text-white/85">New Dining Collection</span>
          <h2 className="font-heading text-[36px] font-semibold leading-[1.1] md:text-[56px]">Where Comfort Meets Craft</h2>
          <p className="mt-4 text-lg">From <span className="font-semibold">USD $799</span></p>
          <div className="mt-8"><ArrowBtn className="btn-light">Shop Now</ArrowBtn></div>
        </Reveal>
      </div>
    </section>
  )
}

export function CompareProducts() {
  const { addToCart } = useStore()
  const items = [products[0], products[3], products[2]]
  const rows = [
    ['Brand', () => 'Furniture'],
    ['Availability', () => <span className="inline-flex items-center gap-1 text-emerald-700"><Check size={14} /> In Stock</span>],
    ['Type', () => 'Furniture Products'],
    ['Available Options', (p) => p.colors.join(', ')],
    ['Rating', () => '—'],
  ]
  return (
    <section className="section-py">
      <div className="container-x">
        <SectionHeading align="center" sub="Compare" title="Find Your Ideal Style" desc="Side-by-side comparisons to find your perfect match." />
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.12}>
              <div className="group rounded-2xl bg-white p-6 transition-shadow duration-500 hover:shadow-[0_20px_50px_rgba(31,27,22,0.08)]">
                <div className="relative overflow-hidden rounded-xl bg-cream">
                  <img src={p.img} alt={p.title} className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <button onClick={() => addToCart(p)} className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-medium shadow transition-colors hover:bg-terra hover:text-white cursor-pointer">
                    <Plus size={14} /> Quick Add
                  </button>
                </div>
                <h3 className="mt-5 text-[18px]">{p.title}</h3>
                <Price price={p.price} compare={p.compare} className="mt-1" />
                <dl className="mt-5 divide-y divide-sand border-y border-sand text-sm">
                  {rows.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 py-3">
                      <dt className="text-muted">{k}</dt>
                      <dd className="text-right font-medium">{v(p)}</dd>
                    </div>
                  ))}
                </dl>
                <button onClick={() => addToCart(p)} className="btn-dark mt-6 w-full">Buy Now</button>
                <p className="mt-4 flex items-center justify-center gap-2 text-sm text-muted">
                  <Phone size={14} /> Need help? <a href="tel:+18000000000" className="font-medium text-ink hover:text-terra">+1 800 000 0000</a>
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function FeaturedSlides() {
  const [active, setActive] = useState(0)
  const [swiper, setSwiper] = useState(null)
  return (
    <section className="pb-[60px] lg:pb-[90px]">
      <div className="container-x">
        <Reveal>
          <div className="grid overflow-hidden rounded-3xl bg-peach lg:grid-cols-2">
            <Swiper
              modules={[EffectFade, Autoplay]}
              effect="fade"
              speed={900}
              loop
              autoplay={{ delay: 5000 }}
            onSwiper={setSwiper}
              onSlideChange={(sw) => setActive(sw.realIndex)}
              className="hero-swiper h-full w-full"
            >
              {featuredSlides.map((s) => (
                <SwiperSlide key={s.title}>
                  <div className="slide-media h-full overflow-hidden"><img src={s.img} alt="" className="aspect-[766/560] h-full w-full object-cover" /></div>
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="flex flex-col justify-center p-8 md:p-14">
              <AnimatePresence mode="wait">
                <motion.div key={active} initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={{ duration: 0.5 }}>
                  <span className="subtitle uppercase tracking-wider">{featuredSlides[active].sub}</span>
                  <h2 className="h2-title">{featuredSlides[active].title}</h2>
                  <p className="mt-4 text-muted">{featuredSlides[active].desc}</p>
                  <div className="mt-8"><ArrowBtn /></div>
                </motion.div>
              </AnimatePresence>
              <div className="mt-10 flex items-center justify-between gap-4">
                <div className="flex gap-5 text-sm">
                  {featuredSlides.map((s, i) => (
                    <button key={s.tag} onClick={() => swiper?.slideToLoop(i)} className={`relative cursor-pointer pb-1 transition-colors hover:text-terra ${i === active ? 'text-ink' : 'text-muted'}`}>
                      {s.tag}
                      <span className={`absolute bottom-0 left-0 h-px bg-terra transition-all duration-500 ${i === active ? 'w-full' : 'w-0'}`} />
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => swiper?.slidePrev()} className="nav-circle" aria-label="Previous"><ArrowLeft size={18} /></button>
                  <button onClick={() => swiper?.slideNext()} className="nav-circle" aria-label="Next"><ArrowRight size={18} /></button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export function BundleBuilder() {
  const { addToCart } = useStore()
  const [picked, setPicked] = useState([])
  const items = products.slice(0, 4)
  const toggle = (id) => setPicked((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const chosen = items.filter((p) => picked.includes(p.id))
  const total = chosen.reduce((n, p) => n + p.price, 0)
  const need = Math.max(0, 2 - chosen.length)

  return (
    <section className="section-py bg-white">
      <div className="container-x">
        <SectionHeading sub="Build Your Bundle" title="Build your space." />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {items.map((p, i) => {
              const on = picked.includes(p.id)
              return (
                <Reveal key={p.id} delay={i * 0.08}>
                  <div className={`rounded-2xl border-2 p-2 transition-colors ${on ? 'border-terra' : 'border-transparent'}`}>
                    <ProductCard p={p} />
                    <button onClick={() => toggle(p.id)} className={`mt-4 w-full rounded-full py-2.5 text-sm font-medium transition-colors cursor-pointer ${on ? 'bg-terra text-white' : 'border border-ink hover:bg-ink hover:text-white'}`}>
                      {on ? 'Selected' : 'Select Option'}
                    </button>
                  </div>
                </Reveal>
              )
            })}
          </div>
          <Reveal delay={0.2}>
            <aside className="sticky top-28 rounded-2xl bg-cream p-6">
              <h3 className="text-xl">Your bundle</h3>
              <ul className="mt-4 min-h-[120px] space-y-3">
                <AnimatePresence>
                  {chosen.map((p) => (
                    <motion.li key={p.id} layout initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="flex items-center gap-3">
                      <img src={p.img} alt="" className="h-12 w-12 rounded-lg bg-white object-contain" />
                      <span className="flex-1 text-sm">{p.title}</span>
                      <span className="text-sm font-medium">{money(p.price)}</span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
              {need > 0 && <p className="text-sm text-muted">Select {need} more item{need > 1 ? 's' : ''} to create bundle</p>}
              <div className="mt-4 flex justify-between border-t border-sand pt-4 font-semibold">
                <span>Total</span><span>{money(total)}</span>
              </div>
              <button disabled={need > 0} onClick={() => chosen.forEach((p) => addToCart(p))} className="btn-dark mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50">
                Add Bundle to Cart
              </button>
            </aside>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export function TabbedCollection() {
  const [tab, setTab] = useState('All')
  const list = (tab === 'All' ? products : products.filter((p) => p.cat === tab)).slice(0, 8)
  return (
    <section className="section-py">
      <div className="container-x">
        <SectionHeading align="center" sub="The Collection" title="Handpicked, Every One." />
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`relative rounded-full px-5 py-2 text-sm font-medium transition-colors cursor-pointer ${tab === t ? 'text-white' : 'hover:text-terra'}`}>
              {tab === t && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-full bg-espresso" transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />}
              <span className="relative">{t}</span>
            </button>
          ))}
        </div>
        <motion.div layout className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {list.map((p, i) => (
              <motion.div key={p.id} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }} exit={{ opacity: 0, scale: 0.95 }}>
                <ProductCard p={p} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
