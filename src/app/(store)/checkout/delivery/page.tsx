import type { Metadata } from 'next'
import CheckoutFlow from '@/components/checkout/CheckoutFlow'

export const metadata: Metadata = {
  title: 'Checkout | Roshanal Global',
  robots: { index: false },
}

export default function CheckoutDeliveryPage() {
  return <CheckoutFlow initialStep={0} />
}
