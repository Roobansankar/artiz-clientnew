'use client'

import { useState } from 'react'
import { getImageProps } from 'next/image'
import { productImageSource, productImagePlaceholder } from '../lib/product-image'

export default function HeroPicture({ slide, priority = false }) {
  const [failed, setFailed] = useState([])
  const desktopSource = failed.includes(slide.image) ? productImagePlaceholder : productImageSource(slide.image)
  const mobileSource = slide.mobileImage && !failed.includes(slide.mobileImage) ? productImageSource(slide.mobileImage) : ''
  const common = { alt: slide.alt || slide.name, fill: true, sizes: '100vw', loading: priority ? 'eager' : 'lazy', fetchPriority: priority ? 'high' : 'auto', className: slide.imageFit === 'contain' ? 'object-contain' : 'object-cover' }
  const desktop = getImageProps({ ...common, src: desktopSource }).props
  const mobile = mobileSource ? getImageProps({ ...common, src: mobileSource }).props : null
  return <>
    {priority && <>
      <link rel="preload" as="image" href={desktop.src} imageSrcSet={desktop.srcSet} imageSizes="100vw" media={mobile ? '(min-width: 768px)' : undefined} />
      {mobile && <link rel="preload" as="image" href={mobile.src} imageSrcSet={mobile.srcSet} imageSizes="100vw" media="(max-width: 767px)" />}
    </>}
    <picture>
      {mobile && <source media="(max-width: 767px)" srcSet={mobile.srcSet || mobile.src} sizes="100vw" />}
      <img {...desktop} onError={() => {
        const source = mobileSource && window.matchMedia('(max-width: 767px)').matches ? slide.mobileImage : slide.image
        if (source && source !== productImagePlaceholder && !failed.includes(source)) setFailed(current => [...current, source])
      }} />
    </picture>
  </>
}
