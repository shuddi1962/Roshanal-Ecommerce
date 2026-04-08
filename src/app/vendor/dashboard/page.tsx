import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { adminDb } from '@/lib/db'
import Link from 'next/link'
import { Package, ShoppingBag, DollarSign, BarChart3, ArrowRight, Plus, TrendingUp } from 'lucide-react'
import { formatNaira } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Vendor Dashboard | Roshanal Global',
  robots: { index: false },
}

export const dynamic = 'force-dynamic'

export default async function VendorDashboardPage() {
  const session = await auth()
  if (!session?.user) return null

  const { data: vendor } = await adminDb
    .from('vendors')
    .select('id, shop_name, total_sales_kobo, pending_payout_kobo, rating, is_approved, tier')
    .eq('user_id', session.user.id)
    .single()

  const stats = [
    { label: 'Total Sales', value: vendor ? formatNaira(Number(vendor.total_sales_kobo || 0)) : '₦0', icon: DollarSign, color: 'bg-blue-50 text-brand-blue' },
    { label: 'Pending Payout', value: vendor ? formatNaira(Number(vendor.pending_payout_kobo || 0)) : '₦0', icon: TrendingUp, color: 'bg-green-50 text-success' },
    { label: 'Products', value: '—', icon: Package, color: 'bg-purple-50 text-purple-600' },
    { label: 'Orders', value: '—', icon: ShoppingBag, color: 'bg-amber-50 text-amber-600' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-syne font-800 text-2xl text-text-1">{vendor?.shop_name ?? 'Vendor Dashboard'}</h1>
        <p className="text-text-3 font-manrope text-sm mt-0.5 flex items-center gap-2">
          {vendor?.is_approved
            ? <span className="text-success text-xs font-600">✓ Approved Vendor</span>
            : <span className="text-warning text-xs font-600">⏳ Pending Approval</span>}
          <span>·</span>
          <span className="capitalize">{vendor?.tier ?? 'Standard'} Tier</span>
        </p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-brand-border p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-4.5 h-4.5" />
            </div>
            <div className="font-syne font-800 text-xl text-text-1">{stat.value}</div>
            <div className="font-manrope text-text-3 text-xs mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/vendor/products/new" className="bg-brand-blue text-white rounded-xl p-5 flex items-center gap-3 hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5 shrink-0" />
          <div>
            <div className="font-syne font-700 text-sm">Add New Product</div>
            <div className="text-white/70 text-xs font-manrope">List a product in the marketplace</div>
          </div>
        </Link>
        <Link href="/vendor/ads/new" className="bg-brand-offwhite border border-brand-border rounded-xl p-5 flex items-center gap-3 hover:shadow-card transition-shadow">
          <BarChart3 className="w-5 h-5 text-brand-blue shrink-0" />
          <div>
            <div className="font-syne font-700 text-text-1 text-sm">Create Ad Campaign</div>
            <div className="text-text-3 text-xs font-manrope">CPC, CPM, CPA advertising</div>
          </div>
          <ArrowRight className="w-4 h-4 text-text-4 ml-auto shrink-0" />
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-brand-border p-5">
        <div className="text-center py-8">
          <Package className="w-10 h-10 text-text-4 mx-auto mb-3" />
          <p className="font-manrope text-text-3 text-sm">Your recent orders and analytics will appear here.</p>
          <Link href="/vendor/products/new" className="mt-3 inline-flex items-center gap-1.5 text-brand-blue font-manrope font-600 text-sm hover:underline">
            <Plus className="w-3.5 h-3.5" /> Add your first product
          </Link>
        </div>
      </div>
    </div>
  )
}
