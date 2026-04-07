'use client'

import { Metadata } from 'next'
import dynamic from 'next/dynamic'

const BannersAdminContent = dynamic(
  () => import('@/components/admin/BannersAdminContent'),
  { ssr: false }
)

export const metadata: Metadata = {
  title: 'Banners & Popups | Admin',
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamicParam = 'force-dynamic'

export default function BannersPage() {
  return <BannersAdminContent />
}
