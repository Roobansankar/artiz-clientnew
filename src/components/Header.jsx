'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ImageIcon, MapPin, Menu, User, X } from 'lucide-react'
import { CartIcon, HeartIcon, SearchIcon, UserIcon } from './icons'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useStore } from '../store'
import { ADDRESS, Logo, Socials } from './ui'

const extraLinks = [
  { label: 'New Arrivals', href: '/new-arrivals', children: [] },
  { label: 'Best Sellers', href: '/best-sellers', children: [] },
  { label: 'Gallery', href: '/gallery', children: [] },
]
const discoverLinks = [
  { label: 'About Us', href: '/about', children: [] },
  { label: 'Contact Us', href: '/contact', children: [] },
  { label: 'FAQs', href: '/faq', children: [] },
]

function categoryItems(categories, parentSlug = null, path = []) {
  return categories
    .filter(category => category.parentSlug === parentSlug && category.showInMenu && (parentSlug !== null || category.kind === 'category'))
    .filter(category => !path.includes(category.slug))
    .map(category => ({
      label: category.name,
      href: `/shop/${encodeURIComponent(category.slug)}`,
      image: category.image,
      children: categoryItems(categories, category.slug, [...path, category.slug]),
    }))
}

/* The theme's +/- toggle: two bars, the vertical one rotates flat when open */
function PlusMinus({ open, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={open ? 'Collapse' : 'Expand'}
      aria-expanded={open}
      className={`absolute right-0 top-0 z-10 h-[46px] w-10 cursor-pointer before:absolute before:left-1/2 before:top-1/2 before:h-0.5 before:w-3 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-ink/50 after:absolute after:left-1/2 after:top-1/2 after:h-0.5 after:w-3 after:-translate-x-1/2 after:-translate-y-1/2 after:bg-ink/50 after:transition-transform after:duration-300 ${open ? '' : 'after:rotate-90'}`}
    />
  )
}

function MobileItem({ item, depth = 0 }) {
  const [open, setOpen] = useState(false)
  const pad = ['pl-5', 'pl-[30px]', 'pl-10'][depth]
  return (
    <li className={`relative ${depth === 0 ? 'border-b border-ink/20' : 'border-t border-ink/20'}`}>
      <Link href={item.href || '#'} className={`block py-[15px] pr-10 leading-none ${pad} ${depth === 0 ? 'font-medium' : 'text-[14px] text-ink/80'} ${open ? 'text-terra' : ''}`}>
        {item.label}
      </Link>
      {item.children?.length > 0 && (
        <>
          <PlusMinus open={open} onClick={() => setOpen((o) => !o)} />
          <AnimatePresence initial={false}>
            {open && (
              <motion.ul initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                {item.children.map((c) => <MobileItem key={c.label} item={c} depth={depth + 1} />)}
              </motion.ul>
            )}
          </AnimatePresence>
        </>
      )}
    </li>
  )
}

function MenuBranch({ item, heading = false }) {
  return (
    <li className={heading ? 'min-w-0 break-inside-avoid' : 'min-w-0'}>
      <Link href={item.href} className={`block py-1.5 leading-relaxed transition-colors hover:text-terra ${heading ? 'font-heading text-[15px] font-semibold text-ink' : 'text-sm text-muted'}`}>{item.label}</Link>
      {item.children.length > 0 && <ul className={heading ? 'mt-2 space-y-0.5' : 'ml-2 mt-1 border-l border-sand pl-3'}>{item.children.map(child => <MenuBranch key={child.href} item={child} />)}</ul>}
    </li>
  )
}

