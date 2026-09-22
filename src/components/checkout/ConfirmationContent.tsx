'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react'

interface OrderInfo {
  orderNumber: string
  customerName: string
  email: string
}

export default function ConfirmationContent() {
  const [order, setOrder] = useState<OrderInfo | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) {
      void (async () => {
        try {
          const res = await fetch(`/api/orders?number=${encodeURIComponent(ref)}`)
          if (res.ok) {
            const data = (await res.json()) as { order?: { order_number: string; shipping_address: { name?: string; email?: string } } }
            if (data.order) {
              const addr = data.order.shipping_address as { name?: string; email?: string }
              setOrder({
                orderNumber: data.order.order_number,
                customerName: addr?.name ?? 'Valued Customer',
                email: addr?.email ?? '',
              })
            }
          }
        } catch {}
      })()
    }
  }, [])

  return (
    <div className="min-h-screen bg-brand-offwhite flex items-center justify-center py-16 px-4">
      <div className="bg-white rounded-2xl border border-brand-border p-8 md:p-12 text-center max-w-lg w-full">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-success" />
        </div>
        <h1 className="font-syne font-800 text-3xl text-text-1 mb-3">Order Confirmed!</h1>
        <p className="font-manrope text-text-3 mb-6">
          Thank you{order?.customerName ? `, ${order.customerName.split(' ')[0]}` : ''}! Your order has been received and is being processed.
        </p>
        {order?.orderNumber && (
          <div className="bg-brand-offwhite rounded-xl px-6 py-4 mb-6">
            <div className="text-xs font-manrope text-text-4 uppercase tracking-wider mb-1">Order Reference</div>
            <div className="font-mono font-700 text-brand-blue text-lg">{order.orderNumber}</div>
          </div>
        )}
        <p className="text-text-3 font-manrope text-sm mb-8">
          A confirmation email has been sent to <strong>{order?.email ?? 'your email address'}</strong>.
          You can track your order anytime from your account.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/account/orders"
            className="flex-1 flex items-center justify-center gap-2 bg-brand-blue text-white font-syne font-700 px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
            <ShoppingBag className="w-4 h-4" /> Track Order
          </Link>
          <Link href="/shop"
            className="flex-1 flex items-center justify-center gap-2 border border-brand-border text-text-3 font-manrope font-600 px-6 py-3 rounded-xl hover:bg-brand-offwhite transition-colors">
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
