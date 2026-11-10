'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Eye, Heart, Shuffle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { formatPrice } from '../catalog'
import { useStore } from '../store'
import { ADDRESS } from '../site'

export { ADDRESS }

export function Logo({ light = false, className = '' }) {
  return (
    <Link href="/" className={`inline-flex flex-col leading-none ${className}`} aria-label="Artiz Interior Design Studio">
      <span className={`font-heading text-[28px] font-bold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>
        Artiz<span className="text-terra">.</span>
      </span>
      <span className={`mt-1 text-[9px] font-medium uppercase tracking-[0.28em] ${light ? 'text-white/60' : 'text-muted'}`}>
        Interior Design Studio
      </span>
    </Link>
  )
}

export function Reveal({ children, delay = 0, className = '', y = 40 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function SectionHeading({ sub, title, desc, align = 'left', right }) {
  return (
    <Reveal className={`mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between ${align === 'center' ? 'md:justify-center text-center' : 'text-center md:text-left'}`}>
      <div className={align === 'center' ? 'mx-auto max-w-2xl' : ''}>
        {sub && <span className="subtitle">{sub}</span>}
        <h2 className="h2-title">{title}</h2>
        {desc && <p className="mt-3 text-muted">{desc}</p>}
      </div>
      {right && <div className="flex justify-center">{right}</div>}
    </Reveal>
  )
}

export function ViewAll({ href = '#' }) {
  return (
    <a href={href} className="group inline-flex items-center gap-2 border-b border-ink pb-0.5 font-medium transition-colors hover:border-terra hover:text-terra">
      View All <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:rotate-45" />
    </a>
  )
}

export function ArrowBtn({ children = 'Explore Collection', className = 'btn-dark', href = '#' }) {
  return (
    <a href={href} className={`group ${className}`}>
      {children}
      <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
    </a>
  )
}

export function Price({ price, compare, currency = 'USD', className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={compare ? 'text-terra font-semibold' : 'font-semibold'}>{formatPrice(price, currency)}</span>
      {compare > 0 && <s className="text-sm text-muted">{formatPrice(compare, currency)}</s>}
    </div>
  )
}

/* Product card with the theme's hover behaviour: secondary image cross-fade,
   slight zoom, action buttons sliding in from the side, Quick Add rising up. */
export function ProductCard({ p }) {
  const { addToCart, wishlist, toggleWish, setQuickView } = useStore()
  const [swatch, setSwatch] = useState(0)
  const wished = wishlist.includes(p.id)
  const off = p.compare ? Math.round((1 - p.price / p.compare) * 100) : 0

  return (
    <div className="group/card">
      <div className="relative overflow-hidden rounded-2xl bg-white">
        <a href="#" className="relative block aspect-square">
          <img src={p.img} alt={p.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover/card:scale-[1.03] group-hover/card:opacity-0" />
          <img src={p.hover} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-700 group-hover/card:scale-[1.03] group-hover/card:opacity-100" />
        </a>
        {off > 0 && <span className="absolute left-3 top-3 rounded-full bg-terra px-3 py-1 text-xs font-medium text-white">Sale</span>}
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          {[
            { icon: Heart, label: wished ? 'Remove from wishlist' : 'Add to wishlist', on: () => toggleWish(p.id), active: wished },
            { icon: Shuffle, label: 'Add to compare' },
            { icon: Eye, label: 'Quick view', on: () => setQuickView(p) },
          ].map(({ icon: Icon, label, on, active }, i) => (
            <button
              key={label}
              onClick={on}
              aria-label={label}
              title={label}
              style={{ transitionDelay: `${i * 60}ms` }}
              className={`grid h-9 w-9 translate-x-12 place-items-center rounded-full bg-white shadow-sm opacity-0 transition-all duration-300 hover:bg-terra hover:text-white group-hover/card:translate-x-0 group-hover/card:opacity-100 cursor-pointer ${active ? 'text-terra' : ''}`}
            >
              <Icon size={16} fill={active ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>
        <button
          onClick={() => addToCart(p)}
          className="absolute inset-x-3 bottom-3 translate-y-4 rounded-full bg-espresso py-3 text-sm font-medium text-white opacity-0 transition-all duration-300 hover:bg-terra group-hover/card:translate-y-0 group-hover/card:opacity-100 cursor-pointer"
        >
          Quick Add
        </button>
      </div>
      <div className="pt-4">
        <p className="mb-1 text-xs uppercase tracking-wider text-muted">Furniture</p>
        <a href="#" className="font-heading text-[16px] font-medium transition-colors hover:text-terra">{p.title}</a>
        <Price price={p.price} compare={p.compare} className="mt-1" />
        <div className="mt-3 flex gap-2">
          {p.swatches.map((s, i) => (
            <button
              key={s.name}
              title={s.name}
              onClick={() => setSwatch(i)}
              className={`h-5 w-5 rounded-full border transition-all cursor-pointer ${swatch === i ? 'ring-1 ring-ink ring-offset-2' : 'border-sand/10'}`}
              style={{ background: s.hex }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function Hotspot({ x, y, product }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="absolute z-10" style={{ left: `${x}%`, top: `${y}%` }} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button onClick={() => setOpen((o) => !o)} aria-label={`Show ${product.title}`} className="relative grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 cursor-pointer">
        <span className="absolute inset-0 animate-ping rounded-full bg-white/70" />
        <span className={`relative h-2.5 w-2.5 rounded-full bg-terra transition-transform ${open ? 'scale-150' : ''}`} />
      </button>
      <div className={`absolute bottom-6 left-1/2 w-56 -translate-x-1/2 rounded-xl bg-white p-3 shadow-xl transition-all duration-300 ${open ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-2 opacity-0'}`}>
        <div className="flex items-center gap-3">
          <img src={product.img} alt="" className="h-14 w-14 rounded-lg bg-cream object-contain" />
          <div>
            <p className="text-sm font-medium leading-tight">{product.title}</p>
            <Price price={product.price} compare={product.compare} className="mt-1 text-sm" />
          </div>
        </div>
      </div>
    </div>
  )
}

export const Socials = ({ size = 16, className = '' }) => {
  const icons = {
    Twitter: 'M18.9 2H22l-7.6 8.7L23 22h-6.8l-5.3-6.9L4.8 22H1.7l8.1-9.3L1 2h7l4.8 6.3L18.9 2Zm-1.2 18h1.7L7.4 3.9H5.6L17.7 20Z',
    Facebook: 'M14 8V6c0-.9.6-1 1-1h3V1h-4c-4 0-5 3-5 5v2H6v4h3v11h5V12h3.5l.5-4h-4Z',
    Instagram: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4ZM17.3 5.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4ZM12 1c-3 0-3.4 0-4.6.1C3.5 1.3 1.3 3.5 1.1 7.4 1 8.6 1 9 1 12s0 3.4.1 4.6c.2 3.9 2.4 6.1 6.3 6.3 1.2.1 1.6.1 4.6.1s3.4 0 4.6-.1c3.9-.2 6.1-2.4 6.3-6.3.1-1.2.1-1.6.1-4.6s0-3.4-.1-4.6c-.2-3.9-2.4-6.1-6.3-6.3C15.4 1 15 1 12 1Zm0 2c2.9 0 3.3 0 4.5.1 2.9.1 4.3 1.5 4.4 4.4.1 1.2.1 1.5.1 4.5s0 3.3-.1 4.5c-.1 2.9-1.5 4.3-4.4 4.4-1.2.1-1.5.1-4.5.1s-3.3 0-4.5-.1c-2.9-.1-4.3-1.5-4.4-4.4C3 15.3 3 15 3 12s0-3.3.1-4.5C3.2 4.6 4.6 3.2 7.5 3.1 8.7 3 9.1 3 12 3Z',
    TikTok: 'M16.6 1h-3.7v14.6a3.2 3.2 0 1 1-3.2-3.2c.3 0 .6 0 .9.1V8.7a7 7 0 1 0 6 6.9V8.3a9 9 0 0 0 5.2 1.7V6.3a5.3 5.3 0 0 1-5.2-5.3Z',
    Vimeo: 'M23 6.6c-.1 2.1-1.6 5-4.4 8.7-2.9 3.8-5.4 5.7-7.4 5.7-1.3 0-2.3-1.2-3.2-3.5L6.3 11c-.6-2.3-1.3-3.5-2-3.5-.2 0-.7.3-1.6 1L1.8 7.3l2.9-2.6C6 3.6 7 3 7.6 3c1.6-.2 2.5.9 2.9 3.2.4 2.5.7 4.1.8 4.7.5 2.1 1 3.1 1.5 3.1.4 0 1-.7 1.9-2 .9-1.4 1.3-2.4 1.4-3.1.1-1.2-.3-1.8-1.4-1.8-.5 0-1 .1-1.5.3 1-3.3 3-4.9 5.9-4.8 2.1.1 3.1 1.4 2.9 4Z',
  }
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {Object.entries(icons).map(([name, d]) => (
        <a key={name} href="#" aria-label={name} className="transition-all duration-300 hover:-translate-y-0.5 hover:text-terra">
          <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d={d} /></svg>
        </a>
      ))}
    </div>
  )
}
