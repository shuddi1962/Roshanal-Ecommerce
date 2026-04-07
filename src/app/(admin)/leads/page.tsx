import type { Metadata } from 'next'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LeadsAdminContent from '@/components/admin/LeadsAdminContent'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Leads | Admin',
  robots: { index: false, follow: false },
}

export default async function LeadsPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  return (
    <Suspense fallback={<div className="h-screen bg-brand-offwhite animate-pulse" />}>
      <LeadsAdminContent />
    </Suspense>
  )
}
