'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { getImageProps } from 'next/image'
import { productImageSource, productImagePlaceholder } from '../lib/product-image'

let warmedRevision
let pending
export default function HeroImageWarmup() {
  const pathname = usePathname()
  useEffect(() => {
    if (pathname === '/') return
    let revision = ''
    try { revision = localStorage.getItem('artiz-hero-updated') || '' } catch {}
    if (warmedRevision === revision || pending) return
    // Warm the same responsive image URL used by the homepage, at low priority.
    // This never holds up navigation; immutable images are reused on return.
    pending = fetch('/api/hero-slides', { cache: 'no-store', signal: AbortSignal.timeout(5000) })
      .then(async response => {
        if (!response.ok) return
        const first = (await response.json()).slides?.[0]
        const source = productImageSource(first?.image)
        if (source === productImagePlaceholder) return
        const { props } = getImageProps({ src: source, alt: '', fill: true, sizes: '100vw' })
        const image = new window.Image()
        image.fetchPriority = 'low'
        image.sizes = props.sizes
        image.srcset = props.srcSet || ''
        image.src = props.src
        warmedRevision = revision
      }).catch(() => {}).finally(() => { pending = null })
  }, [pathname])
  return null
}
