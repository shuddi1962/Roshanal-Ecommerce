import type { Metadata } from 'next'
import { Suspense } from 'react'
import AdminDashboardContent from '@/components/admin/AdminDashboardContent'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'Admin Dashboard — Roshanal Global',
  description: 'Roshanal Global admin dashboard overview.',
  path: '/admin/dashboard',
})

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-brand-offwhite animate-pulse" />}>
      <AdminDashboardContent />
    </Suspense>
  )
}
