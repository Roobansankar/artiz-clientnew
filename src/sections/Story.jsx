'use client'

import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronsLeftRight, Minus, Play, Plus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Autoplay, EffectFade } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { ArrowBtn, Hotspot, Reveal, SectionHeading } from '../components/ui'
import { faqs, lookbook, marqueeWords, posts, products, promos, roomStories } from '../data'

const pad = (n) => String(n).padStart(2, '0')

// Starts from a fixed duration so server and client render the same markup
function useCountdown(duration) {
  const [left, setLeft] = useState(duration)
  useEffect(() => {
    const target = Date.now() + duration
    const t = setInterval(() => setLeft(Math.max(0, target - Date.now())), 1000)
    return () => clearInterval(t)
  }, [duration])
  const s = Math.floor(left / 1000)
  return { Days: Math.floor(s / 86400), Hrs: Math.floor((s % 86400) / 3600), Min: Math.floor((s % 3600) / 60), Sec: s % 60 }
}

export function CountdownSale() {
  const time = useCountdown(3 * 86400000 + 7 * 3600000)
  return (
    <section className="pb-[60px] lg:pb-[90px]">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-espresso px-6 py-14 text-center text-white md:py-20">
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-terra/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-terra/20 blur-3xl" />
            <span className="relative mb-3 block font-medium text-terra">This weekend only</span>
            <h2 className="relative h2-title">Hurry, Grab Yours Today!</h2>
            <p className="relative mx-auto mt-4 max-w-lg text-white/75">Enjoy 30% off on selected furniture — sofas, tables and more.</p>
            <div className="relative mt-10 flex justify-center gap-3 md:gap-5">
              {Object.entries(time).map(([label, v]) => (
                <div key={label} className="relative w-[72px] overflow-hidden rounded-2xl border border-white/15 bg-white/5 py-4 md:w-24">
                  <AnimatePresence mode="popLayout">
                    <motion.span key={v} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.35 }} className="block font-heading text-[28px] font-semibold md:text-[40px]">
                      {pad(v)}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-xs uppercase tracking-wider text-white/60">{label}</span>
                </div>
              ))}
            </div>
            <div className="relative mt-10"><ArrowBtn className="btn-terra">Shop Now</ArrowBtn></div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export function Lookbook() {
  const [swiper, setSwiper] = useState(null)
  return (
    <section className="pb-[60px] lg:pb-[90px]">
      <div className="container-x">
        <SectionHeading sub="SHOP THE LOOK" title="Furniture & Accessories for a Modern Interior" desc="Use our ideas to create an interior that suits you — browse styled rooms and shop the pieces inside." right={
          <div className="flex gap-3">
            <button onClick={() => swiper?.slidePrev()} className="nav-circle" aria-label="Previous"><ArrowLeft size={18} /></button>
            <button onClick={() => swiper?.slideNext()} className="nav-circle" aria-label="Next"><ArrowRight size={18} /></button>
          </div>
        } />
        <Reveal>
          <Swiper
            modules={[EffectFade]}
            effect="fade"
            speed={900}
            loop
            onSwiper={setSwiper}
            className="hero-swiper overflow-hidden rounded-3xl"
          >
            {lookbook.map((s, i) => (
              <SwiperSlide key={i}>
                <div className="grid bg-white lg:grid-cols-[1fr_2fr]">
                  <div className="flex flex-col justify-center p-8 md:p-12">
                    <span className="slide-anim d1 subtitle">{s.sub}</span>
                    <h3 className="slide-anim d1 font-heading text-[26px] leading-tight md:text-[34px]">{s.title}</h3>
                    <p className="slide-anim d2 mt-4 text-muted">{s.desc}</p>
                    <div className="slide-anim d3 mt-8"><ArrowBtn>Shop Now</ArrowBtn></div>
                  </div>
                  <div className="relative">
                    <div className="slide-media overflow-hidden"><img src={s.img} alt="" className="aspect-[1016/520] w-full object-cover" /></div>
                    {s.spots.map((sp, j) => <Hotspot key={j} x={sp.x} y={sp.y} product={products[sp.p]} />)}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </Reveal>
      </div>
    </section>
  )
}

export function TrustedBy() {
  const brands = ['NORDHAUS', 'Oakline', 'MAISON·K', 'Verde&Co', 'ATELIER 9', 'Linnea']
  return (
    <section className="pb-[50px]">
      <div className="container-x text-center">
        <Reveal>
          <span className="subtitle tracking-[0.2em]">TRUSTED BY</span>
          <h2 className="mx-auto max-w-2xl text-[22px] font-medium leading-snug md:text-[28px]">Partners feel the impact — that's why they choose us with confidence.</h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {brands.map((b, i) => (
            <Reveal key={b} delay={i * 0.06}>
              <div className="grid h-20 place-items-center rounded-xl border border-sand font-heading text-xl font-semibold tracking-wide text-muted/70 transition-colors duration-300 hover:border-terra hover:text-terra">{b}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

const Star = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" className="shrink-0 text-terra" fill="currentColor"><path d="M12 0c.6 6.5 5.5 11.4 12 12-6.5.6-11.4 5.5-12 12-.6-6.5-5.5-11.4-12-12C6.5 11.4 11.4 6.5 12 0Z" /></svg>
)

export function Marquee() {
  const row = [...marqueeWords, ...marqueeWords]
  return (
    <section className="overflow-hidden border-y border-sand py-[50px]">
      <div className="group flex w-max animate-marquee items-center gap-10 hover:[animation-play-state:paused]">
        {row.map((w, i) => (
          <div key={i} className="flex items-center gap-10">
            <span className={`font-heading text-[40px] font-semibold leading-none md:text-[64px] ${i % 2 ? 'text-stroke' : ''}`}>{w}</span>
            <Star />
          </div>
        ))}
      </div>
    </section>
  )
}

export function VideoHero() {
  const ref = useRef(null)
  const [open, setOpen] = useState(false)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.9, 1])
  const radius = useTransform(scrollYProgress, [0, 0.5], [40, 0])
  return (
    <section ref={ref} className="py-[60px] lg:py-[90px]">
      <motion.div style={{ scale, borderRadius: radius }} className="relative mx-auto min-h-[520px] overflow-hidden md:min-h-[680px]">
        <video src="/images/hero-video.mp4" autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/35" />
        <div className="container-x relative flex min-h-[520px] flex-col items-center justify-center text-center text-white md:min-h-[680px]">
          <button onClick={() => setOpen(true)} aria-label="Play video" className="mb-8 grid h-20 w-20 animate-pulse-ring place-items-center rounded-full bg-white text-espresso transition-transform hover:scale-110 cursor-pointer">
            <Play size={24} fill="currentColor" />
          </button>
          <Reveal>
            <h2 className="font-heading text-[36px] font-semibold leading-tight md:text-[60px]">Where Style Meets Comfort</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/85">Step into a space where design meets function — made for the way you live.</p>
            <div className="mt-8"><ArrowBtn className="btn-light">Shop Collection</ArrowBtn></div>
          </Reveal>
        </div>
      </motion.div>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[70] grid place-items-center bg-black/80 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            <button className="absolute right-6 top-6 text-white cursor-pointer" aria-label="Close video"><X size={28} /></button>
            <motion.video initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }} src="/images/hero-video.mp4" controls autoPlay className="max-h-[80vh] w-full max-w-5xl rounded-xl" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export function RoomStories() {
  return (
    <section className="pb-[60px] lg:pb-[90px]">
      <div className="container-x">
        <SectionHeading align="center" sub="Inspiration" title="Room Stories" />
        <div className="grid gap-6 md:grid-cols-3">
          {roomStories.map((r, i) => (
            <Reveal key={i} delay={i * 0.12}>
              <div className="group relative overflow-hidden rounded-2xl">
                <img src={r.img} alt="" className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                {r.spots.map((s, j) => <Hotspot key={j} x={s.x} y={s.y} product={products[s.p]} />)}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function BeforeAfter() {
  const [pos, setPos] = useState(50)
  const box = useRef(null)
  const dragging = useRef(false)
  const move = (clientX) => {
    const r = box.current.getBoundingClientRect()
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)))
  }
  return (
    <section className="pb-[60px] lg:pb-[90px]">
      <div className="container-x">
        <SectionHeading align="center" sub="Find your finish" title="One Sofa, Two Moods" desc="Drag to compare finishes on the same piece." />
        <Reveal>
          <div
            ref={box}
            className="relative aspect-[4/3] select-none overflow-hidden rounded-3xl md:aspect-[1482/560] cursor-ew-resize touch-none"
            onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); move(e.clientX) }}
            onPointerMove={(e) => dragging.current && move(e.clientX)}
            onPointerUp={() => { dragging.current = false }}
          >
            <img src="/images/banner19.png" alt="After" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
            <img src="/images/banner20.png" alt="Before" className="absolute inset-0 h-full w-full object-cover" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} draggable={false} />
            <div className="absolute left-5 top-5 rounded-full bg-white/90 px-4 py-2 text-sm"><b>Before</b> · The noisy world</div>
            <div className="absolute right-5 top-5 rounded-full bg-white/90 px-4 py-2 text-sm"><b>After</b> · Pure focus</div>
            <div className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white" style={{ left: `${pos}%` }}>
              <div className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-espresso shadow-lg">
                <ChevronsLeftRight size={20} />
              </div>
            </div>
            <input type="range" min="0" max="100" value={pos} onChange={(e) => setPos(+e.target.value)} aria-label="Comparison slider" className="sr-only" />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section className="pb-[60px] lg:pb-[90px]">
      <div className="container-x grid gap-10 lg:grid-cols-[2fr_3fr] lg:gap-16">
        <Reveal className="flex flex-col gap-6">
          <div className="overflow-hidden rounded-3xl">
            <img src="/images/banner18.png" alt="" className="aspect-[720/600] w-full object-cover transition-transform duration-700 hover:scale-105" />
          </div>
          <div className="rounded-2xl bg-peach p-6">
            <h3 className="text-lg">Do you have more questions?</h3>
            <p className="mt-1 text-sm text-muted">Our team will answer all your questions. We ensure a quick response.</p>
            <a href="#" className="btn-dark mt-5">Contact Support</a>
          </div>
        </Reveal>
        <div>
          <SectionHeading sub="Help Centre" title="Frequently Asked Questions" desc="Everything you need to know before you order." />
          <div className="divide-y divide-sand border-y border-sand">
            {faqs.map((f, i) => (
              <Reveal key={i} delay={i * 0.05} y={20}>
                <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center gap-5 py-5 text-left cursor-pointer" aria-expanded={open === i}>
                  <span className={`font-heading text-sm transition-colors ${open === i ? 'text-terra' : 'text-muted'}`}>{pad(i + 1)}</span>
                  <span className="flex-1 font-heading text-[17px] font-medium md:text-[19px]">{f.q}</span>
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-300 ${open === i ? 'rotate-180 border-terra bg-terra text-white' : 'border-sand'}`}>
                    {open === i ? <Minus size={16} /> : <Plus size={16} />}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35 }} className="overflow-hidden">
                      <p className="pb-6 pl-10 pr-12 text-muted">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function Blog() {
  return (
    <section className="section-py bg-white">
      <div className="container-x">
        <SectionHeading sub="Journal" title="Blog & Articles" desc="Ideas, guides, and inspiration for a beautiful home." />
        <Swiper modules={[Autoplay]} spaceBetween={24} slidesPerView={1.15} breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 }, 1280: { slidesPerView: 4 } }}>
          {posts.map((p, i) => (
            <SwiperSlide key={i}>
              <Reveal delay={i * 0.1}>
                <a href="#" className="group block">
                  <div className="relative overflow-hidden rounded-2xl">
                    <img src={p.img} alt="" className="aspect-[900/600] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-medium">{p.date}</span>
                  </div>
                  <h3 className="mt-5 text-[18px] leading-snug transition-colors group-hover:text-terra">{p.title}</h3>
                  <span className="mt-4 inline-flex items-center gap-1.5 border-b border-ink pb-0.5 text-sm font-medium transition-colors group-hover:border-terra group-hover:text-terra">
                    Read More <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:rotate-45" />
                  </span>
                </a>
              </Reveal>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}

export function Promotions() {
  return (
    <section className="py-[50px]">
      <div className="container-x grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {promos.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.08}>
            <div className="group flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-peach transition-transform duration-500 group-hover:rotate-[360deg]">
                <img src={p.icon} alt="" className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-[17px]">{p.title}</h3>
                <p className="text-sm text-muted">{p.text}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
