'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from './Header'
import HomeScrollReset from './HomeScrollReset'
import { BackToTop, CartDrawer, EmailPopup, Footer, QuickView } from './Chrome'
import AdminToaster from './AdminToaster'
import StoreToaster from './StoreToaster'
import PageProgress from './PageProgress'
import HeroImageWarmup from './HeroImageWarmup'
import HomeHero from './HomeHero'

export default function StoreChrome({ children, heroSlides = [] }) {
  const pathname = usePathname() || ''
  const [currentHero, setCurrentHero] = useState(() => heroSlides || [])
  useEffect(() => { if (Array.isArray(heroSlides)) setCurrentHero(heroSlides) }, [heroSlides])
  useEffect(() => {
    if (pathname !== '/') return
    const controller = new AbortController()
    // Paint the layout's snapshot first; refresh admin changes in the background.
    fetch('/api/hero-slides', { cache: 'no-store', signal: controller.signal })
      .then(async response => {
        if (!response.ok) return
        const data = await response.json()
        if (Array.isArray(data.slides) && !controller.signal.aborted) setCurrentHero(data.slides)
      }).catch(() => {})
    return () => controller.abort()
  }, [pathname, heroSlides])
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/') || pathname === '/admin.login'

  if (isAdmin) {
    return <><PageProgress />{children}<AdminToaster /></>
  }

  return (
    <>
      <HomeScrollReset />
      <HeroImageWarmup slides={currentHero} />
      <Header />
      <main className="overflow-x-clip">{pathname === '/' && <HomeHero slides={currentHero} />}{children}</main>
      <Footer />
      <CartDrawer />
      <QuickView />
      <EmailPopup />
      <BackToTop />
      <StoreToaster />
    </>
  )
}
