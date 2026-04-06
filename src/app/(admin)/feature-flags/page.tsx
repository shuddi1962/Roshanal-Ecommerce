import type { Metadata } from 'next'
import FeatureFlagsAdmin from '@/components/admin/FeatureFlagsAdmin'

export const metadata: Metadata = {
  title: 'Feature Flags | Admin',
  robots: { index: false },
}

export const dynamic = 'force-dynamic'

export default function FeatureFlagsPage() {
  return <FeatureFlagsAdmin />
}
