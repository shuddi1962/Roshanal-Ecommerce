import type { Metadata } from 'next'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ReviewsAdminContent from '@/components/admin/ReviewsAdminContent'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'Reviews — Admin',
  path: '/admin/reviews',
})

export default async function ReviewsAdminPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')
  return (
    <Suspense fallback={<div className="h-screen bg-brand-offwhite animate-pulse" />}>
      <ReviewsAdminContent />
    </Suspense>
  )
}
