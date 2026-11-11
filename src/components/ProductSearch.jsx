'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { formatPrice } from '../catalog'

export default function ProductSearch({ onSelect }) {
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
  return <div className="mx-auto max-w-2xl">
    <label htmlFor="product-search" className="sr-only">Search products</label>
    <input id="product-search" autoFocus type="search" value={query} maxLength={100} onChange={event => setQuery(event.target.value)} placeholder="Search our store" className="h-14 w-full rounded-full border border-sand bg-transparent px-6 outline-none focus:border-terra" aria-describedby="product-search-status" />
    <div id="product-search-status" role="status" className="mt-3 text-sm text-muted">{term.length < 2 ? 'Enter at least two characters.' : state.query !== term || state.loading ? 'Searching…' : state.error ? 'Search is temporarily unavailable. Please try again.' : !state.products.length ? 'No matching products.' : `${state.products.length} suggestions`}</div>
    {term.length >= 2 && state.query === term && !state.loading && <ul className="mt-3 max-h-[50vh] overflow-y-auto divide-y divide-sand">{state.products.map(product => <li key={product.id}><Link href={`/products/${product.slug || product.id}`} onClick={onSelect} className="flex items-center justify-between gap-4 py-3 text-sm hover:text-terra"><span>{product.name}</span><span className="shrink-0">{formatPrice(product.amount)}</span></Link></li>)}</ul>}
  </div>
}
