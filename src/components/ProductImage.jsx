'use client'

import Image from 'next/image'
import { useState } from 'react'
import { productImagePlaceholder, productImageSource } from '../lib/product-image'

export default function ProductImage({ src, unoptimized = false, onError, ...props }) {
  const [failedSource, setFailedSource] = useState(null)
  const source = productImageSource(src, unoptimized)
  const displayed = failedSource === source ? productImagePlaceholder : source
  return <Image {...props} src={displayed} unoptimized={unoptimized} onError={event => {
    if (displayed !== productImagePlaceholder) setFailedSource(source)
    onError?.(event)
  }} />
}
