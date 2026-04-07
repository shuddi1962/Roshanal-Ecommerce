import type { Metadata } from 'next'
import { Suspense } from 'react'
import WishlistPage from '@/features/wishlist/WishlistPage'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'My Wishlist — Roshanal Global',
  description: 'Your saved products and wishlist items.',
  path: '/account/wishlist',
})

export default async function WishlistPageRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-offwhite animate-pulse" />}>
      <WishlistPage />
    </Suspense>
  )
}
