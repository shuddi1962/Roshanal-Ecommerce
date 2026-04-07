import type { Metadata } from 'next'
import { Suspense } from 'react'
import ConfirmationContent from '@/components/checkout/ConfirmationContent'

export const metadata: Metadata = {
  title: 'Order Confirmed | Roshanal Global',
  robots: { index: false },
}

export default function CheckoutConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-offwhite animate-pulse" />}>
      <ConfirmationContent />
    </Suspense>
  )
}
