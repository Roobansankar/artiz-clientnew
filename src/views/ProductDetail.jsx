'use client'

import Link from 'next/link'
import { useId, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ChevronRight, Heart, Maximize2, Minus, Plus, Share2, X } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Keyboard } from 'swiper/modules'
import { firstAvailableVariant, formatPrice, productOption } from '../catalog'
import { useStore } from '../store'
import { CartIcon } from '../components/icons'

function ProductAccordion({ title, children }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const buttonId = useId()
  return (
    <section className="border-b border-sand">
      <h2><button id={buttonId} type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-controls={panelId} className="flex w-full items-center justify-between gap-4 py-5 text-left text-sm font-medium transition-colors hover:text-terra">
        {title}
        <span aria-hidden="true" className="relative h-4 w-4 shrink-0">
          <Plus size={16} className={`absolute inset-0 transition-all duration-300 motion-reduce:transition-none ${open ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`} />
          <Minus size={16} className={`absolute inset-0 transition-opacity duration-300 motion-reduce:transition-none ${open ? 'opacity-100' : 'opacity-0'}`} />
        </span>
      </button></h2>
      <div id={panelId} role="region" aria-labelledby={buttonId} aria-hidden={!open} inert={!open} className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out motion-reduce:transition-none ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="min-h-0 overflow-hidden"><div className="pb-5 text-sm leading-relaxed text-muted">{children}</div></div>
      </div>
    </section>
  )
}

