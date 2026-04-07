import type { Metadata } from 'next'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CustomersAdminContent from '@/components/admin/CustomersAdminContent'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'Customers — Admin',
  path: '/admin/customers',
})

export default async function AdminCustomersPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  return (
    <Suspense fallback={<div className="h-screen bg-brand-offwhite animate-pulse" />}>
      <CustomersAdminContent />
    </Suspense>
  )
}
