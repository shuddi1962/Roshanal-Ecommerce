import type { Metadata } from 'next'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import BookingsAdminContent from '@/components/admin/BookingsAdminContent'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'Bookings — Admin',
  path: '/admin/bookings',
})

export default async function BookingsPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  return (
    <Suspense fallback={<div className="h-screen bg-brand-offwhite animate-pulse" />}>
      <BookingsAdminContent />
    </Suspense>
  )
}
