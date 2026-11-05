'use client'

import { createContext, useContext, useState } from 'react'
import { firstAvailableVariant, productOption } from './catalog'

const StoreCtx = createContext(null)

export function StoreProvider({ children }) {
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [quickView, setQuickView] = useState(null)

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
  const toggleWish = (id) => setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]))

  return (
    <StoreCtx.Provider
      value={{ cart, addToCart, updateQty, cartOpen, setCartOpen, wishlist, toggleWish, quickView, setQuickView }}
    >
      {children}
    </StoreCtx.Provider>
  )
}

export const useStore = () => useContext(StoreCtx)
