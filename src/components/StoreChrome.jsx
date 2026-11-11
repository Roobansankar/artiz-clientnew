'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import HomeScrollReset from './HomeScrollReset'
import { BackToTop, CartDrawer, EmailPopup, Footer, MobileBar, QuickView } from './Chrome'
import AdminToaster from './AdminToaster'
import PageProgress from './PageProgress'
import HeroImageWarmup from './HeroImageWarmup'

export default function StoreChrome({ children }) {
  const pathname = usePathname() || ''
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/') || pathname === '/admin.login'

  if (isAdmin) {
    return <><PageProgress />{children}<AdminToaster /></>
  }

  return (
    <>
      <HomeScrollReset />
      <HeroImageWarmup />
      <Header />
      <main className="overflow-x-clip">{children}</main>
      <Footer />
      <CartDrawer />
      <QuickView />
      <EmailPopup />
      <MobileBar />
      <BackToTop />
    </>
  )
}
