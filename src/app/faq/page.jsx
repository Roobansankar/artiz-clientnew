import { ArrowUpRight, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import FaqList from '../../components/FaqList'
import PageBanner from '../../components/PageBanner'
import { Reveal } from '../../components/ui'
import { ADDRESS } from '../../site'

export const metadata = {
  title: 'FAQs | Artiz',
  description: 'Answers to common questions about Artiz furniture, delivery, care, returns and design planning.',
}

const groups = [
  {
    id: 'orders',
    title: 'Orders & delivery',
    questions: [
      { q: 'How do I place an order?', a: 'Simply select your desired product, add it to your cart, proceed to checkout, enter your details, and confirm your order.' },
      { q: 'What are your delivery times and charges?', a: 'Delivery times and charges depend on your location and the product you order. Delivery is usually completed within 2–5 business days, and charges may vary based on your location and order size.' },
      { q: 'Do you offer assembly or installation?', a: 'Yes, we offer professional assembly and installation services for selected furniture products, ensuring safe, proper, and hassle-free setup at home. Confirm availability for your item and address when you order.' },
      { q: 'What should I prepare before furniture arrives?', a: 'Clear a path from the entrance to the room, measure access points and protect delicate flooring. Make a note of stairs, narrow passages or building access requirements when arranging delivery.' },
    ],
  },
  {
    id: 'returns',
    title: 'Returns & care',
    questions: [
      { q: "What's your return policy?", a: 'We accept returns for eligible products within the specified return period, provided items are unused, undamaged, and returned with original packaging.' },
      { q: 'What if my item arrives damaged?', a: 'Photograph the item, packaging and any visible damage, and keep your order details handy. Retain the packaging while you confirm the next steps with our team.' },
      { q: 'How do I care for different fabrics and finishes?', a: 'Follow the care instructions supplied with your piece. As a starting point: dust with a soft cloth, use coasters, blot spills promptly, and avoid harsh cleaners. Check material-specific guidance before using any treatment.' },
    ],
  },
  {
    id: 'furniture',
    title: 'Furniture & materials',
    questions: [
      { q: 'How do I choose the right size for my room?', a: 'Measure your available floor space and leave room for doors, drawers and comfortable movement. Before choosing a larger piece, also measure doorways, stairs and lifts along its delivery route.' },
      { q: 'Will natural materials look exactly like the photos?', a: 'Wood grain, texture and natural colour can vary from piece to piece. Lighting and screen settings can also affect how a finish appears in a photograph.' },
      { q: 'Can I get fabric samples before buying?', a: 'Yes, fabric samples are available for selected products. Contact us to request samples and choose the perfect colour, texture and finish.' },
    ],
  },
  {
    id: 'design',
    title: 'Design & inspiration',
    questions: [
      { q: 'Can I get help planning a room?', a: 'Yes. Tell us about your room, style and budget through the contact form and our team will help you narrow down pieces, sizes and finishes — from a single statement chair to a whole-room refresh.' },
      { q: 'How do I choose pieces that work together?', a: 'Start with one anchor piece, then repeat a material or tone elsewhere in the room — wood with wood, warm neutrals with a single accent colour. Mixing textures is what keeps a space feeling layered rather than matching.' },
      { q: 'Can I visit the studio?', a: `Yes — you'll find us at ${ADDRESS}. Send us a message first and we'll confirm timings and what's on show.`, },
    ],
  },
]

export default function FaqPage() {
  return (
    <>
      <PageBanner
        eyebrow="A little help, right here"
        title={<>Frequently asked.<br /><span className="text-terra">Thoughtfully answered.</span></>}
        crumb="FAQs"
        description="A few things you might like to know before making yourself at home."
      />

      <section className="section-py">
        <div className="container-x grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-16">
          {/* Topics */}
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <span className="subtitle">Explore by topic</span>
            <nav aria-label="FAQ topics" className="mt-4 divide-y divide-sand border-y border-sand">
              {groups.map((group) => (
                <a key={group.id} href={`#${group.id}`} className="group flex items-center justify-between gap-3 py-3.5 text-[15px] transition-colors hover:text-terra">
                  {group.title}
                  <ArrowUpRight size={15} aria-hidden="true" className="text-muted transition-transform duration-300 group-hover:rotate-45 group-hover:text-terra" />
                </a>
              ))}
            </nav>

            <div className="mt-6 rounded-2xl bg-peach p-6">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-terra"><MessageCircle size={20} /></span>
              <h2 className="mt-4 text-lg">Do you have more questions?</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">Our team will answer all your questions. We ensure a quick response.</p>
              <Link href="/contact" className="btn-dark mt-5 w-full">Contact us <ArrowUpRight size={16} aria-hidden="true" /></Link>
            </div>
          </Reveal>

          {/* Groups */}
          <div>
            {groups.map((group) => (
              <section key={group.id} id={group.id} aria-labelledby={`${group.id}-heading`} className="mb-12 scroll-mt-28 last:mb-0">
                <Reveal>
                  <h2 id={`${group.id}-heading`} className="mb-5 h2-title text-[24px] md:text-[30px]">{group.title}</h2>
                  <FaqList questions={group.questions} />
                </Reveal>
              </section>
            ))}
          </div>
        </div>
      </section>

      {/* Keep exploring */}
      <section className="pb-[60px] lg:pb-[90px]">
        <div className="container-x">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-espresso px-6 py-14 text-center text-white md:py-20">
              <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-terra/30 blur-3xl" />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-terra/20 blur-3xl" />
              <span className="relative mb-3 block font-medium text-terra">Still looking?</span>
              <h2 className="relative mx-auto max-w-2xl h2-title">A home that feels <span className="text-terra">like you.</span></h2>
              <p className="relative mx-auto mt-4 max-w-lg text-white/75">Get to know Artiz or start gathering ideas for your space.</p>
              <div className="relative mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/contact" className="btn-terra">Contact us <ArrowUpRight size={16} aria-hidden="true" /></Link>
                <Link href="/about" className="btn-light">About Artiz</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
