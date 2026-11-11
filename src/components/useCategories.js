'use client'

import { useCallback, useEffect, useState } from 'react'
import { fetchPublicCategories } from '../lib/public-categories'

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(false)
  const refresh = useCallback(async () => {
    try {
      setCategories(await fetchPublicCategories())
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
