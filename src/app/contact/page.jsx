import { ArrowUpRight, MapPin, MessageCircle, PencilRuler } from 'lucide-react'
import Link from 'next/link'
import ContactForm from '../../components/ContactForm'
import { Reveal } from '../../components/ui'
import { ADDRESS } from '../../site'

export const metadata = {
  title: 'Contact Us | Artiz',
  description: 'Get in touch with Artiz about furniture, your order, or ideas for your home.',
}

export default function ContactPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-cream" aria-labelledby="contact-title">
        <img src="/images/slider1.png" alt="A warm interior with an accent chair, side table, and wooden cabinet" fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover object-bottom" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-cream/25" />
        <div className="container-x relative">
          <Reveal y={16} className="mx-auto flex min-h-[350px] max-w-2xl flex-col items-center justify-center pb-10 pt-6 text-center md:min-h-[430px] md:pb-14">
            <span className="mb-4 text-xs font-medium uppercase tracking-[0.22em] text-terra">A conversation starts here</span>
            <h1 id="contact-title" className="font-heading text-[40px] font-semibold leading-[1.08] tracking-tight md:text-[60px]">Let us talk about<br /><span className="text-terra">your home.</span></h1>
            <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-ink/75 md:text-base">A question, an idea, or a little guidance. We are here to help you make room for what you love.</p>
            <a href="#contact-form" className="btn-dark mt-7">Get in touch <ArrowUpRight size={16} aria-hidden="true" /></a>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-sand bg-cream py-12 md:py-16">
        <div className="container-x grid items-start gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 xl:gap-28">
          <aside>
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-terra">Here to help</span>
            <h2 className="mt-3 font-heading text-[28px] font-semibold leading-tight md:text-[34px]">A personal touch,<br />from the first hello.</h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">Furniture, finishing touches, or an order update. Let us point you in the right direction.</p>
            <div className="mt-8 divide-y divide-sand border-y border-sand">
              <div className="flex gap-4 py-6">
                <MapPin size={21} strokeWidth={1.5} className="mt-0.5 shrink-0 text-terra" aria-hidden="true" />
                <div><h3 className="text-sm font-semibold">Find Artiz</h3><p className="mt-2 text-sm text-muted">{ADDRESS}</p><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-xs font-medium hover:text-terra">View location <ArrowUpRight size={14} aria-hidden="true" /></a></div>
              </div>
              <div className="flex gap-4 py-6">
                <MessageCircle size={21} strokeWidth={1.5} className="mt-0.5 shrink-0 text-terra" aria-hidden="true" />
                <div><h3 className="text-sm font-semibold">Help with your order</h3><p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">Include your order number in your message so we can find the details.</p><Link href="/faq" className="mt-3 inline-flex items-center gap-2 text-xs font-medium hover:text-terra">Read our FAQs <ArrowUpRight size={14} aria-hidden="true" /></Link></div>
              </div>
              <div className="flex gap-4 py-6">
                <PencilRuler size={21} strokeWidth={1.5} className="mt-0.5 shrink-0 text-terra" aria-hidden="true" />
                <div><h3 className="text-sm font-semibold">Something for your space</h3><p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">Share your room dimensions, preferred style, and budget. We can help you explore your options.</p></div>
              </div>
            </div>
          </aside>
          <div id="contact-form" className="min-w-0 scroll-mt-24 lg:border-l lg:border-sand lg:pl-12 xl:pl-16"><ContactForm /></div>
        </div>
      </section>

      <section className="bg-white py-9 md:py-12">
        <div className="container-x flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div><p className="text-xs font-medium uppercase tracking-[0.14em] text-terra">While you are here</p><h2 className="mt-2 font-heading text-2xl font-semibold">Find a little inspiration for home.</h2></div>
          <Link href="/shop" className="inline-flex items-center gap-3 self-start border-b border-ink pb-2 text-sm font-medium transition-colors hover:border-terra hover:text-terra sm:self-auto">Explore the shop <ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>
      </section>
    </>
  )
}
