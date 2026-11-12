'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import HeroPicture from './HeroPicture'
import Link from 'next/link'

export default function HomeHero({ slides = [] }) {
  if (!slides.length) return null
  return (
    <section className="relative bg-cream" aria-label="Featured collections">
      <Swiper
        key={slides.map(slide => `${slide.id}:${slide.updatedAt}`).join('|')}
        className="hero-swiper"
        modules={[EffectFade, Autoplay, Pagination, Navigation]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={700}
        loop={slides.length > 1}
        autoplay={slides.length > 1 ? { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true } : false}
        pagination={slides.length > 1 ? { clickable: true, el: '.hero-pagination' } : false}
        navigation={slides.length > 1 ? { nextEl: '.hero-next', prevEl: '.hero-prev' } : false}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <div className={`hero-slide-frame ${slide.mobileImage && slide.mode === 'text' ? 'hero-mobile-composition' : ''} relative h-[440px] overflow-hidden md:h-[420px] lg:h-[460px] xl:h-[500px]`} style={{ '--hero-preview-desktop': slide.blurDataUrl ? `url("${slide.blurDataUrl}")` : 'none', '--hero-preview-mobile': (slide.mobileBlurDataUrl || slide.blurDataUrl) ? `url("${slide.mobileBlurDataUrl || slide.blurDataUrl}")` : 'none', backgroundSize: slide.imageFit === 'contain' ? 'contain' : 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
              <HeroPicture slide={slide} priority={index === 0} />
              {slide.mode === 'image' ? slide.buttonHref && <Link href={slide.buttonHref} className="absolute inset-0" aria-label={slide.alt || slide.name} /> : <div className={`hero-copy container-x absolute inset-0 flex items-center ${slide.alignment === 'left' ? 'justify-start' : slide.alignment === 'right' ? 'justify-end' : 'justify-center'}`}>
                <div className={`max-w-2xl ${slide.alignment === 'left' ? 'text-left' : slide.alignment === 'right' ? 'text-right' : 'text-center'} ${slide.textTone === 'light' ? 'text-white' : 'text-ink'}`}>
                  <h2 className={`slide-anim d1 font-heading text-[40px] font-semibold leading-[1.1] md:text-[64px] xl:text-[80px]`}>
                    {slide.titleBefore} <span className="text-terra">{slide.titleAccent}</span> {slide.titleAfter}
                  </h2>
                  {slide.description && <p className={`slide-anim d2 mt-5 max-w-md text-[16px] md:text-[18px] ${slide.alignment === 'center' ? 'mx-auto' : slide.alignment === 'right' ? 'ml-auto' : ''} ${slide.textTone === 'light' ? 'text-white/90' : 'text-muted'}`}>{slide.description}</p>}
                  {slide.buttonText && slide.buttonHref && <div className={`hero-action slide-anim d3 mt-8`}><Link href={slide.buttonHref} className={slide.textTone === 'light' ? 'btn-light' : 'btn-dark'}>{slide.buttonText}<ArrowRight size={16} /></Link></div>}
                </div>
              </div>}
            </div>
          </SwiperSlide>
        ))}
        {slides.length > 1 && <>
          <div className="hero-pagination absolute bottom-6 left-0 right-0 z-10 flex justify-center gap-2" />
          <button className="hero-prev nav-circle absolute left-6 top-1/2 z-10 -translate-y-1/2 max-md:hidden!" aria-label="Previous slide"><ArrowLeft size={18} /></button>
          <button className="hero-next nav-circle absolute right-6 top-1/2 z-10 -translate-y-1/2 max-md:hidden!" aria-label="Next slide"><ArrowRight size={18} /></button>
        </>}
      </Swiper>
    </section>
  )
}

