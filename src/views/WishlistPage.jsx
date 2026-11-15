'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, Heart, LoaderCircle } from 'lucide-react'
import ProductPrice from '../components/ProductPrice'
import { useStore } from '../store'

export default function WishlistPage() {
  const { customer, setCustomer, wishlist, toggleWish, wishlistError } = useStore()
  const [access, setAccess] = useState('checking')
  const [sessionAttempt, setSessionAttempt] = useState(0)
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/auth/me', { cache: 'no-store', signal: controller.signal })
      .then(async response => {
        if (response.status === 401) {
          setCustomer(null)
          setAccess('guest')
          return
        }
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.message || 'Could not check your account.')
        setCustomer(data.customer)
        setAccess('member')
      })
      .catch(reason => {
        if (!controller.signal.aborted) {
          setError(reason.message || 'Could not check your account. Please try again.')
          setAccess('error')
        }
      })
    return () => controller.abort()
  }, [setCustomer, sessionAttempt])

  useEffect(() => {
    if (access === 'checking' || access === 'error') return
    const controller = new AbortController()
    setError('')
    const load = async () => {
      try {
        if (access === 'member') {
          const response = await fetch('/api/auth/wishlist/products', { cache: 'no-store', signal: controller.signal })
          const data = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(data.message || 'Could not load your wishlist.')
          setProducts(data.products || [])
        } else if (wishlist.length) {
          const results = await Promise.all(wishlist.map(async id => {
            const response = await fetch(`/api/products/${encodeURIComponent(id)}`, { cache: 'no-store', signal: controller.signal })
            if (!response.ok) return null
            const data = await response.json()
            return data.product || null
          }))
          if (!controller.signal.aborted) setProducts(results.filter(Boolean))
        } else setProducts([])
      } catch (reason) {
        if (!controller.signal.aborted) setError(reason.message || 'Could not load your wishlist.')
      }
    }
    void load()
    return () => controller.abort()
  }, [access, wishlist])

  const items = access === 'member' ? products.filter(product => wishlist.includes(product.id)) : products

  return <section className="bg-white pb-16 pt-8 md:pb-20 md:pt-12">
    <div className="container-x max-w-[1240px]">
      <nav aria-label="Breadcrumb" className="mb-7 flex items-center gap-2 text-xs text-muted"><Link href="/" className="hover:text-terra">Home</Link><span aria-hidden="true">/</span><span aria-current="page" className="text-ink">Wishlist</span></nav>
      <div className="mb-8 flex items-end justify-between gap-4 border-b border-sand pb-5">
        <div><p className="mb-1 text-sm font-medium text-terra">Your saved pieces</p><h1 className="font-heading text-3xl font-semibold md:text-4xl">My Wishlist</h1></div>
        <Link href="/shop" className="hidden items-center gap-2 text-sm font-medium text-espresso transition-colors hover:text-terra sm:inline-flex">Continue shopping <ArrowRight size={16} /></Link>
      </div>

      {access === 'checking' && <div role="status" className="flex min-h-48 items-center justify-center gap-3 text-sm text-muted"><LoaderCircle size={20} className="animate-spin text-terra" />Loading your wishlist</div>}
      {(error || wishlistError) && <p role="alert" className="mb-5 rounded-xl bg-peach p-4 text-sm text-espresso">{error || wishlistError}</p>}
      {access === 'error' && <button onClick={() => { setAccess('checking'); setError(''); setSessionAttempt(value => value + 1) }} className="btn-outline">Try again</button>}

      {access !== 'checking' && access !== 'error' && !error && !items.length && <div className="flex flex-col items-center rounded-2xl bg-cream px-6 py-14 text-center">
        <Heart size={34} strokeWidth={1.4} className="text-terra" />
        <h2 className="mt-4 font-heading text-xl font-semibold">Your wishlist is waiting</h2>
        <p className="mt-2 max-w-md text-sm text-muted">Tap the heart on anything you love and it will be saved here.</p>
        <Link href="/shop" className="btn-dark mt-6">Explore the collection <ArrowRight size={16} /></Link>
        {access === 'guest' && <Link href="/account?mode=login" className="mt-4 text-sm font-medium text-muted underline underline-offset-4 hover:text-terra">Sign in to sync your saved pieces</Link>}
      </div>}

      {items.length > 0 && <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">{items.map(product => <article key={product.id} className="relative min-w-0">
        <Link href={`/products/${product.slug || product.id}`} className="group block"><div className="overflow-hidden rounded-xl bg-cream"><img src={product.images?.[0] || product.image || '/images/categories/decor.jpg'} alt={product.name} className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105" /></div><h2 className="mt-3 text-sm font-medium group-hover:text-terra md:text-base">{product.name}</h2><div className="mt-2 text-sm"><ProductPrice product={product} /></div></Link>
        <button type="button" onClick={() => toggleWish(product.id)} aria-label={`Remove ${product.name} from wishlist`} className="absolute right-2 top-2 grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm transition-colors hover:bg-peach"><Heart size={18} className="fill-terra text-terra" /></button>
      </article>)}</div>}
    </div>
  </section>
}
