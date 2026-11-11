'use client'

import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { firstAvailableVariant, productOption } from './catalog'

const StoreCtx = createContext(null)
const CART_KEY = 'artiz-cart-v1'
const CART_IMPORTED_KEY = 'artiz-cart-imported-v1'
const WISHLIST_KEY = 'artiz-wishlist-v1'
const MAX_PER_LINE = 10

// Guests can use the hearts before signing in. Their picks live in this browser
// and are merged into the account on the next sign-in.
function readGuestWishlist() {
  try {
    const saved = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]')
    return Array.isArray(saved) ? [...new Set(saved.filter(id => typeof id === 'string'))] : []
  } catch { return [] }
}
function saveGuestWishlist(ids) {
  try { localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids)) } catch {}
}

// Server cart lines are shaped by the API; the drawer consumes this flat shape.
function cartLine(item) {
  const variantIndex = item.variantIndex ?? null
  return {
    id: item.productId,
    itemId: item.id,
    productId: item.productId,
    lineKey: variantIndex == null ? item.productId : `${item.productId}:variant-${variantIndex}`,
    variantIndex,
    title: item.name,
    name: item.name,
    img: item.image,
    images: item.image ? [item.image] : [],
    price: item.price,
    amount: item.price,
    compare: item.compare || 0,
    currency: item.currency || 'INR',
    stock: item.stock,
    qty: item.quantity,
    selectedColor: item.selectedColor || '',
    priceChanged: Boolean(item.priceChanged),
  }
}

const lineId = item => item.lineKey ?? item.id

