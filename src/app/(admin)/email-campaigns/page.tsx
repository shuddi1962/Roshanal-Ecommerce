'use client'

import { Metadata } from 'next'
import dynamic from 'next/dynamic'

const EmailCampaignsContent = dynamic(
  () => import('@/components/admin/EmailCampaignsContent'),
  { ssr: false }
)

export const metadata: Metadata = {
  title: 'Email Campaigns | Admin',
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamicParam = 'force-dynamic'

export default function EmailCampaignsPage() {
  return <EmailCampaignsContent />
}
