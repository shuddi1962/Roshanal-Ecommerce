import type { Metadata } from 'next'
import { generateMetadata as genMeta } from '@/lib/seo'
import AdminDashboardContent from '@/components/admin/AdminDashboardContent'

export const metadata: Metadata = genMeta({
  title: 'Admin Dashboard',
  description: 'Roshanal Global Admin Dashboard',
  path: '/admin/dashboard',
  noIndex: true,
})

export const dynamic = 'force-dynamic'

export default function AdminDashboardPage() {
  return <AdminDashboardContent />
}
