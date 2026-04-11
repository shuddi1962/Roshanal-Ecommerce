import type { Metadata } from 'next'
import { Suspense } from 'react'
import ShopPageContent from '@/components/shop/ShopPageContent'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'Shop All Products — Security, Marine, Solar & Technology',
  description: 'Browse Roshanal Global\'s complete product catalog. CCTV systems, boat engines, marine accessories, solar panels, networking equipment and more.',
  path: '/shop',
})

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-offwhite animate-pulse" />}>
      <ShopPageContent />
    </Suspense>
  )
}
