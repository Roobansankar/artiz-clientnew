import { ArrowUpRight, Leaf, ShieldCheck, Truck } from 'lucide-react'
import Link from 'next/link'
import PageBanner from '../../components/PageBanner'
import { Reveal, SectionHeading, ViewAll } from '../../components/ui'

export const metadata = {
  title: 'About Us | Artiz',
  description: 'Discover the ideas behind Artiz: warm materials, thoughtful details, and furniture for everyday living.',
}

const stats = [
  { value: '10', suffix: '+', label: 'Years of craft' },
  { value: '480', suffix: '', label: 'Pieces designed' },
  { value: '12', suffix: 'k', label: 'Happy homes' },
  { value: '98', suffix: '%', label: 'Would recommend' },
]

const values = [
  { number: '01', title: 'Made for real life', text: 'A quiet morning, a shared meal, a favourite corner. We believe furniture should make the everyday feel a little more special.' },
  { number: '02', title: 'Beauty in the details', text: 'The curve of a chair. The texture of a weave. A warm, natural finish. Small details give a space its character.' },
  { number: '03', title: 'Room to be yourself', text: 'Your home should tell your story. Mix textures, collect favourites, and create a space that feels unmistakably yours.' },
  { number: '04', title: 'Built to last', text: 'Solid materials, honest construction and finishes that age gracefully — pieces you keep, not replace.' },
]

const highlights = [
  { icon: Truck, title: 'Free shipping', text: 'On every order, to your door.' },
  { icon: ShieldCheck, title: '1-year warranty', text: 'Covered against manufacturing defects.' },
  { icon: Leaf, title: 'Assembly available', text: 'Professional setup for selected pieces.' },
]

const quote =
  '“We design the pieces we wish we could find — warm, honest furniture that earns its place in a room.”'

const gallery = [
  { img: '/images/collection1.png', title: 'Quiet corners', text: 'A single chair, a warm lamp, a moment to slow down.' },
  { img: '/images/banner3.png', title: 'Everyday warmth', text: 'Natural textures that make a room feel lived in.' },
  { img: '/images/banner15.png', title: 'Colour with confidence', text: 'A considered pop of colour pulls a space together.' },
]

