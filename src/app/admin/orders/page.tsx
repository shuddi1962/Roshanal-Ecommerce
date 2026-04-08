import type { Metadata } from 'next'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import OrdersAdminContent from '@/components/admin/OrdersAdminContent'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'Orders — Admin',
  path: '/admin/orders',
})

export default async function AdminOrdersPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  return (
    <Suspense fallback={<div className="h-screen bg-brand-offwhite animate-pulse" />}>
      <OrdersAdminContent />
    </Suspense>
  )
}
