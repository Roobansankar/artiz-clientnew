'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { shopProduct } from '../catalog'

export function useProductListing(config, initialProducts, query) {
  const [state, setState] = useState(() => ({ key: query, products: initialProducts, meta: config?.initial, loading: false, error: '' }))
  const active = useRef(query)
  active.current = query
  const request = useRef(null)
  const requestedKey = useRef(query)

  const fetchPage = useCallback(async (page, replace = false) => {
    if (!config || (!replace && request.current)) return
    request.current?.controller.abort()
    const controller = new AbortController()
    const token = { controller, key: query }
    request.current = token
    setState(current => ({ ...current, loading: true, error: '' }))
    try {
      const params = new URLSearchParams(query)
      params.set('page', String(page))
      if (replace) params.set('facets', 'true')
      const response = await fetch(`/api/products?${params}`, { cache: 'no-store', signal: controller.signal })
      if (!response.ok) throw new Error('Products are temporarily unavailable. Please retry.')
      const data = await response.json()
      if (controller.signal.aborted || active.current !== query) return
      const products = data.products.map(product => shopProduct(product, config.categories))
      setState(current => {
        const previous = replace || current.key !== query ? [] : current.products
        const ids = new Set(previous.map(product => product.id))
        return { key: query, products: [...previous, ...products.filter(product => !ids.has(product.id))], meta: { ...data, products: undefined, facets: data.facets || current.meta?.facets }, loading: false, error: '' }
      })
    } catch (error) {
      if (!controller.signal.aborted && active.current === query) setState(current => ({ ...current, key: query, products: replace ? [] : current.products, loading: false, error: error.message }))
    } finally { if (request.current === token) request.current = null }
  }, [config, query])

  useEffect(() => {
    if (!config) return
    // Use the SSR first page without repeating its request on hydration.
    if (requestedKey.current === query) return
    requestedKey.current = query
    void fetchPage(1, true)
    return () => request.current?.controller.abort()
  }, [config, query, fetchPage])
  useEffect(() => () => request.current?.controller.abort(), [])

  const current = state.key === query
  const loading = !current || state.loading
  const loadMore = useCallback(() => {
    if (!current || loading || state.error || !state.meta?.hasMore) return
    void fetchPage((state.meta.page || 1) + 1)
  }, [current, loading, state.error, state.meta, fetchPage])
  const retry = useCallback(() => { void fetchPage(state.products.length && current ? (state.meta?.page || 1) + 1 : 1, !current || !state.products.length) }, [fetchPage, state.products.length, state.meta, current])
  return { products: current ? state.products : [], meta: state.meta || config?.initial, loading, error: current ? state.error : '', loadMore, retry }
}