export default function AboutPage() {
  return (
    <>
      <PageBanner
        eyebrow="A little about Artiz"
        title={<>More than furniture.<br />A <span className="text-terra">feeling of home.</span></>}
        crumb="About Us"
        description="Thoughtful pieces. Natural warmth. Spaces that feel like you — built around the way you actually live."
      />

      {/* Story split: sticky heading on the left, layered imagery on the right */}
      <section className="section-py">
        <div className="container-x grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <Reveal>
            <span className="subtitle">Our story</span>
            <h2 className="h2-title">Good design.<br />A personal <span className="text-terra">touch.</span></h2>
            <div className="mt-6 space-y-5 leading-relaxed text-muted">
              <p>Home is where life happens. It is the table that brings everyone together, the chair you always return to, and the little things that make a room your own.</p>
              <p>At Artiz, our approach brings furniture and decor together through warm colours, tactile materials, and considered shapes. We look for a balance of comfort and character, with pieces that feel just as good on a slow Sunday as they do when friends come over.</p>
              <p className="text-ink">We’re here to help you make room for the way you live.</p>
            </div>
            <div className="mt-8 space-y-3">
              {highlights.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex items-center gap-4 rounded-2xl border border-sand bg-white p-4 transition-colors duration-300 hover:border-terra">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-peach text-terra"><Icon size={20} /></span>
                  <div>
                    <h3 className="text-[16px]">{title}</h3>
                    <p className="mt-0.5 text-sm text-muted">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative mx-auto max-w-[560px] lg:max-w-none">
              <div className="overflow-hidden rounded-3xl">
                <img src="/images/banner11.png" alt="A bright living room styled with natural wood, soft upholstery and daylight" className="aspect-[4/5] w-full object-cover sm:aspect-[5/5]" />
              </div>
              {/* Overlapping accent image */}
              <div className="absolute -bottom-8 -left-4 hidden w-[46%] overflow-hidden rounded-3xl border-[6px] border-cream shadow-xl sm:block lg:-left-14">
                <img src="/images/collection2.png" alt="A styled corner of the Artiz studio" className="aspect-square w-full object-cover" />
              </div>
              {/* Experience badge */}
              <div className="absolute -right-3 top-8 rotate-3 rounded-2xl bg-espresso px-5 py-4 text-white shadow-lg lg:-right-8">
                <p className="font-heading text-[28px] font-semibold leading-none text-terra">10+</p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/80">Years of craft</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats strip */}
      <section>
        <div className="container-x">
          <Reveal>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-sand lg:grid-cols-4">
              {stats.map(({ value, suffix, label }) => (
                <div key={label} className="bg-white px-6 py-8 text-center md:py-10">
                  <p className="font-heading text-[34px] font-semibold text-espresso md:text-[42px]">{value}{suffix && <span className="text-terra">{suffix}</span>}</p>
                  <p className="mt-2 text-sm text-muted">{label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Values as an editorial numbered list */}
      <section className="section-py">
        <div className="container-x grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-20">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <span className="subtitle">What we believe</span>
              <h2 className="h2-title">What feels <span className="text-terra">like us</span></h2>
              <p className="mt-3 text-muted">Four ideas that shape every piece we choose and every room we help create.</p>
            </div>
          </Reveal>
          <div>
            {values.map((value, i) => (
              <Reveal key={value.number} delay={i * 0.05}>
                <div className={`group grid gap-4 border-t border-sand py-8 sm:grid-cols-[80px_1fr] md:gap-10 ${i === values.length - 1 ? 'border-b' : ''}`}>
                  <span className="font-heading text-[40px] font-semibold leading-none text-sand transition-colors duration-300 group-hover:text-terra">{value.number}</span>
                  <div>
                    <h3 className="text-[20px] transition-colors duration-300 group-hover:text-terra">{value.title}</h3>
                    <p className="mt-2 max-w-2xl leading-relaxed text-muted">{value.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Wide image with centered quote */}
      <section className="pb-[60px] lg:pb-[90px]">
        <div className="container-x">
          <Reveal>
            <figure className="relative overflow-hidden rounded-3xl">
              <img src="/images/banner16.png" alt="A cosy living room with an armchair, chandelier and warm evening light" className="aspect-[4/3] w-full object-cover md:aspect-[1482/560]" />
              <div className="absolute inset-0 bg-gradient-to-r from-espresso/80 via-espresso/50 to-espresso/20" />
              <div className="absolute inset-0 flex items-center p-6 md:p-14">
                <figcaption className="max-w-2xl text-white">
                  <span className="mb-3 block text-[11px] font-medium uppercase tracking-[0.24em] text-terra">From our studio</span>
                  <blockquote className="font-heading text-[22px] font-semibold leading-snug md:text-[32px]">{quote}</blockquote>
                  <p className="mt-4 text-sm text-white/70">— The Artiz design team</p>
                </figcaption>
              </div>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* Gallery */}
      <section className="pb-[60px] lg:pb-[90px]">
        <div className="container-x">
          <SectionHeading sub="Collected with intention" title={<>The little things. <span className="text-terra">The lasting feeling.</span></>} desc="A favourite texture. A softer light. A piece that pulls the whole room together." right={<ViewAll href="/shop" />} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.1} className={i === 0 ? 'sm:row-span-2' : ''}>
                <div className="group block h-full">
                  <div className={`overflow-hidden rounded-2xl bg-sand ${i === 0 ? 'h-full' : ''}`}>
                    <img src={item.img} alt={item.title} loading="lazy" className={`${i === 0 ? 'h-full' : 'aspect-[418/320]'} w-full object-cover transition-transform duration-700 group-hover:scale-105`} />
                  </div>
                  <h3 className="mt-4 text-[18px] transition-colors group-hover:text-terra">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Split CTA */}
      <section className="pb-[60px] lg:pb-[90px]">
        <div className="container-x">
          <Reveal>
            <div className="grid overflow-hidden rounded-3xl bg-espresso lg:grid-cols-2">
              <div className="px-6 py-14 text-white md:px-14 md:py-20">
                <span className="mb-3 block font-medium text-terra">Make yourself at home</span>
                <h2 className="h2-title">Ready to find pieces that feel like you?</h2>
                <p className="mt-4 max-w-lg text-white/75">Browse the collection, or send us a note — we’re happy to help with sizing, finishes and styling.</p>
                <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                  <Link href="/shop" className="btn-terra">Explore the shop <ArrowUpRight size={16} aria-hidden="true" /></Link>
                  <Link href="/contact" className="btn-light">Contact us</Link>
                </div>
              </div>
              <div className="relative hidden min-h-[320px] lg:block">
                <img src="/images/banner20.png" alt="A warm interior styled with Artiz furniture" className="absolute inset-0 h-full w-full object-cover" />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-espresso to-transparent" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
