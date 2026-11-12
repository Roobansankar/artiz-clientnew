import Link from 'next/link'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'

export default function NotFound() {
  return (
    <section className="relative isolate overflow-hidden bg-cream" aria-labelledby="not-found-title">
      <div className="container-x relative flex min-h-[520px] flex-col items-center justify-center py-16 text-center md:min-h-[600px] md:py-20">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.24em] text-muted">A little off the beaten path</p>
        <p aria-hidden="true" className="font-heading text-[120px] font-semibold leading-none tracking-[-0.07em] text-terra/80 md:text-[180px]">404</p>
        <h1 id="not-found-title" className="mt-5 font-heading text-3xl font-semibold leading-tight md:text-[42px]">This space is still empty.</h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted md:text-base">We couldn’t find the page you’re looking for. Let’s get you back to something worth discovering.</p>
        <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          <Link href="/" className="btn-dark"><ArrowLeft size={16} aria-hidden="true" />Back to Home</Link>
          <Link href="/shop" className="btn-outline">Explore the Shop<ArrowUpRight size={16} aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  )
}
