import type { Metadata } from 'next'
import { Suspense } from 'react'
import HeroSection from '@/components/homepage/HeroSection'
import CategorySlider from '@/components/homepage/CategorySlider'
import ProductTabSection from '@/components/homepage/ProductTabSection'
import BrandMarquee from '@/components/homepage/BrandMarquee'
import FlashSaleBanner from '@/components/homepage/FlashSaleBanner'
import PromoSplitBanners from '@/components/homepage/PromoSplitBanners'
import MarineSection from '@/components/homepage/MarineSection'
import SafetySection from '@/components/homepage/SafetySection'
import NewsletterSection from '@/components/homepage/NewsletterSection'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'Roshanal Global — Security, Marine, Solar & Technology Products Nigeria',
  description: 'Shop CCTV systems, marine accessories, boat engines, solar panels, kitchen equipment and security solutions. Free delivery in Port Harcourt. Roshanal Infotech Limited.',
  path: '/',
  keywords: ['CCTV Nigeria', 'Boat engines Nigeria', 'Marine accessories', 'Solar panels Nigeria', 'Security systems Port Harcourt'],
})

export const revalidate = 300 // ISR: re-generate every 5 minutes

export default function HomePage() {
  return (
    <>
      {/* Layer 5 — Hero (440px) */}
      <Suspense fallback={<div className="h-[440px] bg-brand-offwhite animate-pulse" />}>
        <HeroSection />
      </Suspense>

      {/* Category Slider */}
      <section className="py-10 bg-white border-b border-brand-border">
        <div className="container mx-auto px-4">
          <Suspense fallback={<div className="h-24 bg-brand-offwhite rounded-xl animate-pulse" />}>
            <CategorySlider />
          </Suspense>
        </div>
      </section>

      {/* Product Tab Section — Featured/Trending/New/etc. */}
      <section className="py-12 bg-brand-offwhite">
        <div className="container mx-auto px-4">
          <Suspense fallback={<div className="h-[480px] bg-white rounded-xl animate-pulse" />}>
            <ProductTabSection />
          </Suspense>
        </div>
      </section>

      {/* Flash Sale Banner */}
      <Suspense fallback={null}>
        <FlashSaleBanner />
      </Suspense>

      {/* Brand Logo Carousel */}
      <section className="py-8 bg-white border-y border-brand-border">
        <div className="container mx-auto px-4">
          <Suspense fallback={null}>
            <BrandMarquee />
          </Suspense>
        </div>
      </section>

      {/* Promo Split Banners */}
      <section className="py-10 bg-brand-offwhite">
        <div className="container mx-auto px-4">
          <Suspense fallback={null}>
            <PromoSplitBanners />
          </Suspense>
        </div>
      </section>

      {/* Marine Accessories Section */}
      <section className="py-12 bg-white border-t border-brand-border">
        <div className="container mx-auto px-4">
          <Suspense fallback={null}>
            <MarineSection />
          </Suspense>
        </div>
      </section>

      {/* Safety Equipment Section */}
      <section className="py-12 bg-brand-offwhite border-t border-brand-border">
        <div className="container mx-auto px-4">
          <Suspense fallback={null}>
            <SafetySection />
          </Suspense>
        </div>
      </section>

      {/* Newsletter */}
      <Suspense fallback={null}>
        <NewsletterSection />
      </Suspense>
    </>
  )
}
