'use client'

import dynamic from 'next/dynamic'

const RoleManagerContent = dynamic(
  () => import('@/components/admin/RoleManagerContent'),
  { ssr: false }
)

export default function RoleManagerPage() {
  return <RoleManagerContent />
}