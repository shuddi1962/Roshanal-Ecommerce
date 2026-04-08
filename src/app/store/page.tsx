'use client'

import dynamic from 'next/dynamic'

const ShopPageContent = dynamic(
  () => import('@/components/shop/ShopPageContent'),
  { ssr: false }
)

export default function StorePage() {
  return <ShopPageContent />
}