import { ArrowUpRight, Headphones, MapPin, MessageCircle, PencilRuler } from 'lucide-react'
import Link from 'next/link'
import ContactForm from '../../components/ContactForm'
import PageBanner from '../../components/PageBanner'
import { Reveal, SectionHeading } from '../../components/ui'
import { ADDRESS } from '../../site'

export const metadata = {
  title: 'Contact Us | Artiz',
  description: 'Get in touch with Artiz about furniture, your order, or ideas for your home.',
}

const cards = [
  { icon: MapPin, title: 'Visit the studio', text: ADDRESS, href: null },
  { icon: MessageCircle, title: 'Send a message', text: 'Fill in the form and our team will get back to you.', href: '#contact-form' },
  { icon: PencilRuler, title: 'Design advice', text: 'Tell us about your room and we’ll help you narrow down the choices.', href: '/#shop-by-category' },
  { icon: Headphones, title: 'Quick answers', text: 'Delivery, returns and care are covered in our FAQs.', href: '/faq' },
]

export default function ContactPage() {
  return (
    <>
      <PageBanner
        eyebrow="Contact us"
        title={<>A question. An idea.<br /><span className="text-terra">Let’s talk.</span></>}
        crumb="Contact Us"
        description="From finding your favourite piece to making a space feel like home — we’re here to help."
      />

      <section className="section-py">
        <div className="container-x">
          {/* Ways to reach us */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map(({ icon: Icon, title, text, href }, i) => {
              const inner = (
                <>
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-peach text-terra transition-colors duration-300 group-hover:bg-terra group-hover:text-white">
                    <Icon size={22} />
                  </span>
                  <h2 className="mt-5 text-[17px]">{title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
                  {href && <span className="mt-4 inline-flex items-center gap-1.5 border-b border-ink pb-0.5 text-sm font-medium transition-colors group-hover:border-terra group-hover:text-terra">
                    {href.startsWith('/#') ? 'Browse categories' : href === '/faq' ? 'Read the FAQs' : 'Jump to the form'}
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </span>}
                </>
              )
              return (
                <Reveal key={title} delay={i * 0.08}>
                  {href ? (
                    <Link href={href} className="group flex h-full flex-col rounded-2xl border border-sand bg-white p-6 transition-colors duration-300 hover:border-terra">
                      {inner}
                    </Link>
                  ) : (
                    <div className="group flex h-full flex-col rounded-2xl border border-sand bg-white p-6">{inner}</div>
                  )}
                </Reveal>
              )
            })}
          </div>

          {/* Form + aside */}
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <div id="contact-form" className="scroll-mt-28">
              <ContactForm />
            </div>

            <Reveal delay={0.1} className="flex flex-col gap-6">
              <div className="overflow-hidden rounded-3xl">
                <img src="/images/collection1.png" alt="A styled corner with an armchair, floor lamp and side table" className="aspect-[4/3] w-full object-cover lg:aspect-[418/360]" loading="lazy" />
              </div>
              <div className="rounded-2xl bg-peach p-6">
                <span className="subtitle">A little inspiration</span>
                <h2 className="text-[22px] leading-snug">Make room for <span className="text-terra">your ideas.</span></h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">Gather your room, style and budget preferences, then explore pieces that fit the way you live.</p>
                <Link href="/shop" className="btn-dark mt-5">Explore the shop <ArrowUpRight size={16} aria-hidden="true" /></Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Keep exploring */}
      <section className="pb-[60px] lg:pb-[90px]">
        <div className="container-x">
          <SectionHeading align="center" sub="Keep exploring" title={<>A home that feels <span className="text-terra">like you.</span></>} desc="Get to know Artiz or start gathering ideas for your space." />
          <Reveal>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/about" className="btn-outline">About Artiz</Link>
              <Link href="/faq" className="btn-dark">Browse the FAQs <ArrowUpRight size={16} aria-hidden="true" /></Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
