import type { Metadata } from 'next'
import CartPageContent from '@/components/cart/CartPageContent'

export const metadata: Metadata = {
  title: 'Your Cart | Roshanal Global',
  robots: { index: false },
}

export default function CartPage() {
  return <CartPageContent />
}
