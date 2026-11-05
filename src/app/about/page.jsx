import { ArrowUpRight, Leaf, ShieldCheck, Truck } from 'lucide-react'
import Link from 'next/link'
import PageBanner from '../../components/PageBanner'
import { Reveal, SectionHeading, ViewAll } from '../../components/ui'

export const metadata = {
  title: 'About Us | Artiz',
  description: 'Discover the ideas behind Artiz: warm materials, thoughtful details, and furniture for everyday living.',
}

const values = [
  { number: '01', title: 'Made for real life', text: 'A quiet morning, a shared meal, a favourite corner. We believe furniture should make the everyday feel a little more special.' },
  { number: '02', title: 'Beauty in the details', text: 'The curve of a chair. The texture of a weave. A warm, natural finish. Small details give a space its character.' },
  { number: '03', title: 'Room to be yourself', text: 'Your home should tell your story. Mix textures, collect favourites, and create a space that feels unmistakably yours.' },
]

const highlights = [
  { icon: Truck, title: 'Free shipping', text: 'On every order, to your door.' },
  { icon: ShieldCheck, title: '1-year warranty', text: 'Covered against manufacturing defects.' },
  { icon: Leaf, title: 'Assembly available', text: 'Professional setup for selected pieces.' },
]

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

      {/* Studio photograph */}
      <section className="pt-8 md:pt-10">
        <div className="container-x">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl">
              <img src="/images/banner11.png" alt="A bright living room styled with natural wood, soft upholstery and daylight" className="aspect-[4/3] w-full object-cover md:aspect-[1482/560]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-10">
                <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/75">The Artiz studio</span>
                <p className="mt-2 max-w-lg font-heading text-[24px] font-semibold leading-snug md:text-[32px]">Every room has a story. Make it yours.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Our point of view */}
      <section className="section-py">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
          <Reveal>
            <span className="subtitle">Our point of view</span>
            <h2 className="h2-title">Good design.<br />A personal <span className="text-terra">touch.</span></h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="space-y-5 leading-relaxed text-muted">
              <p>Home is where life happens. It is the table that brings everyone together, the chair you always return to, and the little things that make a room your own.</p>
              <p>At Artiz, our approach brings furniture and decor together through warm colours, tactile materials, and considered shapes. We look for a balance of comfort and character, with pieces that feel just as good on a slow Sunday as they do when friends come over.</p>
              <p className="text-ink">We’re here to help you make room for the way you live.</p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {highlights.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-sand bg-white p-5">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-peach text-terra"><Icon size={20} /></span>
                  <h3 className="mt-4 text-[16px]">{title}</h3>
                  <p className="mt-1 text-sm text-muted">{text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="section-py border-y border-sand bg-white">
        <div className="container-x">
          <SectionHeading align="center" sub="What we believe" title={<>What feels <span className="text-terra">like us</span></>} desc="Three ideas that shape every piece we choose and every room we help create." />
          <div className="grid gap-6 md:grid-cols-3">
            {values.map((value, i) => (
              <Reveal key={value.number} delay={i * 0.1}>
                <article className="h-full rounded-2xl border border-sand bg-cream p-7 transition-colors duration-300 hover:border-terra">
                  <span className="font-heading text-[40px] font-semibold leading-none text-terra/30">{value.number}</span>
                  <h3 className="mt-4 text-[19px]">{value.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted">{value.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Promise band */}
      <section className="section-py">
        <div className="container-x">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl">
              <img src="/images/banner16.png" alt="A cosy living room with an armchair, chandelier and warm evening light" className="aspect-[4/3] w-full object-cover md:aspect-[1482/560]" />
              <div className="absolute inset-0 bg-black/50" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-white md:p-12">
                <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/70">Our promise</span>
                <p className="max-w-3xl font-heading text-[24px] font-semibold leading-snug md:text-[36px]">Warm materials. Thoughtful details. Furniture that makes the everyday feel a little more special.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Gallery */}
      <section className="pb-[60px] lg:pb-[90px]">
        <div className="container-x">
          <SectionHeading sub="Collected with intention" title={<>The little things. <span className="text-terra">The lasting feeling.</span></>} desc="A favourite texture. A softer light. A piece that pulls the whole room together." right={<ViewAll href="/shop" />} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.1}>
                <div className="group block">
                  <div className="overflow-hidden rounded-2xl bg-sand">
                    <img src={item.img} alt={item.title} loading="lazy" className="aspect-[418/320] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <h3 className="mt-4 text-[18px] transition-colors group-hover:text-terra">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-[60px] lg:pb-[90px]">
        <div className="container-x">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-espresso px-6 py-14 text-center text-white md:py-20">
              <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-terra/30 blur-3xl" />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-terra/20 blur-3xl" />
              <span className="relative mb-3 block font-medium text-terra">Make yourself at home</span>
              <h2 className="relative mx-auto max-w-2xl h2-title">Ready to find pieces that feel like you?</h2>
              <p className="relative mx-auto mt-4 max-w-lg text-white/75">Browse the collection, or send us a note — we’re happy to help with sizing, finishes and styling.</p>
              <div className="relative mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/shop" className="btn-terra">Explore the shop <ArrowUpRight size={16} aria-hidden="true" /></Link>
                <Link href="/contact" className="btn-light">Contact us</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