function Dropdown({ item }) {
  const wide = item.children.length >= 4
  const [failedImage, setFailedImage] = useState(null)
  const hasImage = Boolean(item.image?.trim()) && failedImage !== item.image
  return (
    <div className={wide ? 'w-full' : 'mx-auto w-full max-w-[960px] px-8'}>
      <div className={`max-h-[70vh] overflow-y-auto border-t border-sand/70 bg-white py-6 shadow-xl ${wide ? 'px-8 xl:px-12' : 'rounded-b-xl px-6'}`}>
        <div className="mb-5 flex items-center justify-between gap-4 border-b border-sand pb-4">
          <span className="font-heading text-lg font-semibold">Explore {item.label}</span>
          <Link href={item.href} className="shrink-0 text-sm font-medium text-terra hover:underline">Shop All {item.label} <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="flex items-stretch gap-8">
          <ul className="grid min-w-0 flex-1 grid-cols-[repeat(auto-fit,minmax(150px,1fr))] content-start items-start gap-x-6 gap-y-5">
            {item.children.map(child => <MenuBranch key={child.href} item={child} heading />)}
          </ul>
          <Link href={item.href} className="group/feature relative block min-h-[260px] w-[26%] max-w-[340px] shrink-0 overflow-hidden rounded-xl bg-cream">
            {hasImage ? <>
              <img src={item.image} alt={`${item.label} collection`} onError={() => setFailedImage(item.image)} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover/feature:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 via-espresso/10 to-transparent" />
            </> : <div aria-hidden="true" className="absolute inset-0 flex items-start justify-center bg-sand/40 pt-10 text-muted/40"><ImageIcon size={64} strokeWidth={1} /></div>}
            <div className={`relative flex h-full min-h-[260px] flex-col justify-end p-6 ${hasImage ? 'text-white' : 'text-ink'}`}>
              <span className="text-[10px] font-medium uppercase tracking-[0.18em]">The Artiz Collection</span>
              <span className="mt-2 font-heading text-2xl font-semibold">{item.label}</span>
              <span className="mt-3 flex items-center gap-2 text-sm">Explore collection <span aria-hidden="true">↗</span></span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function Header() {
  const [categories, setCategories] = useState([])
  const [categoryError, setCategoryError] = useState(false)
  const refreshCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories', { cache: 'no-store' })
      if (!response.ok) throw new Error('Categories unavailable')
      const data = await response.json()
      if (!Array.isArray(data.categories)) throw new Error('Invalid categories')
      setCategories(data.categories)
      setCategoryError(false)
    } catch {
      setCategoryError(true)
    }
  }, [])
  useEffect(() => {
    void refreshCategories()
    const refresh = () => { if (document.visibilityState === 'visible') void refreshCategories() }
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [refreshCategories])
  const nav = categoryItems(categories)
  const mobileNav = [...nav, ...extraLinks, { label: 'Discover', children: discoverLinks }]
  const { cart, setCartOpen, wishlist } = useStore()
  const [mobile, setMobile] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [dismissedDropdown, setDismissedDropdown] = useState(null)
  const count = cart.reduce((n, i) => n + i.qty, 0)

  const closeDropdownOnNavigate = (event, key) => {
    const link = event.target.closest('a')
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
    setDismissedDropdown(key)
    link.blur()
  }

  // Close the mobile menu after navigating to another page
  const pathname = usePathname()
  useEffect(() => setMobile(false), [pathname])

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-espresso text-[13px] text-white/90">
        <div className="container-x flex h-[42px] items-center justify-between">
          <div className="hidden gap-5 md:flex">
            <a href="#" className="hover:text-terra">Orders</a>
            <Link href="/account" className="hover:text-terra">Profile</Link>
          </div>
          <Socials size={14} className="mx-auto md:mx-0" />
          <p className="hidden items-center gap-1.5 md:flex">
            <MapPin size={14} className="text-terra" /> {ADDRESS}
          </p>
        </div>
      </div>

      <header className="sticky top-0 z-40 w-full bg-cream shadow-[0_4px_20px_rgba(73,51,39,0.06)]">
        <div className="container-x flex h-[64px] items-center justify-between gap-4">
          <button className="min-[1440px]:hidden cursor-pointer" onClick={() => setMobile(true)} aria-label="Open menu"><Menu /></button>
          <Logo className="shrink-0" />

          <nav className="hidden h-full min-[1440px]:flex" aria-label="Main navigation">
            {categoryError && <button onClick={refreshCategories} className="px-3 text-sm text-terra">Retry categories</button>}
            {nav.map((item) => (
              <div key={item.label} className={`${dismissedDropdown === item.href ? '' : 'group/nav'} flex h-full items-center`} onMouseEnter={() => setDismissedDropdown(null)} onFocusCapture={() => setDismissedDropdown(null)} onClickCapture={event => closeDropdownOnNavigate(event, item.href)}>
                <Link href={item.href} className="flex items-center gap-1 whitespace-nowrap px-2 text-[14px] font-medium transition-colors group-hover/nav:text-terra">
                  {item.label}
                  {item.children.length > 0 && <ChevronDown size={14} className="transition-transform duration-300 group-hover/nav:rotate-180" />}
                </Link>
                {item.children.length > 0 && (
                  <div className={`invisible absolute top-full z-50 mt-4 opacity-0 transition-all duration-300 group-hover/nav:visible group-hover/nav:mt-0 group-hover/nav:opacity-100 group-focus-within/nav:visible group-focus-within/nav:mt-0 group-focus-within/nav:opacity-100 left-0 right-0`}>
                    <Dropdown item={item} />
                  </div>
                )}
              </div>
            ))}
            {extraLinks.map(item => <Link key={item.href} href={item.href} className="flex items-center whitespace-nowrap px-2 text-[14px] font-medium transition-colors hover:text-terra">{item.label}</Link>)}
            <div className={`${dismissedDropdown === 'discover' ? '' : 'group/nav'} relative flex h-full items-center`} onMouseEnter={() => setDismissedDropdown(null)} onFocusCapture={() => setDismissedDropdown(null)} onClickCapture={event => closeDropdownOnNavigate(event, 'discover')}>
              <button type="button" className="flex cursor-pointer items-center gap-1 whitespace-nowrap px-2 text-[14px] font-medium transition-colors group-hover/nav:text-terra group-focus-within/nav:text-terra">Discover <ChevronDown size={14} className="transition-transform duration-300 group-hover/nav:rotate-180 group-focus-within/nav:rotate-180" /></button>
              <ul className="invisible absolute right-0 top-full z-50 mt-4 min-w-48 rounded-b-xl border-t border-sand/70 bg-white p-6 opacity-0 shadow-xl transition-all duration-300 group-hover/nav:visible group-hover/nav:mt-0 group-hover/nav:opacity-100 group-focus-within/nav:visible group-focus-within/nav:mt-0 group-focus-within/nav:opacity-100">
                {discoverLinks.map(item => <li key={item.href}><Link href={item.href} className="block py-1.5 text-sm leading-relaxed text-muted transition-colors hover:text-terra">{item.label}</Link></li>)}
              </ul>
            </div>
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={() => setSearchOpen(true)} aria-label="Search" className="hover:text-terra cursor-pointer"><SearchIcon size={22} /></button>
            <Link href="/account" aria-label="My account" className="hidden hover:text-terra sm:block"><UserIcon size={24} /></Link>
            <a href="#" aria-label="Wishlist" className="relative hidden hover:text-terra sm:block">
              <HeartIcon size={24} />
              <span className="absolute -right-2 -top-2 grid h-[18px] w-[18px] place-items-center rounded-full bg-terra text-[10px] text-white">{wishlist.length}</span>
            </a>
            <button onClick={() => setCartOpen(true)} aria-label="Cart" className="relative hover:text-terra cursor-pointer">
              <CartIcon size={24} />
              <motion.span key={count} initial={{ scale: 0.4 }} animate={{ scale: 1 }} className="absolute -right-2 -top-2 grid h-[18px] w-[18px] place-items-center rounded-full bg-espresso text-[10px] text-white">{count}</motion.span>
            </button>
          </div>
        </div>
      </header>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div className="fixed inset-0 z-[60] bg-espresso/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSearchOpen(false)}>
            <motion.div initial={{ y: '-100%' }} animate={{ y: 0 }} exit={{ y: '-100%' }} transition={{ type: 'tween', duration: 0.4 }} className="bg-white py-12" onClick={(e) => e.stopPropagation()}>
              <div className="container-x relative">
                <button onClick={() => setSearchOpen(false)} className="absolute -top-6 right-6 cursor-pointer" aria-label="Close search"><X /></button>
                <h3 className="mb-6 text-center text-2xl">What are you looking for?</h3>
                <div className="mx-auto flex max-w-2xl items-center rounded-full border border-sand px-6">
                  <input autoFocus placeholder="Search our store" className="h-14 flex-1 bg-transparent outline-none" />
                  <SearchIcon size={20} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile off-canvas menu */}
      <AnimatePresence>
        {mobile && (
          <motion.div className="fixed inset-0 z-[60] min-[1440px]:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-espresso/50" onClick={() => setMobile(false)} />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="relative flex h-full w-[85%] max-w-[550px] flex-col overflow-y-auto bg-white">
              <div className="flex items-center justify-between px-5 py-5">
                <Logo />
                <button onClick={() => setMobile(false)} aria-label="Close menu" className="relative h-8 w-8 cursor-pointer transition-transform duration-300 hover:rotate-90 before:absolute before:left-1/2 before:top-1/2 before:h-0.5 before:w-5 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-45 before:bg-ink after:absolute after:left-1/2 after:top-1/2 after:h-0.5 after:w-5 after:-translate-x-1/2 after:-translate-y-1/2 after:-rotate-45 after:bg-ink" />
              </div>
              <ul className="border-t border-ink/20">
                {categoryError && <li><button onClick={refreshCategories} className="px-5 py-4 text-terra">Retry categories</button></li>}
                {mobileNav.map((item) => <MobileItem key={item.label} item={item} />)}
                <li className="border-b border-ink/20">
                  <a href="#" className="flex items-center gap-2.5 px-5 py-[15px] leading-none">
                    <HeartIcon size={20} /> Wishlist
                    <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-terra text-[10px] text-white">{wishlist.length}</span>
                  </a>
                </li>
              </ul>
              <div className="my-12 grid gap-4 px-5">
                <h4 className="text-lg">My account</h4>
                <Link href="/account" onClick={() => setMobile(false)} className="btn-dark w-full"><User size={16} /> Log in</Link>
                <Link href="/account?mode=register" onClick={() => setMobile(false)} className="btn-outline w-full">Register</Link>
              </div>
              <div className="mt-auto px-5 pb-8">
                <p className="flex items-center gap-2 text-sm text-muted">
                  <MapPin size={16} className="text-terra" /> {ADDRESS}
                </p>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
