'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeftRight, ArrowRight, Check, ChevronDown, Eye, Filter, Heart, ListFilter, Plus, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { money } from '../data'
import { shopProducts } from '../shopData'
import { useStore } from '../store'

const SWATCH = {
  Brown: '#7b5a3c', Black: '#2b2b2b', Gray: '#8a8a8a', 'Light Gray': '#d6d3cf', Yellow: '#f2c500',
  'Off White': '#f1ece2', White: '#ffffff', Gold: '#c9a24a', Red: '#c0392b',
}
const PAGE = 9
const SIZES = ['Large', 'Standard', 'Compact']
const SPECS = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']
const FABRICS = ['Bouclé', 'Linen', 'Velvet', 'Weave']

const SORTS = [
  ['manual', 'Featured'],
  ['most-relevant', 'Most relevant'],
  ['best-selling', 'Best selling'],
  ['title-ascending', 'Alphabetically, A-Z'],
  ['title-descending', 'Alphabetically, Z-A'],
  ['price-ascending', 'Price, low to high'],
  ['price-descending', 'Price, high to low'],
  ['created-ascending', 'Date, old to new'],
  ['created-descending', 'Date, new to old'],
]

function sortProducts(list, key) {
  const l = [...list]
  const by = {
    'title-ascending': (a, b) => a.title.localeCompare(b.title),
    'title-descending': (a, b) => b.title.localeCompare(a.title),
    'price-ascending': (a, b) => a.price - b.price,
    'price-descending': (a, b) => b.price - a.price,
    'created-ascending': (a, b) => a.created.localeCompare(b.created),
    'created-descending': (a, b) => b.created.localeCompare(a.created),
    'best-selling': (a, b) => (b.compare ? 1 : 0) - (a.compare ? 1 : 0),
  }[key]
  return by ? l.sort(by) : l
}


