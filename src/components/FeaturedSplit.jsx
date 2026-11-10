'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowUpRight, Heart } from 'lucide-react'
import { useStore } from '../store'
import ProductPrice from './ProductPrice'
import { Reveal, SectionHeading } from './ui'

const photo = product => product.images?.[0] || product.image || '/images/categories/decor.jpg'

export default function FeaturedSplit({ products }) {
  const { wishlist, toggleWish } = useStore()
  const [selectedId, setSelectedId] = useState(null)
  const selected = products.find(product => product.id === selectedId) || products[0]

  return (
    <section className="section-py" aria-label="Featured collection">
      <div className="container-x">
        <SectionHeading sub="Featured collection" title="Find your new favorite" desc="Thoughtfully chosen pieces to bring your space together." right={<Link href="/shop/furniture" className="btn-outline">Shop collection <ArrowUpRight size={16} /></Link>} />
        {selected ? (
          <Reveal className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <div className="relative flex flex-col overflow-hidden rounded-2xl bg-peach p-5 md:p-8">
              <span className="absolute left-5 top-5 z-10 rounded-full bg-white px-4 py-2 text-xs font-medium text-terra md:left-8 md:top-8">In the spotlight</span>
              <button type="button" onClick={() => toggleWish(selected.id)} aria-label={`Save ${selected.name} to wishlist`} aria-pressed={wishlist.includes(selected.id)} className="absolute right-5 top-5 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white md:right-8 md:top-8">
                <Heart size={19} className={wishlist.includes(selected.id) ? 'fill-terra text-terra' : ''} />
              </button>
              <Link href={`/products/${selected.slug || selected.id}`} className="group flex flex-1 items-center justify-center py-8" aria-label={`View ${selected.name}`}>
                <img key={selected.id} src={photo(selected)} alt={selected.name} className="aspect-square max-h-[380px] w-full rounded-xl object-contain transition-transform duration-500 group-hover:scale-[1.03]" />
              </Link>
              <div className="flex items-end justify-between gap-4 rounded-xl bg-white p-5">
                <div className="min-w-0">
                  <span className="mb-2 block text-[11px] uppercase tracking-widest text-muted">Selected for your home</span>
                  <Link href={`/products/${selected.slug || selected.id}`} className="font-heading text-xl font-semibold hover:text-terra">{selected.name}</Link>
                  <div className="mt-2 text-sm"><ProductPrice product={selected} /></div>
                </div>
                <Link href={`/products/${selected.slug || selected.id}`} aria-label={`Shop ${selected.name}`} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-espresso text-white transition-colors hover:bg-terra"><ArrowUpRight size={22} /></Link>
              </div>
            </div>
            <div className="min-w-0 rounded-2xl border border-sand bg-white p-5 md:p-7">
              <div className="mb-6 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">Discover the collection</h3>
                <span className="text-xs text-muted">{products.length} pieces</span>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                {products.map(product => {
                  const active = selected.id === product.id
                  return (
                    <div key={product.id} className="min-w-0">
                      <button type="button" onClick={() => setSelectedId(product.id)} aria-label={`Preview ${product.name}`} aria-pressed={active} className={`group relative block w-full cursor-pointer overflow-hidden rounded-xl border-2 p-2 transition-colors ${active ? 'border-terra bg-peach' : 'border-transparent bg-cream hover:border-sand'}`}>
                        <img src={photo(product)} alt={product.name} loading="lazy" className="aspect-square w-full object-contain transition-transform duration-500 group-hover:scale-105" />
                        {active && <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-terra px-3 py-1 text-[10px] text-white">Selected</span>}
                      </button>
                      <Link href={`/products/${product.slug || product.id}`} className="mt-3 block text-sm font-medium leading-snug hover:text-terra">{product.name}</Link>
                      <div className="mt-1 text-xs text-muted"><ProductPrice product={product} /></div>
                    </div>
                  )
                })}
              </div>
              <p className="mt-6 border-t border-sand pt-4 text-xs leading-relaxed text-muted">Choose a piece to take a closer look.</p>
            </div>
          </Reveal>
        ) : <p className="rounded-2xl bg-peach p-8 text-muted">Featured pieces will be available soon.</p>}
      </div>
    </section>
  )
}
