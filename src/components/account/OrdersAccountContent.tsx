'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, ChevronRight, Package, Truck, CheckCircle, Clock } from 'lucide-react'
import { cn, formatNaira, formatDate } from '@/lib/utils'
import type { OrderStatus } from '@/types/database'

interface OrderItem {
  id: string; order_number: string; status: OrderStatus
  payment_status: string; total_kobo: number; created_at: string
}

const STATUS_STEPS: Record<OrderStatus, number> = {
  pending: 0, confirmed: 1, processing: 2, shipped: 3,
  out_for_delivery: 4, delivered: 5, cancelled: 0, refunded: 0,
  return_requested: 0, returned: 0,
}

const STATUS_ICONS: Record<string, React.ElementType> = {
  pending: Clock, confirmed: Package, processing: Package,
  shipped: Truck, out_for_delivery: Truck, delivered: CheckCircle,
  cancelled: Clock, refunded: Clock,
}

interface OrdersAccountContentProps {
  userId: string
}

export default function OrdersAccountContent({ userId }: OrdersAccountContentProps) {
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/orders?userId=${encodeURIComponent(userId)}&page=${page}&limit=10`)
        const data = (await res.json()) as { orders: OrderItem[] }
        setOrders(page === 1 ? data.orders ?? [] : (prev) => [...prev, ...(data.orders ?? [])])
      } catch {}
      finally { setLoading(false) }
    })()
  }, [userId, page])

  const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700', shipped: 'bg-cyan-100 text-cyan-700',
    out_for_delivery: 'bg-teal-100 text-teal-700', delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-5">
      <h1 className="font-syne font-800 text-2xl text-text-1 flex items-center gap-3">
        <ShoppingBag className="w-6 h-6 text-brand-blue" /> My Orders
      </h1>

      {loading && orders.length === 0 ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-brand-border p-10 text-center">
          <ShoppingBag className="w-10 h-10 text-text-4 mx-auto mb-3" />
          <h3 className="font-syne font-700 text-text-1 mb-1">No orders yet</h3>
          <p className="font-manrope text-text-3 text-sm mb-4">When you place an order, it will appear here.</p>
          <Link href="/shop" className="inline-flex items-center gap-2 bg-brand-blue text-white font-syne font-700 text-sm px-5 py-2.5 rounded-xl hover:bg-blue-700">
            Start Shopping <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const Icon = STATUS_ICONS[order.status] ?? Package
            return (
              <Link key={order.id} href={`/account/orders/${order.id}`}
                className="bg-white rounded-xl border border-brand-border p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow">
                <div className="w-10 h-10 bg-brand-offwhite rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-brand-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-600 text-brand-blue">{order.order_number}</span>
                    <span className={cn('px-2.5 py-0.5 rounded-full text-[11px] font-manrope font-600 capitalize',
                      STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-700')}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="font-manrope text-text-4 text-xs mt-1">{formatDate(order.created_at)}</div>
                </div>
                <div className="text-right">
                  <div className="font-syne font-700 text-text-1">{formatNaira(order.total_kobo)}</div>
                  <div className="font-manrope text-xs text-text-4 capitalize">{order.payment_status.replace('_', ' ')}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-text-4 shrink-0" />
              </Link>
            )
          })}

          <div className="text-center pt-4">
            <button onClick={() => setPage(p => p + 1)} disabled={loading}
              className="px-8 py-2.5 border border-brand-border rounded-xl text-sm font-manrope text-text-3 hover:bg-brand-offwhite disabled:opacity-50">
              {loading ? 'Loading...' : 'Load More Orders'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
