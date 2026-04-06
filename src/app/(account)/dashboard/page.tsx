import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { adminDb } from '@/lib/db'
import Link from 'next/link'
import { ShoppingBag, Heart, Wallet, Trophy, ArrowRight, Package } from 'lucide-react'
import { formatNaira } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'My Account | Roshanal Global',
  robots: { index: false },
}

export const dynamic = 'force-dynamic'

export default async function AccountDashboardPage() {
  const session = await auth()
  if (!session?.user) return null

  const [userResult, ordersResult] = await Promise.allSettled([
    adminDb.from('users').select('wallet_balance_kobo, loyalty_points, loyalty_tier').eq('id', session.user.id).single(),
    adminDb.from('orders').select('id, order_number, status, total_kobo, created_at').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(5),
  ])

  const user = userResult.status === 'fulfilled' ? userResult.value.data : null
  const orders = ordersResult.status === 'fulfilled' ? ordersResult.value.data ?? [] : []

  const STATUS_COLOR: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped: 'bg-cyan-100 text-cyan-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-syne font-800 text-2xl text-text-1 mb-1">Welcome back, {session.user.name.split(' ')[0]}!</h1>
        <p className="font-manrope text-text-3 text-sm">Manage your orders, wallet, loyalty points and more.</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: String(orders.length), icon: ShoppingBag, color: 'bg-blue-50 text-brand-blue', href: '/account/orders' },
          { label: 'Wallet Balance', value: user ? formatNaira(Number(user.wallet_balance_kobo) || 0) : '₦0', icon: Wallet, color: 'bg-green-50 text-success', href: '/account/wallet' },
          { label: 'Loyalty Points', value: String(user?.loyalty_points ?? 0), icon: Trophy, color: 'bg-amber-50 text-amber-600', href: '/account/loyalty' },
          { label: 'Tier', value: (user?.loyalty_tier as string ?? 'Bronze'), icon: Heart, color: 'bg-red-50 text-brand-red', href: '/account/loyalty' },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}
            className="bg-white rounded-xl border border-brand-border p-4 hover:shadow-card transition-shadow group">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-4.5 h-4.5" />
            </div>
            <div className="font-syne font-800 text-text-1 text-xl capitalize">{stat.value}</div>
            <div className="font-manrope text-text-3 text-xs mt-0.5">{stat.label}</div>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border">
          <h2 className="font-syne font-700 text-text-1">Recent Orders</h2>
          <Link href="/account/orders" className="text-xs text-brand-blue hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-12 text-center">
            <Package className="w-10 h-10 text-text-4 mx-auto mb-3" />
            <p className="font-manrope text-text-3 text-sm">No orders yet.</p>
            <Link href="/shop" className="mt-3 inline-flex items-center gap-1.5 text-brand-blue font-manrope font-600 text-sm hover:underline">
              Start Shopping <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-brand-border">
            {(orders as Array<{ id: string; order_number: string; status: string; total_kobo: number; created_at: string }>).map((order) => (
              <div key={order.id} className="flex items-center gap-4 px-5 py-4 hover:bg-brand-offwhite transition-colors">
                <div className="flex-1 min-w-0">
                  <Link href={`/account/orders/${order.id}`} className="font-mono text-sm font-700 text-brand-blue hover:underline">{order.order_number}</Link>
                  <div className="font-manrope text-text-4 text-xs mt-0.5">{new Date(order.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-manrope font-600 capitalize ${STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                  {order.status}
                </span>
                <span className="font-syne font-700 text-brand-red text-sm shrink-0">{formatNaira(order.total_kobo)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