/* Collapsible filter group with the theme's chevron + slide animation */
function Group({ title, count, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-ink/15">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between py-4 text-left font-medium cursor-pointer">
        <span>{title}{count > 0 && <span className="ml-1 text-terra">({count})</span>}</span>
        <ChevronDown size={16} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CheckList({ options, selected, onToggle, counts, swatch }) {
  return (
    <ul className="space-y-3">
      {options.map((o) => {
        const on = selected.includes(o)
        const n = counts[o] ?? 0
        return (
          <li key={o}>
            <label className={`flex cursor-pointer items-center gap-3 text-sm ${n === 0 && !on ? 'opacity-50' : ''}`}>
              <input type="checkbox" className="peer sr-only" checked={on} onChange={() => onToggle(o)} disabled={n === 0 && !on} />
              {swatch ? (
                <span className={`h-5 w-5 rounded-full border transition-all ${on ? 'ring-1 ring-ink ring-offset-2' : 'border-sand/15'}`} style={{ background: (SWATCH[o] || o) }} />
              ) : (
                <span className={`grid h-[18px] w-[18px] place-items-center rounded border transition-colors ${on ? 'border-terra bg-terra text-white' : 'border-ink/30 bg-white'}`}>
                  {on && <Check size={12} strokeWidth={3} />}
                </span>
              )}
              <span className="flex-1">{o}</span>
              <span className="text-muted">{n}</span>
            </label>
          </li>
        )
      })}
    </ul>
  )
}

function PriceRange({ value, onChange, maxPrice, formatMoney }) {
  const [lo, hi] = value
  const pct = (v) => (v / maxPrice) * 100
  const thumb = 'pointer-events-none absolute inset-x-0 top-0 h-5 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-ink [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-ink [&::-moz-range-thumb]:bg-white'
  return (
    <div>
      <p className="mb-4 text-sm">The highest price is {formatMoney(maxPrice)}</p>
      <div className="relative h-5">
        <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-ink/15" />
        <div className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-ink" style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }} />
        <input type="range" min={0} max={maxPrice} value={lo} aria-label="Minimum price" onChange={(e) => onChange([Math.min(+e.target.value, hi - 10), hi])} className={thumb} />
        <input type="range" min={0} max={maxPrice} value={hi} aria-label="Maximum price" onChange={(e) => onChange([lo, Math.max(+e.target.value, lo + 10)])} className={thumb} />
      </div>
      <p className="mt-3 text-sm"><b>Price:</b> <span className="text-muted">{formatMoney(lo)} - {formatMoney(hi)}</span></p>
    </div>
  )
}

function Filters({ f, setF, counts, onClose, options, maxPrice, formatMoney }) {
  const toggle = (key) => (v) => setF((s) => ({ ...s, [key]: s[key].includes(v) ? s[key].filter((x) => x !== v) : [...s[key], v] }))
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="font-medium">Filter:</p>
        {onClose && <button onClick={onClose} aria-label="Close filters" className="cursor-pointer"><X /></button>}
      </div>
      <Group title="Availability" count={f.availability.length}>
        <CheckList options={['In stock', 'Out of stock']} selected={f.availability} onToggle={toggle('availability')} counts={counts.availability} />
      </Group>
      <Group title="Price"><PriceRange value={f.price} maxPrice={maxPrice} formatMoney={formatMoney} onChange={(price) => setF((s) => ({ ...s, price }))} /></Group>
      {Object.entries(options).filter(([, values]) => values.length > 0).map(([key, values]) => (
        <Group key={key} title={{ size: 'Size', spec: 'Specifications', color: 'Color', fabric: 'Fabric', brand: 'Category' }[key]} count={f[key].length} defaultOpen={key === 'size'}>
          <CheckList swatch={key === 'color'} options={values} selected={f[key]} onToggle={toggle(key)} counts={counts[key]} />
        </Group>
      ))}
    </div>
  )
}

/* Centered product card used on the collection grid */
function ShopCard({ p, compareMode, compared, onCompare, formatMoney }) {
  const { addToCart, wishlist, toggleWish, setQuickView } = useStore()
  const [swatch, setSwatch] = useState(0)
  const wished = wishlist.includes(p.id)
  return (
    <div className="group/card text-center">
      <div className="relative overflow-hidden rounded-xl bg-[#f6efe9]">
        <Link href={p.slug ? `/products/${p.slug}` : '#'} onClick={event => { if (!p.slug) event.preventDefault() }} className="relative block aspect-square">
          <img src={p.img} alt={p.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover/card:scale-[1.03] group-hover/card:opacity-0" />
          <img src={p.hover} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-700 group-hover/card:scale-[1.03] group-hover/card:opacity-100" />
        </Link>
        {p.compare > 0 && <span className="absolute left-3 top-3 rounded bg-ink px-2 py-0.5 text-xs text-white">Sale</span>}
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          {[
            { icon: Heart, label: wished ? 'Remove from wishlist' : 'Add to wishlist', on: () => toggleWish(p.id), active: wished },
            { icon: ArrowLeftRight, label: compared ? 'Remove from compare' : 'Add to compare', on: () => onCompare(p.id), active: compared },
            { icon: Eye, label: 'Quick view', on: () => setQuickView({ ...p, swatches: p.colors.map((c) => ({ name: c, hex: (SWATCH[c] || c) })) }) },
          ].map(({ icon: Icon, label, on, active }, i) => (
            <button key={label} onClick={on} aria-label={label} title={label} style={{ transitionDelay: `${i * 60}ms` }}
              className={`grid h-9 w-9 translate-x-12 place-items-center rounded-full bg-white shadow-sm opacity-0 transition-all duration-300 hover:bg-terra hover:text-white group-hover/card:translate-x-0 group-hover/card:opacity-100 [@media(hover:none)]:translate-x-0 [@media(hover:none)]:opacity-100 cursor-pointer ${active ? 'text-terra' : ''}`}>
              <Icon size={16} fill={active && Icon === Heart ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>
        <button disabled={!p.available} onClick={() => addToCart({ ...p, swatches: [] })}
          className="absolute inset-x-3 bottom-3 flex translate-y-4 items-center justify-center gap-1.5 rounded-full bg-espresso py-3 text-sm font-medium text-white opacity-0 transition-all duration-300 hover:bg-terra group-hover/card:translate-y-0 group-hover/card:opacity-100 cursor-pointer">
          <Plus size={15} /> {p.available ? 'Quick Add' : 'Out of stock'}
        </button>
        {compareMode && (
          <label className="absolute bottom-3 left-3 z-10 flex cursor-pointer items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium shadow group-hover/card:opacity-0">
            <input type="checkbox" checked={compared} onChange={() => onCompare(p.id)} className="accent-terra" /> Compare
          </label>
        )}
      </div>
      <div className="pt-4">
        <p className="text-sm text-muted">{p.vendor}</p>
        <Link href={p.slug ? `/products/${p.slug}` : '#'} onClick={event => { if (!p.slug) event.preventDefault() }} className="mt-1 block font-heading text-[16px] font-semibold transition-colors hover:text-terra">{p.title}</Link>
        <div className="mt-1.5 flex items-center justify-center gap-2 text-[15px]">
          {p.compare > 0 && <s className="text-muted">{formatMoney(p.compare)}</s>}
          <span className={p.compare ? 'font-semibold text-terra' : 'font-semibold'}>{formatMoney(p.price)}</span>
        </div>
        <div className="mt-3 flex justify-center gap-2">
          {p.colors.map((c, i) => (
            <button key={c} title={c} onClick={() => setSwatch(i)} aria-label={c}
              className={`h-4 w-4 rounded-full border transition-all cursor-pointer ${swatch === i ? 'ring-1 ring-ink ring-offset-2' : 'border-sand/15'}`} style={{ background: (SWATCH[c] || c) }} />
          ))}
        </div>
      </div>
    </div>
  )
}

const ViewIcon = ({ n }) => (
  <span className="flex gap-[3px]">{Array.from({ length: n }, (_, i) => <span key={i} className="h-3.5 w-[2px] bg-current" />)}</span>
)

export default function ShopGrid({ products = shopProducts, catalogMode = false, currency = 'USD', initialSort = 'title-ascending' }) {
  const maxPrice = Math.max(10, Math.ceil(Math.max(0, ...products.map(product => product.price))))
  const formatMoney = currency === 'INR' ? value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value) : money
  const empty = useMemo(() => ({ availability: [], size: [], spec: [], color: [], fabric: [], brand: [], price: [0, maxPrice] }), [maxPrice])
  const options = useMemo(() => {
    const unique = values => [...new Set(values.filter(Boolean))]
    return catalogMode ? {
      size: unique(products.flatMap(p => p.sizes || [])),
      spec: [],
      color: unique(products.flatMap(p => p.colors)),
      fabric: unique(products.flatMap(p => p.fabrics || [])),
      brand: unique(products.map(p => p.vendor)),
    } : { size: SIZES, spec: SPECS, color: Object.keys(SWATCH), fabric: FABRICS, brand: ['Bed', 'Furniture', 'Tables'] }
  }, [products, catalogMode])
  const [f, setF] = useState(empty)
  const [sort, setSort] = useState(initialSort)
  const [cols, setCols] = useState(3)
  const [showFilters, setShowFilters] = useState(true)
  const [drawer, setDrawer] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [compare, setCompare] = useState([])
  const [compareOpen, setCompareOpen] = useState(false)
  const [visible, setVisible] = useState(PAGE)
  const [loading, setLoading] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const sentinel = useRef(null)
  const top = useRef(null)

  // Live products match only attributes present in their variants.
  const matches = (p, s, skip) =>
    (skip === 'availability' || !s.availability.length || s.availability.includes(p.available ? 'In stock' : 'Out of stock')) &&
    (skip === 'color' || !s.color.length || p.colors.some((c) => s.color.includes(c))) &&
    (skip === 'brand' || !s.brand.length || s.brand.includes(p.vendor)) &&
    (!catalogMode || ['size', 'spec', 'fabric'].every(key => skip === key || !s[key].length || s[key].some(value => (p[{ size: 'sizes', spec: 'specs', fabric: 'fabrics' }[key]] || []).includes(value)))) &&
    p.price >= s.price[0] && p.price <= s.price[1]

  const filtered = useMemo(() => sortProducts(products.filter((p) => matches(p, f)), sort), [products, f, sort, catalogMode])

  const counts = useMemo(() => {
    const count = (skip, fn) => {
      const out = {}
      products.filter((p) => matches(p, f, skip)).forEach((p) => fn(p).forEach((k) => { out[k] = (out[k] || 0) + 1 }))
      return out
    }
    const base = products.filter((p) => matches(p, f)).length
    const all = (opts) => Object.fromEntries(opts.map((o) => [o, base]))
    return {
      availability: count('availability', (p) => [p.available ? 'In stock' : 'Out of stock']),
      color: count('color', (p) => p.colors),
      brand: count('brand', (p) => [p.vendor]),
      ...Object.fromEntries(['size', 'spec', 'fabric'].map(key => [key, catalogMode ? count(key, p => p[{ size: 'sizes', spec: 'specs', fabric: 'fabrics' }[key]] || []) : all(options[key])])),
    }
  }, [products, f, catalogMode, options])

  // Reset paging whenever the result set changes
  const key = JSON.stringify([products, f, sort, catalogMode])
  const [lastKey, setLastKey] = useState(key)
  if (key !== lastKey) { setLastKey(key); setVisible(PAGE) }

  const hasMore = visible < filtered.length
  const loadMore = () => {
    if (loading || !hasMore) return
    setLoading(true)
    setTimeout(() => { setVisible((v) => v + PAGE); setLoading(false) }, 600)
  }

  // Infinite load: fetch the next page when the sentinel scrolls into view
  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver((e) => e[0].isIntersecting && loadMore(), { rootMargin: '200px' })
    io.observe(el)
    return () => io.disconnect()
  })

  const chips = [
    ...['availability', 'size', 'spec', 'color', 'fabric', 'brand'].flatMap((k) => f[k].map((v) => ({ k, v, label: v }))),
    ...(f.price[0] > 0 || f.price[1] < maxPrice ? [{ k: 'price', label: `${formatMoney(f.price[0])} - ${formatMoney(f.price[1])}` }] : []),
  ]
  const removeChip = (c) => setF((s) => (c.k === 'price' ? { ...s, price: [0, maxPrice] } : { ...s, [c.k]: s[c.k].filter((x) => x !== c.v) }))
  const toggleCompare = (id) => {
    setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 4 ? c : [...c, id]))
    setCompareMode(true)
  }
  const gridCols = { 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' }[showFilters ? cols : Math.min(cols + 1, 4)]
  const comparedItems = products.filter((p) => compare.includes(p.id))

  if (products.length === 0) {
    return (
      <section className="bg-cream py-10 md:py-14" aria-labelledby="empty-collection-title">
        <div className="container-x">
          <div className="mx-auto grid max-w-5xl items-center overflow-hidden rounded-3xl border border-sand bg-white md:grid-cols-2">
            <div className="flex h-full items-center justify-center bg-cream px-5 py-6 md:p-8">
              <img src="/images/empty-collection.webp" alt="Illustration of a cozy corner with a lounge chair, side table, lamp, and plant" width={720} height={480} className="aspect-[3/2] w-full max-w-md object-contain" />
            </div>
            <div className="px-7 py-9 text-center md:px-10 md:py-12 md:text-left">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-terra">Room for discovery</span>
              <h2 id="empty-collection-title" className="mt-3 font-heading text-[28px] font-semibold leading-tight md:text-[34px]">Your next favorite<br className="hidden md:block" /> is out there.</h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted md:text-base">There are no pieces in this collection right now. Find a little inspiration in the rest of our shop.</p>
              <Link href="/shop" className="btn-terra mt-7">Explore the shop <ArrowRight size={16} aria-hidden="true" /></Link>
              <div className="mt-4"><Link href="/" className="text-sm text-muted underline underline-offset-4 transition-colors hover:text-terra">Back to home</Link></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={top} className="bg-cream py-[60px] lg:py-[90px]">
      <div className="container-x">
        {/* Toolbar */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <button onClick={() => (window.innerWidth < 1024 ? setDrawer(true) : setShowFilters((s) => !s))}
              className="flex items-center gap-2 rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-sm font-medium transition-colors hover:border-terra hover:text-terra cursor-pointer">
              <Filter size={15} /> <span className="hidden lg:inline">{showFilters ? 'Hide filters' : 'Show filters'}</span><span className="lg:hidden">Filter</span>
            </button>
            <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
              Compare
              <button role="switch" aria-checked={compareMode} onClick={() => setCompareMode((m) => !m)}
                className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer ${compareMode ? 'bg-terra' : 'bg-ink/20'}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${compareMode ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </label>
          </div>
          <div className="flex items-center gap-5">
            <p className="hidden text-sm font-medium sm:block">{filtered.length} products</p>
            <div className="relative">
              <button onClick={() => setSortOpen((o) => !o)} className="flex items-center gap-2 rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-sm cursor-pointer">
                <ListFilter size={15} /> <b className="hidden sm:inline">SORT BY</b> {SORTS.find((s) => s[0] === sort)[1]}
                <ChevronDown size={14} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.ul initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 z-30 mt-2 w-60 overflow-hidden rounded-xl border border-ink/10 bg-white py-2 shadow-xl">
                    {SORTS.map(([k, label]) => (
                      <li key={k}>
                        <button onClick={() => { setSort(k); setSortOpen(false) }}
                          className={`block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-cream hover:text-terra cursor-pointer ${sort === k ? 'font-semibold text-terra' : ''}`}>{label}</button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
            <div className="hidden items-center gap-3 lg:flex">
              <span className="text-xs font-medium uppercase tracking-wider text-muted">View as</span>
              <div className="flex overflow-hidden rounded-lg border border-ink/15 bg-white">
                {[2, 3, 4].map((n) => (
                  <button key={n} onClick={() => setCols(n)} aria-label={`${n} columns`}
                    className={`grid h-9 w-10 place-items-center transition-colors cursor-pointer ${cols === n ? 'bg-ink text-white' : 'hover:text-terra'}`}><ViewIcon n={n} /></button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar: sticky, slides away when hidden */}
          <AnimatePresence initial={false}>
            {showFilters && (
              <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 260, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.35 }}
                className="hidden shrink-0 overflow-hidden lg:block">
                <div className="sticky top-28 w-[260px] pr-2">
                  <Filters f={f} setF={setF} counts={counts} options={options} maxPrice={maxPrice} formatMoney={formatMoney} />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          <div className="min-w-0 flex-1">
            {chips.length > 0 && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                {chips.map((c) => (
                  <button key={c.k + c.label} onClick={() => removeChip(c)} className="flex items-center gap-1.5 rounded-full border border-ink/15 bg-white px-3 py-1.5 text-sm transition-colors hover:border-terra hover:text-terra cursor-pointer">
                    {c.label} <X size={13} />
                  </button>
                ))}
                <button onClick={() => setF(empty)} className="px-2 text-sm underline hover:text-terra cursor-pointer">Clear all</button>
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-lg">{products.length ? 'No products match your filters' : 'No products in this category yet'}</p>
                {products.length > 0 && <button onClick={() => setF(empty)} className="btn-dark mt-5">Clear all filters</button>}
              </div>
            ) : (
              <motion.div layout className={`grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 ${gridCols}`}>
                <AnimatePresence mode="popLayout">
                  {filtered.slice(0, visible).map((p, i) => (
                    <motion.div key={p.id} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0, transition: { delay: (i % PAGE) * 0.05 } }} exit={{ opacity: 0, scale: 0.95 }}>
                      <ShopCard p={p} compareMode={compareMode} compared={compare.includes(p.id)} onCompare={toggleCompare} formatMoney={formatMoney} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Load more: automatic when scrolled into view, button as fallback */}
            {filtered.length > 0 && (
              <div className="mt-14 text-center">
                {hasMore ? (
                  <>
                    <div ref={sentinel} />
                    <button onClick={loadMore} disabled={loading} className="btn-outline min-w-44">
                      {loading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-l-transparent" /> : 'Load more'}
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-muted">You have reached the end — all products are loaded</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {drawer && (
          <motion.div className="fixed inset-0 z-[70] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-espresso/50" onClick={() => setDrawer(false)} />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.35 }}
              className="relative flex h-full w-[85%] max-w-sm flex-col bg-white">
              <div className="flex-1 overflow-y-auto p-5"><Filters f={f} setF={setF} counts={counts} options={options} maxPrice={maxPrice} formatMoney={formatMoney} onClose={() => setDrawer(false)} /></div>
              <div className="flex gap-3 border-t border-ink/10 p-4">
                <button onClick={() => setF(empty)} className="btn-outline flex-1">Clear all</button>
                <button onClick={() => setDrawer(false)} className="btn-dark flex-1">Show {filtered.length}</button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compare bar + modal */}
      <AnimatePresence>
        {compareMode && compare.length > 0 && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed inset-x-0 bottom-14 z-50 border-t border-ink/10 bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.08)] md:bottom-0">
            <div className="container-x flex items-center gap-4 py-3">
              <div className="flex flex-1 gap-3 overflow-x-auto">
                {comparedItems.map((p) => (
                  <div key={p.id} className="relative shrink-0">
                    <img src={p.img} alt={p.title} className="h-14 w-14 rounded-lg bg-cream object-cover" />
                    <button onClick={() => toggleCompare(p.id)} aria-label={`Remove ${p.title}`} className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink text-white cursor-pointer"><X size={11} /></button>
                  </div>
                ))}
              </div>
              <button onClick={() => setCompare([])} className="text-sm underline hover:text-terra cursor-pointer">Clear</button>
              <button onClick={() => setCompareOpen(true)} disabled={compare.length < 2} className="btn-terra px-5 py-2.5 disabled:opacity-50">Compare ({compare.length})</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {compareOpen && (
          <motion.div className="fixed inset-0 z-[80] grid place-items-center bg-espresso/50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCompareOpen(false)}>
            <motion.div initial={{ y: 30 }} animate={{ y: 0 }} exit={{ y: 30 }} className="max-h-[85vh] w-full max-w-5xl overflow-auto rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
              <div className="mb-5 flex items-center justify-between"><h3 className="text-2xl">Compare products</h3><button onClick={() => setCompareOpen(false)} aria-label="Close" className="cursor-pointer"><X /></button></div>
              <table className="w-full min-w-[560px] text-sm">
                <tbody>
                  <tr>
                    <td className="w-32" />
                    {comparedItems.map((p) => (
                      <td key={p.id} className="p-2 align-top"><img src={p.img} alt="" className="aspect-square w-full rounded-lg object-cover" /><p className="mt-2 font-semibold">{p.title}</p></td>
                    ))}
                  </tr>
                  {[['Price', (p) => formatMoney(p.price)], ['Brand', (p) => p.vendor], ['Availability', (p) => (p.available ? 'In stock' : 'Out of stock')], ['Colors', (p) => p.colors.join(', ')], ['Added', (p) => p.created]].map(([k, fn]) => (
                    <tr key={k} className="border-t border-ink/10"><td className="p-2 text-muted">{k}</td>{comparedItems.map((p) => <td key={p.id} className="p-2">{fn(p)}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
