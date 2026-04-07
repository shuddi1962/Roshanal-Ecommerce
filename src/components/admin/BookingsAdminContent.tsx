'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Plus, Search, Clock, CheckCircle, XCircle, User, MapPin, Phone, RefreshCw } from 'lucide-react'
import { cn, formatNaira, formatDate } from '@/lib/utils'
import type { BookingStatus } from '@/types/database'

interface Booking {
  id: string; user_id: string; service_type_id: string
  staff_id: string | null; date: string; time_slot: string
  status: BookingStatus; deposit_paid_kobo: number; balance_due_kobo: number
  total_kobo: number; address: string; notes: string | null
  created_at: string; users?: { name: string; email: string }
}

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  deposit_paid: 'bg-teal-100 text-teal-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending', confirmed: 'Confirmed', deposit_paid: 'Deposit Paid',
  in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled',
}

const SERVICE_LABELS: Record<string, string> = {
  cctv_installation: 'CCTV Installation', fire_alarm: 'Fire Alarm',
  access_control: 'Access Control', kitchen_installation: 'Kitchen Installation',
  maintenance: 'Maintenance', dredging: 'Dredging',
  boat_building_consultation: 'Boat Building', consultation: 'Consultation',
}

export default function BookingsAdminContent() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const loadBookings = async () => {
    setLoading(true)
    try {
      const url = statusFilter !== 'all' ? `/api/bookings?status=${statusFilter}` : '/api/bookings'
      const res = await fetch(url)
      const data = (await res.json()) as { bookings: Booking[] }
      setBookings(data.bookings ?? [])
    } catch { setBookings([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { void loadBookings() }, [statusFilter])

  const filtered = bookings.filter((b) => {
    if (!search) return true
    const s = search.toLowerCase()
    const userName = (b.users as { name?: string } | null)?.name ?? ''
    return userName.toLowerCase().includes(s) || b.address.toLowerCase().includes(s) || b.id.includes(s)
  })

  const updateStatus = async (id: string, status: BookingStatus) => {
    try {
      await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b))
    } catch {}
  }

  const stats = [
    { label: 'Pending', count: bookings.filter((b) => b.status === 'pending').length, color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Today', count: bookings.filter((b) => b.date === new Date().toISOString().split('T')[0]).length, color: 'bg-blue-50 text-blue-700' },
    { label: 'In Progress', count: bookings.filter((b) => b.status === 'in_progress').length, color: 'bg-purple-50 text-purple-700' },
    { label: 'Completed', count: bookings.filter((b) => b.status === 'completed').length, color: 'bg-green-50 text-success' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-syne font-800 text-2xl text-text-1 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-brand-blue" /> Bookings
          </h1>
          <p className="font-manrope text-text-3 text-sm mt-0.5">Manage service bookings with deposit payments.</p>
        </div>
        <button onClick={() => void loadBookings()}
          className="flex items-center gap-2 px-4 py-2 border border-brand-border rounded-lg text-sm font-manrope text-text-3 hover:bg-brand-offwhite">
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={cn('rounded-xl border p-4 text-center', s.color)}>
            <div className="font-syne font-800 text-2xl">{s.count}</div>
            <div className="font-manrope text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search bookings..."
            className="w-full pl-9 pr-4 py-2 border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-blue" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'pending', 'confirmed', 'deposit_paid', 'in_progress', 'completed', 'cancelled'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn('shrink-0 px-3 py-1.5 text-xs font-manrope font-600 rounded-full transition-colors capitalize',
                statusFilter === s ? 'bg-brand-blue text-white' : 'bg-white border border-brand-border text-text-3 hover:border-brand-blue')}>
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-lg" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-text-4 font-manrope">No bookings found.</div>
        ) : (
          <div className="divide-y divide-brand-border">
            {filtered.map((booking) => {
              const user = booking.users as { name?: string; email?: string } | null
              const status = booking.status as BookingStatus
              return (
                <motion.div key={booking.id} layout className="px-5 py-4 flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-offwhite rounded-lg flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-brand-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-syne font-700 text-text-1 text-sm">
                        {SERVICE_LABELS[booking.service_type_id] ?? booking.service_type_id}
                      </span>
                      <span className={cn('px-2.5 py-0.5 rounded-full text-[11px] font-manrope font-600 capitalize', STATUS_STYLES[status])}>
                        {STATUS_LABELS[status]}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-manrope text-text-3">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{user?.name ?? 'Guest'}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{(user?.email) ?? '—'}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{booking.address}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(booking.date)} · {booking.time_slot}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-syne font-700 text-text-1">{formatNaira(booking.total_kobo)}</div>
                    <div className="font-manrope text-text-4 text-xs">Dep: {formatNaira(booking.deposit_paid_kobo)}</div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
