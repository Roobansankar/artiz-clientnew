import { Instrument_Sans, Inter } from 'next/font/google'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'
import 'swiper/css/scrollbar'
import './globals.css'
import StoreChrome from '../components/StoreChrome'
import { StoreProvider } from '../store'

const instrumentSans = Instrument_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-instrument-sans' })
const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-inter' })

export const metadata = {
  title: 'Artiz – Interior Design Studio',
  icons: { icon: '/favicon.svg' },
}

export default async function RootLayout({ children }) {
  let heroSlides = null
  try {
    const base = process.env.API_BASE_URL || 'http://127.0.0.1:5000'
    const response = await fetch(`${base}/api/hero-slides`, { next: { revalidate: 60, tags: ['home-hero'] }, signal: AbortSignal.timeout(3000) })
    if (response.ok) heroSlides = (await response.json()).slides || []
  } catch { /* Store pages remain available if the banner service is down. */ }
  return (
    <html lang="en" className={`${instrumentSans.variable} ${inter.variable}`}>
      <body>
        <StoreProvider>
          <StoreChrome heroSlides={heroSlides}>{children}</StoreChrome>
        </StoreProvider>
      </body>
    </html>
  )
}
