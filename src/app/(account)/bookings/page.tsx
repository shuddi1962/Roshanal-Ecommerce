'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  Calendar, MapPin, Clock, AlertCircle, ChevronDown, ChevronUp, 
  Plus, X, CheckCircle, Ship, UtensilsCrossed, Wrench, Waves 
} from 'lucide-react'
import { cn, formatNaira, formatDate } from '@/lib/utils'
import type { BookingStatus } from '@/types/database'
import toast from 'react-hot-toast'

interface Booking {
  id: string
  service_type_id: string
  date: string
  time_slot: string
  status: BookingStatus
  deposit_paid_kobo: number
  balance_due_kobo: number
  total_kobo: number
  address: string
  notes: string | null
  created_at: string
}

const STATUS_CONFIG: Record<BookingStatus, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  pending: { 
    label: 'Pending', 
    bg: 'bg-yellow-100', 
    text: 'text-yellow-700',
    icon: <AlertCircle className="w-3.5 h-3.5" />
  },
  confirmed: { 
    label: 'Confirmed', 
    bg: 'bg-blue-100', 
    text: 'text-blue-700',
    icon: <CheckCircle className="w-3.5 h-3.5" />
  },
  deposit_paid: { 
    label: 'Deposit Paid', 
    bg: 'bg-green-100', 
    text: 'text-green-700',
    icon: <CheckCircle className="w-3.5 h-3.5" />
  },
  in_progress: { 
    label: 'In Progress', 
    bg: 'bg-purple-100', 
    text: 'text-purple-700',
    icon: <Clock className="w-3.5 h-3.5" />
  },
  completed: { 
    label: 'Completed', 
    bg: 'bg-teal-100', 
    text: 'text-teal-700',
    icon: <CheckCircle className="w-3.5 h-3.5" />
  },
  cancelled: { 
    label: 'Cancelled', 
    bg: 'bg-red-100', 
    text: 'text-red-700',
    icon: <X className="w-3.5 h-3.5" />
  },
}

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  boat_building: <Ship className="w-5 h-5" />,
  kitchen_installation: <UtensilsCrossed className="w-5 h-5" />,
  maintenance: <Wrench className="w-5 h-5" />,
  dredging: <Waves className="w-5 h-5" />,
  cctv_installation: <Wrench className="w-5 h-5" />,
  fire_alarm: <Wrench className="w-5 h-5" />,
  access_control: <Wrench className="w-5 h-5" />,
  consultation: <Wrench className="w-5 h-5" />,
}

const SERVICE_LABELS: Record<string, string> = {
  boat_building: 'Boat Building',
  kitchen_installation: 'Kitchen Installation',
  maintenance: 'Maintenance',
  dredging: 'Dredging',
  cctv_installation: 'CCTV Installation',
  fire_alarm: 'Fire Alarm',
  access_control: 'Access Control',
  consultation: 'Consultation',
}

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/bookings/my-bookings')
      const data = await res.json()
      setBookings(data.bookings ?? [])
    } catch {
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const cancelBooking = async (id: string) => {
    setCancellingId(id)
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      if (!res.ok) throw new Error('Failed to cancel booking')
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' as BookingStatus } : b))
      toast.success('Booking cancelled successfully')
    } catch {
      toast.error('Failed to cancel booking')
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-brand-offwhite rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-20 h-20 bg-brand-offwhite rounded-full flex items-center justify-center mx-auto mb-6">
          <Calendar className="w-10 h-10 text-brand-blue" />
        </div>
        <h1 className="font-syne font-800 text-2xl text-text-1 mb-2">No Bookings Yet</h1>
        <p className="font-manrope text-text-3 mb-8">You haven't made any service bookings yet.</p>
        <Link
          href="/book"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white font-syne font-700 rounded-xl hover:bg-brand-blue/90 transition-colors"
        >
          <Plus className="w-5 h-5" /> Make a Booking
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-syne font-800 text-2xl text-text-1 mb-1">My Bookings</h1>
          <p className="font-manrope text-text-3">Manage your service appointments</p>
        </div>
        <Link
          href="/book"
          className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white font-syne font-700 rounded-xl hover:bg-brand-blue/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Booking
        </Link>
      </div>

      <div className="space-y-4">
        {bookings.map(booking => {
          const status = STATUS_CONFIG[booking.status]
          const isExpanded = expandedId === booking.id
          const canCancel = booking.status === 'pending' || booking.status === 'confirmed'

          return (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-brand-border overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                className="w-full p-5 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-brand-offwhite rounded-xl flex items-center justify-center text-brand-blue shrink-0">
                  {SERVICE_ICONS[booking.service_type_id] || <Wrench className="w-5 h-5" />}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-syne font-700 text-text-1">
                      {SERVICE_LABELS[booking.service_type_id] || booking.service_type_id}
                    </h3>
                    <span className={cn('flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-manrope font-600', status.bg, status.text)}>
                      {status.icon}
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-manrope text-text-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(booking.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {booking.time_slot}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-syne font-700 text-text-1">{formatNaira(booking.total_kobo)}</p>
                  {booking.deposit_paid_kobo > 0 && (
                    <p className="text-xs font-manrope text-success">
                      Dep: {formatNaira(booking.deposit_paid_kobo)}
                    </p>
                  )}
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-text-4" /> : <ChevronDown className="w-5 h-5 text-text-4" />}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-0 border-t border-brand-border">
                      <div className="py-4 space-y-3">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-brand-blue mt-0.5 shrink-0" />
                          <span className="font-manrope text-text-2">{booking.address}</span>
                        </div>
                        {booking.notes && (
                          <div className="flex items-start gap-2 text-sm">
                            <AlertCircle className="w-4 h-4 text-brand-blue mt-0.5 shrink-0" />
                            <span className="font-manrope text-text-2">{booking.notes}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-3 border-t border-brand-border">
                          <div className="text-sm">
                            <span className="font-manrope text-text-4">Booking Ref: </span>
                            <span className="font-mono text-text-1">{booking.id.slice(0, 8).toUpperCase()}</span>
                          </div>
                          {canCancel && (
                            <button
                              onClick={() => cancelBooking(booking.id)}
                              disabled={cancellingId === booking.id}
                              className="px-4 py-2 border border-brand-red text-brand-red rounded-lg text-sm font-manrope hover:bg-brand-red/10 transition-colors disabled:opacity-50"
                            >
                              {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
