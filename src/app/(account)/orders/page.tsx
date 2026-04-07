import type { Metadata } from 'next'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import OrdersAccountContent from '@/components/account/OrdersAccountContent'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'My Orders — Account',
  path: '/account/orders',
})

export default async function AccountOrdersPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login?callbackUrl=/account/orders')

  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-offwhite animate-pulse" />}>
      <OrdersAccountContent userId={session.user.id} />
    </Suspense>
  )
}
