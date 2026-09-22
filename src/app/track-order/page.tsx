'use client'

import React, { useState } from 'react'
import { Package, Search, CheckCircle, Truck, ArrowRight } from 'lucide-react'
import { formatNaira } from '@/lib/utils'

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<{ order_number: string; status: string; total_kobo: number; created_at: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const track = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch(`/api/orders?number=${orderNumber.trim()}`)
      const data = (await res.json()) as { order?: { order_number: string; status: string; total_kobo: number; created_at: string }; error?: string }
      if (data.error || !data.order) { setError('Order not found. Check your order number and try again.'); return }
      setResult(data.order)
    } catch { setError('Failed to track order. Please try again.') }
    finally { setLoading(false) }
  }

  const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered']

  return (
    <div className="min-h-screen bg-brand-offwhite py-12">
      <div className="container mx-auto px-4 max-w-lg">
        <div className="text-center mb-8">
          <Package className="w-12 h-12 text-brand-blue mx-auto mb-3" />
          <h1 className="font-syne font-800 text-2xl text-text-1 mb-1">Track Your Order</h1>
          <p className="font-manrope text-text-3 text-sm">Enter your order reference to see its status.</p>
        </div>

        <div className="bg-white rounded-2xl border border-brand-border p-7 mb-5">
          <form onSubmit={(e) => void track(e)} className="space-y-4">
            <div>
              <label className="block font-manrope font-600 text-text-2 text-sm mb-1.5">Order Reference</label>
              <input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="e.g. RG-2026-AB12CD"
                className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-brand-blue" required />
            </div>
            <div>
              <label className="block font-manrope font-600 text-text-2 text-sm mb-1.5">Email Address (optional)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email used when ordering"
                className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-blue" />
            </div>
            <button type="submit" disabled={loading || !orderNumber}
              className="w-full bg-brand-blue hover:bg-blue-700 disabled:opacity-50 text-white font-syne font-700 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
              {loading ? <>Searching...</> : <><Search className="w-4 h-4" /> Track Order</>}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 font-manrope text-brand-red text-sm">{error}</div>
        )}

        {result && (
          <div className="bg-white rounded-2xl border border-brand-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-mono text-sm font-700 text-brand-blue">{result.order_number}</div>
                <div className="font-manrope text-text-4 text-xs">{new Date(result.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
              <div className="font-syne font-700 text-brand-red">{formatNaira(result.total_kobo)}</div>
            </div>
            <div className="relative mb-6">
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-brand-offwhite" />
              <div className="flex justify-between relative">
                {STATUS_STEPS.map((s, i) => {
                  const currentIndex = STATUS_STEPS.indexOf(result.status)
                  const isPast = i <= currentIndex
                  return (
                    <div key={s} className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${isPast ? 'bg-brand-blue' : 'bg-brand-offwhite border-2 border-brand-border'}`}>
                        {isPast ? <CheckCircle className="w-4 h-4 text-white" /> : <div className="w-2 h-2 bg-brand-border rounded-full" />}
                      </div>
                      <span className={`text-[9px] font-manrope mt-1 capitalize text-center max-w-[60px] ${isPast ? 'text-brand-blue font-600' : 'text-text-4'}`}>
                        {s.replace('_', ' ')}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-manrope text-text-2">
              <Truck className="w-4 h-4 text-brand-blue" />
              <span>Status: <strong className="capitalize">{result.status.replace('_', ' ')}</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
