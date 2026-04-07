'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ShoppingBag, Heart, Wallet, Trophy, MapPin, ChevronRight,
  Package, ArrowRight, Star, Clock, Truck, BarChart2,
} from 'lucide-react'
import { cn, formatNaira, formatDate } from '@/lib/utils'

interface AccountDashboardContentProps {
  user: { id: string; name: string; email: string; role: string; avatar: string | null }
}

interface OrderSummary {
  id: string; order_number: string; status: string
  total_kobo: number; created_at: string
}

interface StatCard {
  label: string
  value: string
  icon: React.ElementType
  href: string
  color: string
}

export default function AccountDashboardContent({ user }: AccountDashboardContentProps) {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [compareCount, setCompareCount] = useState(0)

  useEffect(() => {
    const wish = JSON.parse(localStorage.getItem('rg_wishlist') ?? '[]') as unknown[]
    const comp = JSON.parse(localStorage.getItem('rg_compare') ?? '[]') as unknown[]
    setWishlistCount(wish.length)
    setCompareCount(comp.length)

    void (async () => {
      try {
        const res = await fetch('/api/orders?userId=me&limit=5')
        if (res.ok) {
          const data = (await res.json()) as { orders?: OrderSummary[] }
          setOrders(data.orders ?? [])
        }
      } catch {}
      finally { setLoadingOrders(false) }
    })()
  }, [])

  const stats: StatCard[] = [
    { label: 'Total Orders', value: '—', icon: ShoppingBag, href: '/account/orders', color: 'bg-blue-50 text-brand-blue' },
    { label: 'Wishlist Items', value: String(wishlistCount), icon: Heart, href: '/account/wishlist', color: 'bg-red-50 text-brand-red' },
    { label: 'Compare Items', value: String(compareCount), icon: BarChart2, href: '/account/compare', color: 'bg-purple-50 text-purple-600' },
    { label: 'Wallet Balance', value: '₦0.00', icon: Wallet, href: '/account/wallet', color: 'bg-green-50 text-success' },
  ]

  const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped: 'bg-cyan-100 text-cyan-700',
    out_for_delivery: 'bg-teal-100 text-teal-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-syne font-800 text-2xl text-text-1">My Account</h1>
          <p className="font-manrope text-text-3 text-sm mt-0.5">Welcome back, {user.name.split(' ')[0]}!</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-brand-offwhite border border-brand-border rounded-lg px-3 py-1.5">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span className="font-manrope text-xs text-text-3">
            <span className="font-600 text-text-2">{user.role.replace('_', ' ')}</span> member
          </span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}
            className="bg-white rounded-xl border border-brand-border p-4 hover:shadow-card-hover transition-shadow">
            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-3', stat.color)}>
              <stat.icon className="w-4.5 h-4.5" />
            </div>
            <div className="font-syne font-800 text-xl text-text-1">{stat.value}</div>
            <div className="font-manrope text-text-4 text-xs mt-0.5">{stat.label}</div>
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
        {loadingOrders ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="skeleton w-10 h-10 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <ShoppingBag className="w-10 h-10 text-text-4 mx-auto mb-3" />
            <p className="font-manrope text-text-3 text-sm">No orders yet.</p>
            <Link href="/shop" className="mt-3 inline-flex items-center gap-1.5 text-sm text-brand-blue hover:underline">
              Start Shopping <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-brand-border">
            {orders.map((order) => (
              <Link key={order.id} href={`/account/orders/${order.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-brand-offwhite transition-colors">
                <div className="w-10 h-10 bg-brand-offwhite rounded-lg flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-text-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs font-600 text-brand-blue">{order.order_number}</div>
                  <div className="font-manrope text-text-3 text-xs mt-0.5 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {formatDate(order.created_at)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-syne font-700 text-text-1 text-sm">{formatNaira(order.total_kobo)}</div>
                  <span className={cn('inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-manrope font-600 capitalize',
                    STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-700')}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-text-4 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Track Order', href: '/track-order', icon: Truck, desc: 'Follow your delivery' },
          { label: 'My Addresses', href: '/account/addresses', icon: MapPin, desc: 'Manage delivery addresses' },
          { label: 'Loyalty Points', href: '/account/loyalty', icon: Star, desc: 'Earn and redeem points' },
        ].map((link) => (
          <Link key={link.href} href={link.href}
            className="flex items-center gap-3 bg-white rounded-xl border border-brand-border p-4 hover:shadow-card-hover transition-shadow">
            <div className="w-9 h-9 bg-brand-offwhite rounded-lg flex items-center justify-center shrink-0">
              <link.icon className="w-4.5 h-4.5 text-brand-blue" />
            </div>
            <div>
              <div className="font-syne font-700 text-text-1 text-sm">{link.label}</div>
              <div className="font-manrope text-text-4 text-xs">{link.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
