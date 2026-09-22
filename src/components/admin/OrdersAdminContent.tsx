'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingBag, Search, RefreshCw, Eye, Package, Truck, CheckCircle, XCircle } from 'lucide-react'
import { cn, formatNaira, formatDate } from '@/lib/utils'
import type { OrderStatus } from '@/types/database'

interface Order {
  id: string; order_number: string; status: OrderStatus
  payment_status: string; total_kobo: number
  shipping_address: { name?: string; email?: string; phone?: string; address?: string; city?: string; state?: string }
  created_at: string
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700', shipped: 'bg-cyan-100 text-cyan-700',
  out_for_delivery: 'bg-teal-100 text-teal-700', delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700', refunded: 'bg-gray-100 text-gray-700',
}

export default function OrdersAdminContent() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const load = async () => {
    setLoading(true)
    try {
      const url = statusFilter !== 'all' ? `/api/orders?status=${statusFilter}&page=${page}` : `/api/orders?page=${page}`
      const res = await fetch(url)
      const data = (await res.json()) as { orders: Order[]; total: number }
      setOrders(data.orders ?? [])
      setTotal(data.total ?? 0)
    } catch { setOrders([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [statusFilter, page])

  const filtered = orders.filter((o) => {
    if (!search) return true
    const s = search.toLowerCase()
    return o.order_number.toLowerCase().includes(s) ||
      (o.shipping_address?.name ?? '').toLowerCase().includes(s)
  })

  const revenue = orders.reduce((sum, o) => sum + o.total_kobo, 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-syne font-800 text-2xl text-text-1 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-brand-blue" /> Orders
        </h1>
        <button onClick={() => void load()}
          className="flex items-center gap-2 px-4 py-2 border border-brand-border rounded-lg text-sm font-manrope text-text-3 hover:bg-brand-offwhite">
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: total, color: 'text-text-1' },
          { label: 'Pending', value: orders.filter((o) => o.status === 'pending').length, color: 'text-yellow-600' },
          { label: 'Revenue (NGN)', value: `₦${(revenue / 100 / 1000000).toFixed(2)}M`, color: 'text-success' },
          { label: 'COD', value: orders.filter((o) => o.payment_status === 'cod_pending').length, color: 'text-brand-blue' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-brand-border p-4 text-center">
            <div className="font-syne font-800 text-xl text-text-1">{s.value}</div>
            <div className="font-manrope text-text-4 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order # or name..."
            className="w-full pl-9 pr-4 py-2 border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-blue" />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
              className={cn('px-3 py-1.5 text-xs font-manrope font-600 rounded-full capitalize transition-colors',
                statusFilter === s ? 'bg-brand-blue text-white' : 'bg-white border border-brand-border text-text-3')}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-lg" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-text-4 font-manrope">No orders found.</div>
        ) : (
          <div className="divide-y divide-brand-border">
            {filtered.map((order) => (
              <div key={order.id} className="flex items-center gap-4 px-5 py-4 hover:bg-brand-offwhite transition-colors">
                <div className="w-10 h-10 bg-brand-offwhite rounded-lg flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-brand-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs font-600 text-brand-blue">{order.order_number}</div>
                  <div className="font-manrope text-text-3 text-xs mt-0.5">
                    {(order.shipping_address as { name?: string } | null)?.name ?? '—'} · {(order.shipping_address as { city?: string } | null)?.city ?? '—'}
                  </div>
                  <div className="font-manrope text-text-4 text-xs mt-0.5">{formatDate(order.created_at)}</div>
                </div>
                <div className="font-syne font-700 text-text-1 text-sm">{formatNaira(order.total_kobo)}</div>
                <span className={cn('px-2.5 py-1 rounded-full text-[11px] font-manrope font-600 capitalize',
                  STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-700')}>
                  {order.status.replace('_', ' ')}
                </span>
                <Link href={`/admin/orders/${order.id}`} className="p-1.5 hover:bg-brand-offwhite rounded-lg transition-colors">
                  <Eye className="w-4 h-4 text-text-3" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {total > 20 && (
        <div className="flex gap-2 justify-center">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border border-brand-border rounded-lg text-sm font-manrope disabled:opacity-40 hover:bg-brand-offwhite">
            Previous
          </button>
          <span className="px-4 py-2 font-manrope text-sm text-text-3">Page {page}</span>
          <button onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border border-brand-border rounded-lg text-sm font-manrope hover:bg-brand-offwhite">
            Next
          </button>
        </div>
      )}
    </div>
  )
}
