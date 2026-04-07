import type { Metadata } from 'next'
import CouponsAdminContent from '@/components/admin/CouponsAdminContent'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Coupons | Admin',
  description: 'Manage discount coupons and promotions',
}

export default function CouponsPage() {
  return <CouponsAdminContent />
}
