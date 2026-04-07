import type { Metadata } from 'next'
import SiteDoctorContent from '@/components/admin/SiteDoctorContent'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Site Doctor | Admin',
  description: 'Auto-diagnostic system for Roshanal Global',
}

export default function SiteDoctorPage() {
  return <SiteDoctorContent />
}