export function StoreProvider({ children }) {
  const [cart, setCart] = useState([])
  const [cartLoaded, setCartLoaded] = useState(false)
  const [cartError, setCartError] = useState('')
  const [wishlist, setWishlist] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [quickView, setQuickView] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [wishlistError, setWishlistError] = useState('')
  const cartRef = useRef([])
  const cartQueue = useRef(Promise.resolve())
  const wishRef = useRef([])
  const ownerRef = useRef(null)
  const wishQueue = useRef(Promise.resolve())
  const wishSeq = useRef(0)

  const commit = lines => {
    cartRef.current = lines
    setCart(lines)
    try { localStorage.setItem(CART_KEY, JSON.stringify(lines)) } catch {}
  }

  // Demo items that are not part of the live INR catalog stay local only.
  const localOnly = () => cartRef.current.filter(item => item.currency !== 'INR')
  const applyServerCart = data => commit([...(data?.items || []).map(cartLine), ...localOnly()])

  const cartApi = (path = '', method = 'GET', body) => fetch(`/api/auth/cart${path}`, {
    method,
    cache: 'no-store',
    ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  })

  async function loadCart() {
    try {
      const response = await cartApi()
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Could not load your cart.')
      let serverCart = data.cart
      // One-time import of a cart saved by the old localStorage-only build.
      if (!localStorage.getItem(CART_IMPORTED_KEY)) {
        const cached = cartRef.current.filter(item => item.currency === 'INR' && typeof item.id === 'string')
        if (!(serverCart?.items || []).length && cached.length) {
          for (const item of cached) {
            await cartApi('/items', 'POST', { productId: item.id, variantIndex: item.variantIndex ?? null, quantity: Math.min(MAX_PER_LINE, item.qty) })
          }
          const imported = await cartApi()
          const importedData = await imported.json().catch(() => ({}))
          if (imported.ok) serverCart = importedData.cart
        }
        localStorage.setItem(CART_IMPORTED_KEY, '1')
      }
      applyServerCart(serverCart)
      setCartError('')
    } catch (error) {
      setCartError(error.message || 'Could not load your cart.')
    } finally {
      setCartLoaded(true)
    }
  }

  // Mutations are queued so rapid taps cannot overwrite each other out of order.
  const enqueue = task => {
    cartQueue.current = cartQueue.current.then(task).catch(() => {})
    return cartQueue.current
  }
  const syncCart = async request => {
    try {
      const response = await request()
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Could not update your cart.')
      applyServerCart(data.cart)
      setCartError('')
      return true
    } catch (error) {
      await loadCart()
      setCartError(error.message || 'Could not update your cart.')
      return false
    }
  }

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]')
      if (Array.isArray(saved)) {
        const lines = saved.filter(item => item && typeof item.id === 'string' && Number.isFinite(item.qty) && item.qty > 0 && item.qty <= MAX_PER_LINE && Number.isFinite(item.price))
        cartRef.current = lines
        setCart(lines)
      }
    } catch { /* A damaged cart starts empty. */ }
    void loadCart()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/auth/me', { cache: 'no-store', signal: controller.signal }).then(r => r.ok ? r.json() : Promise.reject()).then(data => setCustomer(data.customer)).catch(() => {})
    return () => controller.abort()
  }, [])

  // Signing in merges the guest cart on the server, so reload it when the account changes.
  const loadedFor = useRef(undefined)
  useEffect(() => {
    const owner = customer?.id || null
    if (loadedFor.current === owner) return
    loadedFor.current = owner
    if (!cartLoaded) return
    enqueue(loadCart)
  }, [customer?.id, cartLoaded])

  useEffect(() => {
    const owner = customer?.id || null
    const previousOwner = ownerRef.current
    ownerRef.current = owner
    setWishlistError('')
    if (!owner) {
      // Signing out clears the account list; a fresh guest keeps this browser's picks.
      if (previousOwner) { wishRef.current = []; setWishlist([]) }
      else { const guest = readGuestWishlist(); wishRef.current = guest; setWishlist(guest) }
      return
    }
    // A guest's saved pieces are merged once, then removed from this browser so a
    // different account does not inherit them.
    const guestIds = previousOwner ? [] : readGuestWishlist()
    wishRef.current = []
    setWishlist([])
    wishQueue.current = (async () => {
      try {
        const merge = guestIds.length > 0
        const response = await fetch('/api/auth/wishlist', { method: merge ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json' }, ...(merge ? { body: JSON.stringify({ productIds: guestIds }) } : {}), cache: 'no-store' })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Could not load your wishlist.')
        if (ownerRef.current === owner) { wishRef.current = data.productIds; setWishlist(data.productIds) }
        if (merge) saveGuestWishlist([])
      } catch (error) { if (ownerRef.current === owner) setWishlistError(error.message) }
    })()
  }, [customer?.id])

  const addToCart = (product, qty = 1, { openDrawer = true } = {}) => {
    const live = product.currency === 'INR'
    const variantIndex = live ? (product.variantIndex === undefined ? firstAvailableVariant(product) : product.variantIndex) : null
    const option = live ? productOption(product, variantIndex) : null
    const stock = live ? option.stock : product.stock ?? (product.available === false ? 0 : Infinity)
    const limit = live ? Math.min(MAX_PER_LINE, stock) : stock
    if (limit <= 0) return false
    const lineKey = variantIndex == null ? product.id : `${product.id}:variant-${variantIndex}`
    const item = { ...product, lineKey, variantIndex, stock, ...(option && { price: option.price, compare: option.mrp || 0, selectedColor: option.color }) }
    const amount = Math.max(1, Math.floor(Number(qty) || 1))
    const next = [...cartRef.current]
    const found = next.findIndex(i => lineId(i) === lineKey)
    if (found >= 0) next[found] = { ...next[found], ...item, qty: Math.min(limit, next[found].qty + amount) }
    else next.push({ ...item, qty: Math.min(limit, amount) })
    commit(next)
    if (openDrawer) setCartOpen(true)
    if (live) return enqueue(() => syncCart(() => cartApi('/items', 'POST', { productId: product.id, variantIndex: variantIndex ?? null, quantity: amount })))
    return true
  }

  const updateQty = (id, qty) => {
    const current = cartRef.current.find(i => lineId(i) === id)
    if (!current) return
    const requested = Math.floor(Number(qty) || 0)
    if (requested <= 0) {
      commit(cartRef.current.filter(i => lineId(i) !== id))
      if (current.currency === 'INR') {
        enqueue(() => current.itemId ? syncCart(() => cartApi(`/items/${current.itemId}`, 'DELETE')) : loadCart())
      }
      return
    }
    if (current.currency !== 'INR') {
      const limit = Number.isFinite(current.stock) ? Math.max(1, Math.min(MAX_PER_LINE, current.stock)) : MAX_PER_LINE
      commit(cartRef.current.map(i => lineId(i) === id ? { ...i, qty: Math.min(limit, requested) } : i))
      return
    }
    const limit = Math.max(1, Math.min(MAX_PER_LINE, current.stock ?? MAX_PER_LINE))
    const nextQty = Math.min(limit, requested)
    commit(cartRef.current.map(i => lineId(i) === id ? { ...i, qty: nextQty } : i))
    enqueue(() => current.itemId
      ? syncCart(() => cartApi(`/items/${current.itemId}`, 'PATCH', { quantity: nextQty }))
      : syncCart(() => cartApi('/items', 'POST', { productId: current.id, variantIndex: current.variantIndex ?? null, quantity: nextQty })))
  }

  const clearCart = () => {
    commit([])
    enqueue(() => syncCart(() => cartApi('', 'DELETE')))
  }

  const toggleWish = id => {
    const owner = ownerRef.current
    const removing = wishRef.current.includes(id)
    // The heart flips immediately; the server is the final word.
    const optimistic = removing ? wishRef.current.filter(value => value !== id) : [...wishRef.current, id]
    wishRef.current = optimistic
    setWishlist(optimistic)
    if (!owner) {
      saveGuestWishlist(optimistic)
      return
    }
    setWishlistError('')
    const seq = ++wishSeq.current
    wishQueue.current = wishQueue.current.then(async () => {
      if (ownerRef.current !== owner) return
      try {
        const response = await fetch(`/api/auth/wishlist${removing ? `/${encodeURIComponent(id)}` : ''}`, { method: removing ? 'DELETE' : 'POST', headers: { 'Content-Type': 'application/json' }, body: removing ? undefined : JSON.stringify({ productIds: [String(id)] }) })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Could not update your wishlist.')
        // Only the newest toggle may overwrite the list; older replies are stale.
        if (ownerRef.current === owner && seq === wishSeq.current) { wishRef.current = data.productIds; setWishlist(data.productIds) }
      } catch (error) {
        if (ownerRef.current !== owner) return
        // No newer toggle happened, so the optimistic change can be rolled back.
        if (seq === wishSeq.current) {
          const reverted = removing ? [...wishRef.current, id] : wishRef.current.filter(value => value !== id)
          wishRef.current = reverted
          setWishlist(reverted)
        }
        setWishlistError(error.message)
      }
    })
  }

  return (
    <StoreCtx.Provider
      value={{ cart, cartLoaded, cartError, clearCart, addToCart, updateQty, cartOpen, setCartOpen, searchOpen, setSearchOpen, wishlist, toggleWish, quickView, setQuickView, customer, setCustomer, wishlistError }}
    >
      {children}
    </StoreCtx.Provider>
  )
}

export const useStore = () => useContext(StoreCtx)
