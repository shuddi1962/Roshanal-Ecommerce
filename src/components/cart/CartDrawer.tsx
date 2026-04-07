'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight, Sparkles } from 'lucide-react'
import { cn, formatNaira } from '@/lib/utils'
import type { EnrichedCartItem } from '@/store/cart'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const [items, setItems] = useState<EnrichedCartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open) return
    const raw = JSON.parse(localStorage.getItem('rg_cart') ?? '[]') as { id: string; qty: number }[]
    if (raw.length === 0) { setItems([]); setLoading(false); return }

    void (async () => {
      try {
        const ids = raw.map((i) => i.id).join(',')
        const res = await fetch(`/api/cart/items?ids=${ids}`)
        const data = (await res.json()) as { products: EnrichedCartItem[] }
        setItems(raw.map((item) => {
          const product = data.products?.find((p) => p.id === item.id)
          return product ? { ...product, qty: item.qty } : { ...item, name: '', slug: '', image: '', regularPriceKobo: 0, salePriceKobo: null, sku: '', brand: '', inStock: true, maxQty: 99 } as EnrichedCartItem
        }))
      } catch {
        setItems(raw.map((i) => ({ ...i, name: '', slug: '', image: '', regularPriceKobo: 0, salePriceKobo: null, sku: '', brand: '', inStock: true, maxQty: 99 } as EnrichedCartItem)))
      } finally {
        setLoading(false)
      }
    })()
  }, [open])

  const updateQty = (id: string, qty: number) => {
    const cart = JSON.parse(localStorage.getItem('rg_cart') ?? '[]') as { id: string; qty: number }[]
    const updated = qty < 1 ? cart.filter((i) => i.id !== id) : cart.map((i) => i.id === id ? { ...i, qty } : i)
    localStorage.setItem('rg_cart', JSON.stringify(updated))
    setItems((prev) => qty < 1 ? prev.filter((i) => i.id !== id) : prev.map((i) => i.id === id ? { ...i, qty } : i))
    window.dispatchEvent(new CustomEvent('rg:cart-updated'))
  }

  const removeItem = (id: string) => {
    const cart = JSON.parse(localStorage.getItem('rg_cart') ?? '[]') as { id: string; qty: number }[]
    localStorage.setItem('rg_cart', JSON.stringify(cart.filter((i) => i.id !== id)))
    setItems((prev) => prev.filter((i) => i.id !== id))
    window.dispatchEvent(new CustomEvent('rg:cart-updated'))
  }

  const subtotal = items.reduce((sum, item) => {
    const price = item.salePriceKobo ?? item.regularPriceKobo ?? 0
    return sum + price * item.qty
  }, 0)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="backdrop"
          />

          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-float z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-brand-blue" />
                <span className="font-syne font-700 text-text-1">Your Cart ({items.length})</span>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-brand-offwhite transition-colors">
                <X className="w-5 h-5 text-text-3" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="skeleton w-16 h-16 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-3/4 rounded" />
                      <div className="skeleton h-3 w-1/2 rounded" />
                    </div>
                  </div>
                ))
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <ShoppingCart className="w-12 h-12 text-text-4 mb-3" />
                  <h3 className="font-syne font-700 text-text-1 mb-1">Your cart is empty</h3>
                  <p className="text-text-3 text-sm font-manrope mb-4">Browse our shop to add products.</p>
                  <Link href="/shop" onClick={onClose}
                    className="flex items-center gap-2 bg-brand-blue text-white font-syne font-700 text-sm px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
                    Browse Products <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                items.map((item) => {
                  const price = item.salePriceKobo ?? item.regularPriceKobo ?? 0
                  return (
                    <div key={item.id} className="flex gap-3 bg-brand-offwhite rounded-xl p-3">
                      <div className="w-16 h-16 bg-white rounded-lg overflow-hidden shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.slug}`} onClick={onClose}
                          className="font-syne font-700 text-sm text-text-1 line-clamp-1 hover:text-brand-blue transition-colors">
                          {item.name || `Product #${item.id}`}
                        </Link>
                        {item.brand && <div className="text-text-4 text-xs font-manrope">{item.brand}</div>}
                        <div className="flex items-center justify-between mt-1.5">
                          <div className="flex items-center gap-1">
                            <button onClick={() => updateQty(item.id, item.qty - 1)}
                              className="w-6 h-6 rounded border border-brand-border bg-white flex items-center justify-center hover:bg-brand-offwhite transition-colors">
                              <Minus className="w-3 h-3 text-text-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-syne font-700 text-text-1">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, item.qty + 1)}
                              className="w-6 h-6 rounded border border-brand-border bg-white flex items-center justify-center hover:bg-brand-offwhite transition-colors">
                              <Plus className="w-3 h-3 text-text-3" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-syne font-700 text-sm text-brand-red">{formatNaira(price * item.qty)}</span>
                            <button onClick={() => removeItem(item.id)} className="text-text-4 hover:text-brand-red transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-brand-border px-5 py-4 space-y-3 shrink-0">
                <div className="flex justify-between">
                  <span className="font-manrope text-text-3 text-sm">Subtotal</span>
                  <span className="font-syne font-700 text-text-1">{formatNaira(subtotal)}</span>
                </div>
                <p className="text-text-4 text-xs font-manrope">Shipping calculated at checkout.</p>
                <Link href="/checkout/delivery" onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-700 text-white font-syne font-700 py-3 rounded-xl transition-colors">
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/cart" onClick={onClose}
                  className="w-full text-center text-sm font-manrope text-text-3 hover:text-brand-blue transition-colors">
                  View Cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
