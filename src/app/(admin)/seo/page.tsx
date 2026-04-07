'use client'

import dynamic from 'next/dynamic'

const SEOAdminContent = dynamic(
  () => import('@/components/admin/SEOAdminContent'),
  { ssr: false }
)

export default function SEOPage() {
  return <SEOAdminContent />
}