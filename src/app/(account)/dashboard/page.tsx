import type { Metadata } from 'next'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AccountDashboardContent from '@/components/account/AccountDashboardContent'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'My Account — Roshanal Global',
  description: 'Manage your Roshanal Global account, orders, wishlist and more.',
  path: '/account/dashboard',
})

export default async function AccountDashboardPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/account/dashboard')
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-offwhite animate-pulse" />}>
      <AccountDashboardContent user={session.user} />
    </Suspense>
  )
}
