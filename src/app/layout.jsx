import { Instrument_Sans, Inter } from 'next/font/google'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'
import 'swiper/css/scrollbar'
import './globals.css'
import { BackToTop, CartDrawer, EmailPopup, Footer, MobileBar, QuickView } from '../components/Chrome'
import Header from '../components/Header'
import HomeScrollReset from '../components/HomeScrollReset'
import { StoreProvider } from '../store'

const instrumentSans = Instrument_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-instrument-sans' })
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-inter' })

export const metadata = {
  title: 'Artiz – Interior Design Studio',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${instrumentSans.variable} ${inter.variable}`}>
      <body>
        <StoreProvider>
          <HomeScrollReset />
          <Header />
          <main className="overflow-x-clip">{children}</main>
          <Footer />
          <CartDrawer />
          <QuickView />
          <EmailPopup />
          <MobileBar />
          <BackToTop />
        </StoreProvider>
      </body>
    </html>
  )
}
