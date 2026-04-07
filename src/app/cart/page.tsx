import type { Metadata } from 'next'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import CartPageContent from '@/components/cart/CartPageContent'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'Shopping Cart — Roshanal Global',
  description: 'Review your shopping cart and proceed to checkout.',
  path: '/cart',
  noIndex: true,
})

export default async function CartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-offwhite animate-pulse" />}>
      <CartPageContent />
    </Suspense>
  )
}