export default function ProductDetail({ product, category, related }) {
  const { cart, addToCart, wishlist, toggleWish } = useStore()
  const [selected, setSelected] = useState(() => firstAvailableVariant(product))
  const [quantity, setQuantity] = useState(1)
  const [photo, setPhoto] = useState(0)
  const [shareStatus, setShareStatus] = useState('')
  const [shareLink, setShareLink] = useState('')
  const swiper = useRef(null)
  const zoom = useRef(null)
  const images = product.images?.length ? product.images : [product.img]
  const variants = product.variants || []
  const option = productOption(product, selected)
  const colors = [...new Set(variants.map(variant => variant.color).filter(Boolean))]
  const inCart = cart.find(item => item.id === product.id && (item.variantIndex ?? null) === selected)?.qty || 0
  const remaining = Math.max(0, Math.min(10 - inCart, option.stock - inCart))
  const canBuy = remaining > 0
  const discount = option.mrp > option.price ? Math.round((1 - option.price / option.mrp) * 100) : 0
  const wished = wishlist.includes(product.id)
  const details = [
    ['Category', category?.name], ['Material', product.material], ['Dimensions', product.dimensions],
    ['Size', option.size], ['Seater', option.seater], ['Fabric', option.fabric],
  ].filter(([, value]) => value)

  function chooseColor(color) {
    const available = variants.findIndex(variant => variant.color === color && variant.stock > 0)
    setSelected(available >= 0 ? available : variants.findIndex(variant => variant.color === color))
    setQuantity(1)
  }

  function add() {
    if (!canBuy) return
    addToCart({ ...product, variantIndex: selected, price: option.price, compare: option.mrp || 0, stock: option.stock, selectedColor: option.color, img: images[0] }, Math.min(quantity, remaining))
  }

  async function share() {
    const url = window.location.href
    try { await navigator.clipboard.writeText(url); setShareStatus('Product link copied'); setShareLink('') }
    catch { setShareLink(url); setShareStatus('Copy the product link below') }
  }

  return (
    <>
      <section className="bg-white pb-14 pt-6 md:pb-20 md:pt-8">
        <div className="container-x">
          <nav aria-label="Breadcrumb" className="mb-7 flex flex-wrap items-center gap-2 text-xs text-muted md:mb-9">
            <Link href="/" className="hover:text-terra">Home</Link><ChevronRight size={12} aria-hidden="true" />
            {category && <><Link href={`/shop/${category.slug}`} className="hover:text-terra">{category.name}</Link><ChevronRight size={12} aria-hidden="true" /></>}
            <span aria-current="page" className="text-ink">{product.title}</span>
          </nav>

          <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12 xl:gap-16">
            <section aria-label="Product gallery" className="min-w-0">
              <div className="flex min-w-0 flex-col-reverse gap-4 sm:flex-row">
                {images.length > 1 && <div className="flex shrink-0 gap-3 overflow-auto sm:max-h-[600px] sm:w-[72px] sm:flex-col" aria-label="Choose product image">
                  {images.map((image, index) => <button key={`${image}-${index}`} onClick={() => swiper.current?.slideTo(index)} aria-label={`Show image ${index + 1}`} aria-pressed={photo === index} className={`h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg border bg-cream transition-colors ${photo === index ? 'border-terra ring-1 ring-terra' : 'border-sand hover:border-terra'}`}><img src={image} alt="" className="h-full w-full object-cover" /></button>)}
                </div>}
                <div className="relative min-w-0 flex-1 overflow-hidden rounded-2xl bg-cream">
                  <Swiper modules={[Keyboard]} keyboard={{ enabled: true, onlyInViewport: true }} onSwiper={instance => { swiper.current = instance }} onSlideChange={instance => setPhoto(instance.activeIndex)} className="w-full">
                    {images.map((image, index) => <SwiperSlide key={`${image}-${index}`}><button onClick={() => zoom.current?.showModal()} aria-label={`Enlarge ${product.title}, image ${index + 1}`} className="block aspect-[16/15] w-full cursor-zoom-in"><img src={image} alt={`${product.title}, view ${index + 1}`} loading={index === 0 ? 'eager' : 'lazy'} className="h-full w-full object-cover" /></button></SwiperSlide>)}
                  </Swiper>
                  {discount > 0 && <span className="absolute left-4 top-4 z-10 rounded-full bg-terra px-3 py-1 text-xs font-medium text-white">Save {discount}%</span>}
                  <button onClick={() => zoom.current?.showModal()} aria-label="Zoom product image" className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm hover:text-terra"><Maximize2 size={16} /></button>
                  {images.length > 1 && <div className="absolute inset-x-4 bottom-4 z-10 flex items-center justify-between">
                    <button onClick={() => swiper.current?.slidePrev()} disabled={photo === 0} className="nav-circle h-9 w-9 disabled:opacity-30" aria-label="Previous product image"><ArrowLeft size={15} /></button>
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs">{photo + 1} / {images.length}</span>
                    <button onClick={() => swiper.current?.slideNext()} disabled={photo === images.length - 1} className="nav-circle h-9 w-9 disabled:opacity-30" aria-label="Next product image"><ArrowRight size={15} /></button>
                  </div>}
                </div>
              </div>
              <p className="mt-4 text-center text-xs text-muted">Swipe to explore · Click the image for a closer look</p>
            </section>

            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
                {category && <Link href={`/shop/${category.slug}`} className="font-medium uppercase tracking-[0.16em] text-muted hover:text-terra">{category.name}</Link>}
                {product.isNewArrival && <span className="rounded bg-peach px-2 py-1 font-medium text-terra">New arrival</span>}
              </div>
              <h1 className="font-heading text-[30px] font-semibold leading-[1.15] tracking-tight md:text-[40px]">{product.title}</h1>
              <div className="mt-5 flex flex-wrap items-center gap-3" aria-live="polite">
                <span className={`text-2xl font-semibold md:text-[28px] ${discount ? 'text-terra' : 'text-ink'}`}>{formatPrice(option.price)}</span>
                {discount > 0 && <><s className="text-lg text-muted">{formatPrice(option.mrp)}</s><span className="rounded-full bg-peach px-3 py-1 text-xs font-medium text-terra">{discount}% off</span></>}
              </div>
              <p className={`mt-4 flex items-center gap-2 text-sm ${option.stock > 0 ? 'text-[#527254]' : 'text-muted'}`} aria-live="polite"><span className={`h-2 w-2 rounded-full ${option.stock > 0 ? 'bg-[#527254]' : 'bg-muted'}`} />{option.stock > 0 ? `${option.stock} in stock` : 'Currently out of stock'}</p>
              <p className="mt-5 whitespace-pre-line text-[15px] leading-relaxed text-muted">{product.description}</p>

              {colors.length > 0 && <fieldset className="mt-7 border-0 p-0"><legend className="mb-3 text-sm font-medium">Color <span className="ml-2 font-normal text-muted">{option.color}</span></legend><div className="flex flex-wrap gap-3">
                {colors.map(color => <button key={color} type="button" onClick={() => chooseColor(color)} aria-label={`Choose color ${color}`} aria-pressed={option.color === color} title={color} className={`relative grid h-9 w-9 place-items-center rounded-full border-4 border-white outline outline-1 outline-offset-1 ${option.color === color ? 'outline-ink' : 'outline-sand hover:outline-terra'}`} style={{ backgroundColor: color }}>{option.color === color && <Check size={14} className="rounded-full bg-white/90 p-0.5 text-ink" />}</button>)}
              </div></fieldset>}

              {details.length > 0 && <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-3 rounded-xl bg-cream p-4">{details.filter(([label]) => label !== 'Category').map(([label, value]) => <div key={label}><dt className="text-xs text-muted">{label}</dt><dd className="mt-1 text-sm font-medium">{value}</dd></div>)}</dl>}

              <div className="mt-7 border-t border-sand pt-6">
                <span className="mb-3 block text-sm font-medium">Quantity</span>
                <div className="flex gap-3">
                  <div className="inline-flex h-13 shrink-0 items-center rounded-full border border-sand">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1 || !canBuy} aria-label="Decrease quantity" className="p-3 disabled:opacity-30"><Minus size={16} /></button>
                    <output className="w-8 text-center text-sm" aria-label="Quantity">{Math.min(quantity, Math.max(1, remaining))}</output>
                    <button onClick={() => setQuantity(q => Math.min(remaining, q + 1))} disabled={!canBuy || quantity >= remaining} aria-label="Increase quantity" className="p-3 disabled:opacity-30"><Plus size={16} /></button>
                  </div>
                  <button onClick={add} disabled={!canBuy} className="btn-dark min-w-0 flex-1 px-4 disabled:cursor-not-allowed disabled:bg-sand disabled:text-muted"><CartIcon size={19} />{canBuy ? 'Add to cart' : option.stock > 0 ? 'Cart limit reached' : 'Out of stock'}</button>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <button onClick={() => toggleWish(product.id)} aria-pressed={wished} className={`flex items-center gap-2 text-sm transition-colors hover:text-terra ${wished ? 'text-terra' : 'text-muted'}`}><Heart size={17} fill={wished ? 'currentColor' : 'none'} />{wished ? 'Saved to wishlist' : 'Add to wishlist'}</button>
                  <button onClick={share} className="flex items-center gap-2 text-sm text-muted hover:text-terra"><Share2 size={16} />Share</button>
                </div>
                <p role="status" className="mt-2 text-xs text-muted">{shareStatus}</p>
                {shareLink && <input readOnly value={shareLink} onFocus={event => event.target.select()} aria-label="Product link to copy" className="mt-2 w-full rounded border border-sand px-3 py-2 text-sm" />}
              </div>

              <div className="mt-5 border-t border-sand">
                <ProductAccordion title="Product details"><p className="whitespace-pre-line">{product.details || product.description}</p><p className="mt-3 text-xs">Product reference: {product.id}</p></ProductAccordion>
                <ProductAccordion title="Description"><p className="whitespace-pre-line">{product.description}</p></ProductAccordion>
                <ProductAccordion title="Additional information">
                  <dl className="divide-y divide-sand">{details.map(([label, value]) => <div key={label} className="grid grid-cols-[100px_1fr] gap-4 py-3 text-sm"><dt className="font-medium text-ink">{label}</dt><dd>{value}</dd></div>)}</dl>
                  {!details.length && <p>See the product description for details.</p>}
                </ProductAccordion>
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && <section className="bg-white py-12 md:py-18"><div className="container-x"><div className="mb-8 flex items-end justify-between gap-4"><div><span className="subtitle">A little more inspiration</span><h2 className="h2-title">You may also like</h2></div>{category && <Link href={`/shop/${category.slug}`} className="hidden text-sm underline underline-offset-4 hover:text-terra sm:block">Explore collection</Link>}</div><div className="grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">{related.map(item => <Link key={item.id} href={`/products/${item.slug || item.id}`} className="group min-w-0"><div className="aspect-square overflow-hidden rounded-xl bg-cream"><img src={item.img} alt={item.title} loading="lazy" className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105" /></div><p className="mt-4 text-xs text-muted">{item.vendor}</p><h3 className="mt-1 text-sm font-medium group-hover:text-terra md:text-base">{item.title}</h3><p className="mt-2 text-sm font-semibold">{formatPrice(item.price)}</p></Link>)}</div></div></section>}

      <dialog ref={zoom} onClick={event => { if (event.target === event.currentTarget) zoom.current?.close() }} className="fixed inset-0 m-auto max-h-[92dvh] w-[min(94vw,1000px)] max-w-none rounded-2xl bg-cream p-5 backdrop:bg-black/70" aria-label={`Enlarged image of ${product.title}`}>
        <div className="flex items-center justify-between gap-4"><p className="text-sm font-medium">{product.title}</p><button onClick={() => zoom.current?.close()} aria-label="Close image viewer" className="nav-circle h-9 w-9"><X size={18} /></button></div>
        <img src={images[photo]} alt={`${product.title}, enlarged view ${photo + 1}`} className="mx-auto h-[65dvh] w-full object-contain" />
        {images.length > 1 && <div className="flex items-center justify-center gap-5"><button onClick={() => swiper.current?.slideTo((photo - 1 + images.length) % images.length)} className="nav-circle" aria-label="Previous enlarged image"><ArrowLeft size={16} /></button><span className="text-xs">{photo + 1} / {images.length}</span><button onClick={() => swiper.current?.slideTo((photo + 1) % images.length)} className="nav-circle" aria-label="Next enlarged image"><ArrowRight size={16} /></button></div>}
      </dialog>
    </>
  )
}
