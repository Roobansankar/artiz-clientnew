'use client'

import { useCallback, useEffect, useState } from 'react'

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(false)
  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/categories', { cache: 'no-store' })
      if (!response.ok) throw new Error('Categories unavailable')
      const data = await response.json()
      if (!Array.isArray(data.categories)) throw new Error('Invalid categories')
      setCategories(data.categories)
      setError(false)
    } catch { setError(true) }
  }, [])
  useEffect(() => {
    void refresh()
    const update = () => { if (document.visibilityState === 'visible') void refresh() }
    window.addEventListener('focus', update)
    document.addEventListener('visibilitychange', update)
    return () => {
      window.removeEventListener('focus', update)
      document.removeEventListener('visibilitychange', update)
    }
  }, [refresh])
  return { categories, error, refresh }
}
