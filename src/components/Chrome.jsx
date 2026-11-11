'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, Home, MapPin, Minus, Plus, Search, ShoppingBag, Store, User, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatPrice } from '../catalog'
import { money } from '../data'
import { useStore } from '../store'
import { ADDRESS, Logo, Price, Socials } from './ui'

export function Footer() {
  const cols = [
    { title: 'Quick Links', links: [{ label: 'FAQ', href: '/faq' }, { label: 'Find store location', href: '#' }, { label: 'Privacy Policy', href: '#' }, { label: 'Refund Policy', href: '#' }, { label: 'Terms of Service', href: '#' }] },
    { title: 'Company', links: [{ label: 'About us', href: '/about' }, { label: 'Contact us', href: '/contact' }, { label: 'Wishlist', href: '/account?section=wishlist' }, { label: 'My account', href: '/account' }, { label: 'Product compare', href: '#' }, { label: 'Cart', href: '#' }] },
  ]
  return (
    <footer className="bg-espresso pb-24 pt-[60px] text-white/75 md:pb-[35px] lg:pt-[80px]">
      <div className="container-x grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.5fr]">
        <div>
          <Logo light />
          <p className="mt-5 max-w-xs">Artiz is an interior design studio crafting warm, functional spaces with thoughtful furniture and timeless detail.</p>
          <p className="mt-4 flex items-start gap-2">
            <MapPin size={18} className="mt-0.5 shrink-0 text-terra" /> {ADDRESS}
          </p>
          <Socials className="mt-6 text-white" />
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="mb-5 text-lg text-white">{c.title}</h4>
            <ul className="space-y-3">
              {c.links.map((l) => (
                <li key={l.label}><a href={l.href} className="inline-block transition-all duration-300 hover:translate-x-1 hover:text-terra">{l.label}</a></li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h4 className="mb-5 text-lg text-white">Newsletter</h4>
          <p>Be first to know about new arrivals and offers.</p>
          <form className="mt-5 flex rounded-full border border-white/20 p-1.5 focus-within:border-terra" onSubmit={(e) => e.preventDefault()}>
            <input type="email" required placeholder="Your email address" className="min-w-0 flex-1 bg-transparent px-4 text-white outline-none placeholder:text-white/50" />
            <button className="rounded-full bg-terra px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white hover:text-espresso cursor-pointer">Subscribe</button>
          </form>
        </div>
      </div>
      <div className="container-x mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm md:flex-row">
        <p>© 2026, Artiz Interior Design Studio. All rights reserved.</p>
        <p>{ADDRESS}</p>
      </div>
    </footer>
  )
}

function Drawer({ open, onClose, children, side = 'right' }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] bg-espresso/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.aside
            initial={{ x: side === 'right' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: side === 'right' ? '100%' : '-100%' }}
            transition={{ type: 'tween', duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute top-0 flex h-full w-full max-w-md flex-col bg-white ${side === 'right' ? 'right-0' : 'left-0'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, updateQty } = useStore()
  const totals = cart.reduce((out, item) => { const currency = item.currency || 'USD'; out[currency] = (out[currency] || 0) + item.price * item.qty; return out }, {})
  const total = totals.USD || 0
  const showShippingOffer = cart.length > 0 && cart.every(item => !item.currency || item.currency === 'USD')
  const freeAt = 500
  return (
    <Drawer open={cartOpen} onClose={() => setCartOpen(false)}>
      <div className="flex items-center justify-between border-b border-sand p-6">
        <h3 className="text-xl">Shopping Cart ({cart.reduce((n, i) => n + i.qty, 0)})</h3>
        <button onClick={() => setCartOpen(false)} aria-label="Close cart" className="cursor-pointer transition-transform hover:rotate-90"><X /></button>
      </div>
      {showShippingOffer && <div className="px-6 pt-5">
        <p className="text-sm">{total >= freeAt ? 'You have unlocked free shipping!' : <>Spend <b>{money(freeAt - total)}</b> more for free shipping</>}</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand">
          <motion.div className="h-full bg-terra" animate={{ width: `${Math.min(100, (total / freeAt) * 100)}%` }} />
        </div>
      </div>}
      <ul className="flex-1 space-y-5 overflow-y-auto p-6">
        {cart.length === 0 && <li className="py-16 text-center text-muted">Your cart is empty</li>}
        <AnimatePresence>
          {cart.map((i) => (
            <motion.li key={i.lineKey || i.id} layout initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} className="flex gap-4">
              <img src={i.img} alt="" className="h-20 w-20 rounded-xl bg-cream object-contain" />
              <div className="flex-1">
                <p className="font-medium">{i.title}</p>
                <Price price={i.price} compare={i.compare} currency={i.currency} className="text-sm" />
                {i.priceChanged && <p className="mt-1 text-xs text-terra">Price updated since you added this.</p>}
                {i.selectedColor && <p className="mt-1 text-xs text-muted">Color: {i.selectedColor}</p>}
                <div className="mt-2 inline-flex items-center rounded-full border border-sand">
                  <button onClick={() => updateQty(i.lineKey || i.id, i.qty - 1)} className="p-2 cursor-pointer" aria-label="Decrease"><Minus size={12} /></button>
                  <span className="w-6 text-center text-sm">{i.qty}</span>
                  <button disabled={i.qty >= Math.min(i.stock ?? Infinity, i.currency === 'INR' ? 10 : Infinity)} onClick={() => updateQty(i.lineKey || i.id, i.qty + 1)} className="p-2 cursor-pointer" aria-label="Increase"><Plus size={12} /></button>
                </div>
              </div>
              <button onClick={() => updateQty(i.lineKey || i.id, 0)} className="self-start text-sm text-muted underline hover:text-terra cursor-pointer">Remove</button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <div className="border-t border-sand p-6">
        <div className="mb-4 flex justify-between text-lg font-semibold"><span>Subtotal</span><span>{Object.entries(totals).length ? Object.entries(totals).map(([currency, amount]) => <span key={currency} className="block text-right">{formatPrice(amount, currency)}</span>) : money(0)}</span></div>
        {cart.length > 0 ? <Link href="/checkout" onClick={() => setCartOpen(false)} className="btn-dark w-full">Check out</Link> : <button disabled className="btn-dark w-full opacity-50">Check out</button>}
        <button onClick={() => setCartOpen(false)} className="btn-outline mt-3 w-full">Continue shopping</button>
      </div>
    </Drawer>
  )
}

export function QuickView() {
  const { quickView: p, setQuickView } = useStore()
  return (
    <AnimatePresence>
      {p && <QuickViewBody key={p.id} p={p} close={() => setQuickView(null)} />}
    </AnimatePresence>
  )
}

function QuickViewBody({ p, close }) {
  const { addToCart, setQuickView } = useStore()
  const [qty, setQty] = useState(1)
  return (
        <motion.div className="fixed inset-0 z-[80] grid place-items-center bg-espresso/50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="relative grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white md:grid-cols-2" onClick={(e) => e.stopPropagation()}>
            <button onClick={close} className="absolute right-4 top-4 z-10 cursor-pointer" aria-label="Close"><X /></button>
            <img src={p.img} alt={p.title} className="aspect-square w-full bg-cream object-contain p-8" />
            <div className="p-8">
              <p className="text-xs uppercase tracking-wider text-muted">Vendor: Furniture</p>
              <h3 className="mt-2 text-3xl">{p.title}</h3>
              <Price price={p.price} compare={p.compare} currency={p.currency} className="mt-3 text-lg" />
              <p className="mt-5 line-clamp-3 text-muted">{p.description || 'Crafted with premium materials for everyday comfort.'}</p>
              {p.slug && <Link href={`/products/${p.slug}`} onClick={close} className="mt-4 inline-block text-sm underline underline-offset-4 hover:text-terra">View full details</Link>}
              <p className="mt-6 text-sm font-medium">Color</p>
              <div className="mt-2 flex gap-2">{p.swatches.map((s) => <span key={s.name} title={s.name} className="h-7 w-7 rounded-full border border-sand/10" style={{ background: s.hex }} />)}</div>
              <div className="mt-8 flex gap-3">
                <div className="inline-flex items-center rounded-full border border-sand">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 cursor-pointer" aria-label="Decrease"><Minus size={14} /></button>
                  <span className="w-8 text-center">{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)} className="p-3 cursor-pointer" aria-label="Increase"><Plus size={14} /></button>
                </div>
                <button onClick={() => { addToCart(p, qty); setQuickView(null) }} className="btn-dark flex-1">Add to cart</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
  )
}

export function EmailPopup() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    let seen = false
    try { seen = localStorage.getItem('artiz-popup') === '1' } catch { /* storage unavailable */ }
    if (seen) return
    const t = setTimeout(() => setOpen(true), 6000)
    return () => clearTimeout(t)
  }, [])
  const close = () => {
    setOpen(false)
    try { localStorage.setItem('artiz-popup', '1') } catch { /* storage unavailable */ }
  }
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90] grid place-items-center bg-espresso/50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative grid w-full max-w-3xl overflow-hidden rounded-3xl bg-cream md:grid-cols-2" onClick={(e) => e.stopPropagation()}>
            <img src="/images/banner11.png" alt="" className="hidden h-full w-full object-cover md:block" />
            <div className="p-8 text-center md:p-10">
              <button onClick={close} className="absolute right-4 top-4 cursor-pointer" aria-label="Close"><X /></button>
              <h3 className="text-3xl">Exclusive benefits</h3>
              <p className="mt-3 text-muted">Sign up for our newsletter to be the first to learn about new arrivals, special promotions, and online exclusives.</p>
              <form className="mt-6 space-y-3" onSubmit={(e) => { e.preventDefault(); close() }}>
                <input type="email" required placeholder="Email address" className="h-12 w-full rounded-full border border-sand bg-white px-5 outline-none focus:border-terra" />
                <button className="btn-dark w-full">Subscribe</button>
              </form>
              <p className="mt-3 text-xs text-muted">*By submitting this form, you agree to receive our emails and may unsubscribe at any time.</p>
              <button onClick={close} className="mt-4 text-sm underline hover:text-terra cursor-pointer">No Thanks!</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function MobileBar() {
  const router = useRouter()
  const { cart, setCartOpen } = useStore()
  const items = [
    { icon: Home, label: 'Home' },
    { icon: Search, label: 'Search' },
    { icon: Store, label: 'Shop' },
    { icon: ShoppingBag, label: 'cart', on: () => setCartOpen(true), badge: cart.reduce((n, i) => n + i.qty, 0) },
    { icon: User, label: 'account', on: () => router.push('/account') },
  ]
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-sand bg-white py-2 md:hidden">
      {items.map(({ icon: Icon, label, on, badge }) => (
        <button key={label} onClick={on} className="relative flex flex-col items-center gap-1 text-xs capitalize cursor-pointer">
          <Icon size={20} />
          {label}
          {badge !== undefined && <span className="absolute right-1/4 -top-1 grid h-4 w-4 place-items-center rounded-full bg-terra text-[9px] text-white">{badge}</span>}
        </button>
      ))}
    </nav>
  )
}

export function BackToTop() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const on = () => setShow(window.scrollY > 600)
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={() => window.scrollTo({ top: 0 })}
          aria-label="Back to top"
          className="fixed bottom-20 right-5 z-50 grid h-12 w-12 place-items-center rounded-full bg-terra text-white shadow-lg transition-colors hover:bg-espresso md:bottom-8 cursor-pointer"
        >
          <ArrowUp size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
