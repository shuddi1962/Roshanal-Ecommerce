import type { Metadata } from 'next'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import FeatureFlagsAdmin from '@/components/admin/FeatureFlagsAdmin'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'Feature Flags — Admin',
  path: '/admin/feature-flags',
})

export default async function FeatureFlagsPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  return (
    <Suspense fallback={<div className="h-screen bg-brand-offwhite animate-pulse" />}>
      <FeatureFlagsAdmin />
    </Suspense>
  )
}
