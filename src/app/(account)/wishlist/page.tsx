import type { Metadata } from 'next'
import { Suspense } from 'react'
import WishlistComponents from '@/features/wishlist/WishlistPage'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'My Wishlist — Roshanal Global',
  path: '/account/wishlist',
})

export default function WishlistPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-offwhite animate-pulse" />}>
      <WishlistComponents />
    </Suspense>
  )
}
