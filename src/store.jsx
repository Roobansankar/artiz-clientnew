'use client'

import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { firstAvailableVariant, productOption } from './catalog'

const StoreCtx = createContext(null)

export function StoreProvider({ children }) {
  const [cart, setCart] = useState([])
  const [cartLoaded, setCartLoaded] = useState(false)
  const [wishlist, setWishlist] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [quickView, setQuickView] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [wishlistError, setWishlistError] = useState('')
  const wishRef = useRef([])
  const ownerRef = useRef(null)
  const wishQueue = useRef(Promise.resolve())
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('artiz-cart-v1') || '[]')
      if (Array.isArray(saved)) setCart(saved.filter(item => item && typeof item.id === 'string' && Number.isFinite(item.qty) && item.qty > 0 && item.qty <= 10 && Number.isFinite(item.price)))
    } catch { /* A damaged cart starts empty. */ }
    setCartLoaded(true)
  }, [])
  useEffect(() => { if (cartLoaded) { try { localStorage.setItem('artiz-cart-v1', JSON.stringify(cart)) } catch {} } }, [cart, cartLoaded])
  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/auth/me', { cache: 'no-store', signal: controller.signal }).then(r => r.ok ? r.json() : Promise.reject()).then(data => setCustomer(data.customer)).catch(() => {})
    return () => controller.abort()
  }, [])
  useEffect(() => {
    const owner = customer?.id || null
    const previousOwner = ownerRef.current
    ownerRef.current = owner
    setWishlistError('')
    if (!owner) {
      if (previousOwner) { wishRef.current = []; setWishlist([]) }
      return
    }
    const guestIds = previousOwner ? [] : wishRef.current.filter(id => typeof id === 'string')
    wishRef.current = []
    setWishlist([])
    wishQueue.current = (async () => {
      try {
        const response = await fetch('/api/auth/wishlist', { method: guestIds.length ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json' }, ...(guestIds.length ? { body: JSON.stringify({ productIds: guestIds }) } : {}), cache: 'no-store' })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Could not load your wishlist.')
        if (ownerRef.current === owner) { wishRef.current = data.productIds; setWishlist(data.productIds) }
      } catch (error) { if (ownerRef.current === owner) setWishlistError(error.message) }
    })()
  }, [customer?.id])

  const addToCart = (product, qty = 1) => {
    const live = product.currency === 'INR'
    const variantIndex = live ? (product.variantIndex === undefined ? firstAvailableVariant(product) : product.variantIndex) : null
    const option = live ? productOption(product, variantIndex) : null
    const stock = live ? option.stock : product.stock ?? (product.available === false ? 0 : Infinity)
    const limit = live ? Math.min(10, stock) : stock
    if (limit <= 0) return
    const lineKey = variantIndex == null ? product.id : `${product.id}:variant-${variantIndex}`
    const item = { ...product, lineKey, variantIndex, stock, ...(option && { price: option.price, compare: option.mrp || 0, selectedColor: option.color }) }
    const amount = Math.max(1, Math.floor(Number(qty) || 1))
    setCart((c) => {
      const found = c.find((i) => (i.lineKey ?? i.id) === lineKey)
      if (found) return c.map((i) => ((i.lineKey ?? i.id) === lineKey ? { ...item, qty: Math.min(limit, i.qty + amount) } : i))
      return [...c, { ...item, qty: Math.min(limit, amount) }]
    })
    setCartOpen(true)
  }
  const updateQty = (id, qty) =>
    setCart((c) => (qty <= 0 ? c.filter((i) => (i.lineKey ?? i.id) !== id) : c.map((i) => ((i.lineKey ?? i.id) === id ? { ...i, qty: Math.max(1, Math.min(i.currency === 'INR' ? 10 : Infinity, i.stock ?? Infinity, Math.floor(Number(qty) || 1))) } : i))))
  const toggleWish = id => {
    const owner = ownerRef.current
    if (!owner) {
      wishRef.current = wishRef.current.includes(id) ? wishRef.current.filter(value => value !== id) : [...wishRef.current, id]
      setWishlist(wishRef.current)
      return
    }
    wishQueue.current = wishQueue.current.then(async () => {
      if (ownerRef.current !== owner) return
      setWishlistError('')
      try {
        const removing = wishRef.current.includes(id)
        const response = await fetch(`/api/auth/wishlist${removing ? `/${encodeURIComponent(id)}` : ''}`, { method: removing ? 'DELETE' : 'POST', headers: { 'Content-Type': 'application/json' }, body: removing ? undefined : JSON.stringify({ productIds: [String(id)] }) })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Could not update your wishlist.')
        if (ownerRef.current === owner) { wishRef.current = data.productIds; setWishlist(data.productIds) }
      } catch (error) { if (ownerRef.current === owner) setWishlistError(error.message) }
    })
  }

  return (
    <StoreCtx.Provider
      value={{ cart, cartLoaded, clearCart: () => setCart([]), addToCart, updateQty, cartOpen, setCartOpen, wishlist, toggleWish, quickView, setQuickView, customer, setCustomer, wishlistError }}
    >
      {children}
    </StoreCtx.Provider>
  )
}

export const useStore = () => useContext(StoreCtx)
