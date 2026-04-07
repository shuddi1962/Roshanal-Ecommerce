import type { Metadata } from 'next'
import WalletAdminContent from '@/components/admin/WalletAdminContent'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Wallet & Payouts | Admin',
  description: 'Manage customer wallets and vendor payouts',
}

export default function WalletPage() {
  return <WalletAdminContent />
}
