import type { Metadata } from 'next'
import InventoryAdminContent from '@/components/admin/InventoryAdminContent'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Inventory | Admin',
  description: 'Multi-location inventory management for Roshanal Global',
  robots: { index: false },
}

export default function InventoryPage() {
  return <InventoryAdminContent />
}
