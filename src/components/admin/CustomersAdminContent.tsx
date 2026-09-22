'use client'

import React, { useState, useEffect } from 'react'
import { Users, Search, RefreshCw, Mail, Phone, ShoppingBag } from 'lucide-react'
import { cn, formatNaira, formatDate } from '@/lib/utils'

interface Customer {
  id: string; name: string; email: string; phone: string | null
  role: string; loyalty_tier: string; loyalty_points: number
  wallet_balance_kobo: number; created_at: string
}

export default function CustomersAdminContent() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/customers')
      if (res.ok) {
        const data = (await res.json()) as { customers: Customer[] }
        setCustomers(data.customers ?? [])
      }
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [])

  const filtered = customers.filter((c) => {
    if (!search) return true
    const s = search.toLowerCase()
    return c.name.toLowerCase().includes(s) || c.email.toLowerCase().includes(s) || (c.phone ?? '').includes(s)
  })

  const TIER_COLORS: Record<string, string> = {
    bronze: 'bg-amber-100 text-amber-700', silver: 'bg-gray-100 text-gray-600',
    gold: 'bg-yellow-100 text-yellow-700', platinum: 'bg-purple-100 text-purple-700',
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-syne font-800 text-2xl text-text-1 flex items-center gap-2">
          <Users className="w-6 h-6 text-brand-blue" /> Customers
        </h1>
        <button onClick={() => void load()}
          className="flex items-center gap-2 px-4 py-2 border border-brand-border rounded-lg text-sm font-manrope text-text-3 hover:bg-brand-offwhite">
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', value: customers.length, color: 'text-text-1' },
          { label: 'New This Month', value: customers.filter((c) => new Date(c.created_at) > new Date(Date.now() - 30 * 86400000)).length, color: 'text-brand-blue' },
          { label: 'Loyalty Members', value: customers.filter((c) => c.loyalty_points > 0).length, color: 'text-success' },
          { label: 'Total Revenue', value: `₦${(customers.reduce((s, c) => s + c.wallet_balance_kobo, 0) / 100 / 1000000).toFixed(2)}M`, color: 'text-success' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-brand-border p-4 text-center">
            <div className={cn('font-syne font-800 text-xl', s.color)}>{s.value}</div>
            <div className="font-manrope text-text-4 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, phone..."
          className="w-full pl-9 pr-4 py-2 border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-blue" />
      </div>

      <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-lg" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-text-4 font-manrope">No customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-brand-offwhite">
                <tr>
                  {['Customer', 'Email / Phone', 'Role', 'Loyalty', 'Wallet', 'Joined'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-manrope font-700 text-text-4 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-brand-offwhite transition-colors">
                    <td className="px-5 py-3.5 font-manrope font-600 text-sm text-text-1">{c.name}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-manrope text-xs text-text-2 flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</div>
                      {c.phone && <div className="font-manrope text-xs text-text-4 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" />{c.phone}</div>}
                    </td>
                    <td className="px-5 py-3.5 font-manrope text-xs text-text-3 capitalize">{c.role.replace('_', ' ')}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className={cn('px-2.5 py-1 rounded-full text-[11px] font-manrope font-600 capitalize', TIER_COLORS[c.loyalty_tier] ?? 'bg-gray-100 text-gray-600')}>
                          {c.loyalty_tier}
                        </span>
                        <span className="font-manrope text-xs text-text-4">{c.loyalty_points.toLocaleString()} pts</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-syne font-700 text-sm text-text-1">{formatNaira(c.wallet_balance_kobo)}</td>
                    <td className="px-5 py-3.5 font-manrope text-xs text-text-4">{formatDate(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
