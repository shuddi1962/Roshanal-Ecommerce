'use client'

import dynamic from 'next/dynamic'

const BannersAdminContent = dynamic(
  () => import('@/components/admin/BannersAdminContent'),
  { ssr: false }
)

export default function BannersPage() {
  return <BannersAdminContent />
}