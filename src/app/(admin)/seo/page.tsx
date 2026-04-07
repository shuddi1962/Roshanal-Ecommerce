'use client'

import { Metadata } from 'next'
import dynamic from 'next/dynamic'

const SEOAdminContent = dynamic(
  () => import('@/components/admin/SEOAdminContent'),
  { ssr: false }
)

export const metadata: Metadata = {
  title: 'SEO & Indexing | Admin',
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamicParam = 'force-dynamic'

export default function SEOPage() {
  return <SEOAdminContent />
}
