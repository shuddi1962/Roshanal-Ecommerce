import type { Metadata } from 'next'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CheckoutFlow from '@/components/checkout/CheckoutFlow'

export const metadata: Metadata = {
  title: 'Checkout | Roshanal Global',
  robots: { index: false },
}

export default async function CheckoutPage() {
  const session = await auth()
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-offwhite animate-pulse" />}>
      <CheckoutFlow initialStep={0} />
    </Suspense>
  )
}
