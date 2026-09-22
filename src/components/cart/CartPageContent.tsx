'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package, Tag, X } from 'lucide-react'
import { formatNaira } from '@/lib/utils'

interface CartItem {
  id: string
  qty: number
  name?: string
  slug?: string
  image?: string
  regularPriceKobo?: number
  salePriceKobo?: number | null
  sku?: string
  brand?: string
}

export default function CartPageContent() {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState<{ code: string; discountKobo: number } | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)

  useEffect(() => {
    const loadCart = async () => {
      const raw = JSON.parse(localStorage.getItem('rg_cart') ?? '[]') as { id: string; qty: number }[]
      if (raw.length === 0) { setLoading(false); return }

      try {
        const ids = raw.map((i) => i.id).join(',')
        const res = await fetch(`/api/cart/items?ids=${ids}`)
        const data = (await res.json()) as { products: CartItem[] }
        const enriched = raw.map((item) => {
          const product = data.products?.find((p) => p.id === item.id)
          return product ? { ...product, qty: item.qty } : { ...item }
        })
        setItems(enriched)
      } catch {
        setItems(raw.map((i) => ({ ...i })))
      } finally {
        setLoading(false)
      }
    }

    void loadCart()
    const handler = () => void loadCart()
    window.addEventListener('rg:cart-updated', handler)
    return () => window.removeEventListener('rg:cart-updated', handler)
  }, [])

  const updateQty = (id: string, qty: number) => {
    const cart = JSON.parse(localStorage.getItem('rg_cart') ?? '[]') as { id: string; qty: number }[]
    const updated = cart.map((i) => i.id === id ? { ...i, qty: Math.max(1, qty) } : i)
    localStorage.setItem('rg_cart', JSON.stringify(updated))
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, qty: Math.max(1, qty) } : i))
  }

  const removeItem = (id: string) => {
    const cart = JSON.parse(localStorage.getItem('rg_cart') ?? '[]') as { id: string; qty: number }[]
    const updated = cart.filter((i) => i.id !== id)
    localStorage.setItem('rg_cart', JSON.stringify(updated))
    setItems((prev) => prev.filter((i) => i.id !== id))
    window.dispatchEvent(new CustomEvent('rg:cart-updated'))
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponError(null)
    try {
      const res = await fetch('/api/checkout/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim().toUpperCase(), subtotal: subtotalKobo }),
      })
      const data = (await res.json()) as { discount?: number; error?: string }
      if (data.error) {
        setCouponError(data.error)
        return
      }
      setCouponApplied({ code: couponCode.trim().toUpperCase(), discountKobo: data.discount ?? 0 })
    } catch {
      setCouponError('Failed to apply coupon. Please try again.')
    }
  }

  const subtotalKobo = items.reduce((sum, item) => {
    const price = item.salePriceKobo ?? item.regularPriceKobo ?? 0
    return sum + price * item.qty
  }, 0)

  const discountKobo = couponApplied?.discountKobo ?? 0
  const totalKobo = subtotalKobo - discountKobo

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-offwhite py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-brand-border p-5 mb-4">
              <div className="flex gap-4">
                <div className="skeleton w-20 h-20 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                  <div className="skeleton h-6 w-20 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-brand-offwhite flex items-center justify-center py-16">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-text-4 mx-auto mb-4" />
          <h1 className="font-syne font-800 text-2xl text-text-1 mb-2">Your cart is empty</h1>
          <p className="font-manrope text-text-3 mb-6">Add products from our shop to get started.</p>
          <Link href="/shop" className="inline-flex items-center gap-2 bg-brand-blue text-white font-syne font-700 px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
            Browse Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-offwhite py-8">
      <div className="container mx-auto px-4">
        <h1 className="font-syne font-800 text-2xl text-text-1 mb-6 flex items-center gap-3">
          <ShoppingCart className="w-6 h-6" /> Your Cart ({items.length} item{items.length !== 1 ? 's' : ''})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence>
              {items.map((item) => {
                const price = item.salePriceKobo ?? item.regularPriceKobo ?? 0
                const lineTotal = price * item.qty
                return (
                  <motion.div key={item.id} layout exit={{ opacity: 0, height: 0 }}
                    className="bg-white rounded-xl border border-brand-border p-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-brand-offwhite rounded-lg overflow-hidden shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name ?? ''} className="w-full h-full object-contain p-1" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-syne font-700 text-text-1 text-sm mb-0.5 truncate">{item.name ?? `Product #${item.id}`}</div>
                        {item.brand && <div className="font-manrope text-text-4 text-xs mb-1">{item.brand}</div>}
                        {item.sku && <div className="font-mono text-text-4 text-[10px] mb-2">SKU: {item.sku}</div>}
                        <div className="flex items-center justify-between gap-4">
                          {/* Qty controls */}
                          <div className="flex items-center border border-brand-border rounded-lg overflow-hidden">
                            <button onClick={() => updateQty(item.id, item.qty - 1)} className="px-2.5 py-1.5 hover:bg-brand-offwhite transition-colors">
                              <Minus className="w-3.5 h-3.5 text-text-3" />
                            </button>
                            <span className="px-3 text-sm font-syne font-700 text-text-1 min-w-[32px] text-center">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, item.qty + 1)} className="px-2.5 py-1.5 hover:bg-brand-offwhite transition-colors">
                              <Plus className="w-3.5 h-3.5 text-text-3" />
                            </button>
                          </div>
                          <div className="text-right">
                            <div className="font-syne font-700 text-brand-red text-base">{formatNaira(lineTotal)}</div>
                            {item.qty > 1 && <div className="text-text-4 text-xs">{formatNaira(price)} each</div>}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-text-4 hover:text-brand-red transition-colors self-start">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            {/* Coupon */}
            <div className="bg-white rounded-xl border border-brand-border p-4">
              <h3 className="font-syne font-700 text-text-1 text-sm mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-brand-blue" /> Coupon Code
              </h3>
              {couponApplied ? (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <span className="font-mono text-sm text-green-700 font-700 flex-1">{couponApplied.code}</span>
                  <span className="text-green-600 text-sm font-manrope">-{formatNaira(couponApplied.discountKobo)}</span>
                  <button onClick={() => setCouponApplied(null)}><X className="w-4 h-4 text-green-600" /></button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code" className="flex-1 border border-brand-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-blue" />
                  <button onClick={() => void applyCoupon()} className="px-4 py-2 bg-brand-blue text-white font-syne font-700 text-sm rounded-lg hover:bg-blue-700 transition-colors">
                    Apply
                  </button>
                </div>
              )}
              {couponError && <p className="mt-1.5 text-xs text-brand-red font-manrope">{couponError}</p>}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl border border-brand-border p-5">
              <h3 className="font-syne font-700 text-text-1 mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm font-manrope">
                  <span className="text-text-3">Subtotal</span>
                  <span className="font-600 text-text-1">{formatNaira(subtotalKobo)}</span>
                </div>
                {discountKobo > 0 && (
                  <div className="flex justify-between text-sm font-manrope">
                    <span className="text-green-600">Discount ({couponApplied?.code})</span>
                    <span className="font-600 text-green-600">-{formatNaira(discountKobo)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-manrope">
                  <span className="text-text-3">Shipping</span>
                  <span className="text-text-3">Calculated at checkout</span>
                </div>
                <div className="border-t border-brand-border pt-3 flex justify-between">
                  <span className="font-syne font-700 text-text-1">Total</span>
                  <span className="font-syne font-800 text-brand-red text-xl">{formatNaira(totalKobo)}</span>
                </div>
              </div>
              <Link href="/checkout/delivery"
                className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-700 text-white font-syne font-700 py-3.5 rounded-xl transition-colors">
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/shop" className="mt-2 w-full flex items-center justify-center text-sm font-manrope text-text-3 hover:text-brand-blue transition-colors py-2">
                Continue Shopping
              </Link>
            </div>

            {/* Accepted payments */}
            <div className="bg-white rounded-xl border border-brand-border p-4">
              <p className="text-xs font-manrope text-text-4 text-center mb-3">We accept</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Visa', 'Mastercard', 'Bank Transfer', 'USSD', 'Wallet', 'Pay on Delivery'].map((p) => (
                  <span key={p} className="text-[10px] font-manrope bg-brand-offwhite border border-brand-border rounded px-2 py-0.5 text-text-3">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
