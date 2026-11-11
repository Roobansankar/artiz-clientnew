'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { getImageProps } from 'next/image'
import { productImageSource, productImagePlaceholder } from '../lib/product-image'

let warmedSource
export default function HeroImageWarmup({ slides = [] }) {
  const pathname = usePathname()
  useEffect(() => {
    if (pathname === '/') return
    const source = productImageSource(slides[0]?.image)
    if (source === productImagePlaceholder || warmedSource === source) return
    // Warm the same responsive image URL used by the homepage, at low priority.
    // This never holds up navigation; immutable images are reused on return.
    const { props } = getImageProps({ src: source, alt: '', fill: true, sizes: '100vw' })
    const image = new window.Image()
    image.fetchPriority = 'low'
    image.sizes = props.sizes
    image.srcset = props.srcSet || ''
    image.src = props.src
    warmedSource = source
  }, [pathname, slides])
  return null
}
