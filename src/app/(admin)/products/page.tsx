import type { Metadata } from 'next'
import AdminProductsContent from '@/components/admin/AdminProductsContent'

export const metadata: Metadata = {
  title: 'Products | Admin',
  robots: { index: false },
}

export const dynamic = 'force-dynamic'

export default function AdminProductsPage() {
  return <AdminProductsContent />
}
