'use client'

import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import POSContent from '@/components/admin/POSContent'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'POS Terminal | Admin',
  robots: { index: false, follow: false },
}

export default async function POSPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  return (
    <Suspense fallback={<div className="h-screen bg-brand-offwhite animate-pulse" />}>
      <POSContent />
    </Suspense>
  )
}
