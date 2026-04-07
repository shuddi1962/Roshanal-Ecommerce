'use client'

import dynamic from 'next/dynamic'

const EmailCampaignsContent = dynamic(
  () => import('@/components/admin/EmailCampaignsContent'),
  { ssr: false }
)

export default function EmailCampaignsPage() {
  return <EmailCampaignsContent />
}