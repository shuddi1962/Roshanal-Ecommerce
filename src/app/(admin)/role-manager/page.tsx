'use client'

import { Metadata } from 'next'
import dynamic from 'next/dynamic'

const RoleManagerContent = dynamic(
  () => import('@/components/admin/RoleManagerContent'),
  { ssr: false }
)

export const metadata: Metadata = {
  title: 'Role Manager | Admin',
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamicParam = 'force-dynamic'

export default function RoleManagerPage() {
  return <RoleManagerContent />
}
