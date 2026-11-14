'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowUpRight, Search } from 'lucide-react'
import { formatPrice } from '../catalog'

export default function ProductSearch({ onSelect, categories = [] }) {
  const [query, setQuery] = useState('')
  const [state, setState] = useState({ query: '', products: [], loading: false, error: false })
  const term = query.trim()
  useEffect(() => {
    if (term.length < 2) return
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setState({ query: term, products: [], loading: true, error: false })
      try {
        const response = await fetch(`/api/products?${new URLSearchParams({ q: term, pageSize: '6' })}`, { signal: controller.signal, cache: 'no-store' })
        if (!response.ok) throw new Error('Search unavailable')
        const { products } = await response.json()
        if (!controller.signal.aborted) setState({ query: term, products, loading: false, error: false })
      } catch {
        if (!controller.signal.aborted) setState({ query: term, products: [], loading: false, error: true })
      }
    }, 250)
    return () => { clearTimeout(timer); controller.abort() }
  }, [term])
  const furniture = categories.find(category => category.kind === 'category' && !category.parentSlug && category.slug === 'furniture')
  const suggestions = furniture
    ? categories.filter(category => category.kind === 'category' && category.parentSlug === furniture.slug && category.showInMenu).slice(0, 6)
    : categories.filter(category => category.kind === 'category' && !category.parentSlug && category.showInMenu).slice(0, 6)
  return <div className="mx-auto w-full max-w-6xl">
    <label htmlFor="product-search" className="sr-only">Search products</label>
    <div className="flex items-center gap-4 border-b border-terra pb-3 sm:gap-6">
      <Search size={28} aria-hidden="true" className="shrink-0 text-ink sm:h-9 sm:w-9" />
      <input id="product-search" autoFocus type="search" value={query} maxLength={100} onChange={event => setQuery(event.target.value)} placeholder="Search for products, categories..." className="h-12 min-w-0 flex-1 bg-transparent text-xl text-ink outline-none placeholder:text-muted/60 sm:h-16 sm:text-4xl" aria-describedby="product-search-status" />
    </div>
    <div id="product-search-status" role="status" className="mt-3 min-h-5 text-sm text-muted">{term.length >= 2 ? state.query !== term || state.loading ? 'Searching…' : state.error ? 'Search is temporarily unavailable. Please try again.' : !state.products.length ? 'No matching products.' : `${state.products.length} suggestions` : ''}</div>
    {term.length < 2 && suggestions.length > 0 && <div className="mt-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Quick search</p>
      <div className="flex flex-wrap gap-2.5 sm:gap-4">{suggestions.map(category => <Link key={category.slug} href={`/shop/${category.slug}`} onClick={onSelect} className="rounded-full border border-sand px-5 py-2.5 text-sm text-ink transition-colors hover:border-terra hover:bg-terra hover:text-white sm:px-7 sm:py-3">{category.name}</Link>)}</div>
    </div>}
    {term.length >= 2 && state.query === term && !state.loading && state.products.length > 0 && <ul className="mt-2 max-h-[50vh] overflow-y-auto rounded-xl border border-sand bg-white px-3">{state.products.map(product => <li key={product.id} className="border-b border-sand last:border-0"><Link href={`/products/${product.slug || product.id}`} onClick={onSelect} className="flex items-center gap-3 py-3 text-sm transition-colors hover:text-terra">
      <img src={product.images?.[0] || product.image || '/images/categories/decor.jpg'} alt="" className="h-14 w-14 shrink-0 rounded-lg bg-cream object-cover" />
      <span className="min-w-0 flex-1 truncate font-medium">{product.name}</span>
      <span className="shrink-0 text-muted">{formatPrice(product.amount ?? product.price, product.currency)}</span>
      <ArrowUpRight size={16} className="shrink-0 text-muted" aria-hidden="true" />
    </Link></li>)}</ul>}
  </div>
}
