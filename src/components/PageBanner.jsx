import Link from 'next/link'
import { HOME_URL } from '../routes'
import { Reveal } from './ui'

/* Shared page header used by the About, Contact and FAQ pages.
   Mirrors the banner used across the shop views so every route opens the same way. */
export default function PageBanner({ eyebrow, title, crumb, description }) {
  return (
    <section className="border-b border-sand bg-gradient-to-r from-peach/60 via-cream to-cream">
      <div className="container-x py-10 md:py-14">
        <Reveal y={16}>
          {eyebrow && <span className="subtitle">{eyebrow}</span>}
          <h1 className="font-heading text-[34px] font-semibold leading-[1.15] tracking-tight text-ink md:text-[46px]">{title}</h1>
          <nav aria-label="Breadcrumb" className="mt-4 flex items-center gap-2 text-[13px]">
            <Link href={HOME_URL} className="text-muted transition-colors hover:text-terra">Home</Link>
            <span aria-hidden="true" className="text-muted/50">/</span>
            <span aria-current="page" className="font-medium text-terra">{crumb}</span>
          </nav>
          {description && <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-[15px]">{description}</p>}
        </Reveal>
      </div>
    </section>
  )
}
