'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Trash2, ArrowRight, Share2 } from 'lucide-react'
import { cn, formatNaira } from '@/lib/utils'

interface WishlistItem {
  id: string; name: string; slug: string; regularPriceKobo: number; salePriceKobo: number | null; image: string; brand: string
}

export default function WishlistComponents() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const ids = JSON.parse(localStorage.getItem('rg_wishlist') ?? '[]') as string[]
    if (ids.length === 0) { setLoading(false); return }

    try {
      const res = await fetch(`/api/cart/items?ids=${ids.join(',')}`)
      const data = (await res.json()) as { products: WishlistItem[] }
      setItems(data.products ?? [])
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => {
    void load()
    const h = () => void load()
    window.addEventListener('rg:wishlist-updated', h)
    return () => window.removeEventListener('rg:wishlist-updated', h)
  }, [])

  const remove = (id: string) => {
    const wish = JSON.parse(localStorage.getItem('rg_wishlist') ?? '[]') as string[]
    const updated = wish.filter((w) => w !== id)
    localStorage.setItem('rg_wishlist', JSON.stringify(updated))
    setItems((prev) => prev.filter((i) => i.id !== id))
    window.dispatchEvent(new CustomEvent('rg:wishlist-updated'))
  }

  const addToCart = (id: string) => {
    const cart = JSON.parse(localStorage.getItem('rg_cart') ?? '[]') as { id: string; qty: number }[]
    const ex = cart.find((i) => i.id === id)
    if (ex) ex.qty++; else cart.push({ id, qty: 1 })
    localStorage.setItem('rg_cart', JSON.stringify(cart))
    window.dispatchEvent(new CustomEvent('rg:cart-updated'))
  }

  return items.length === 0 && !loading ? (
    <div className="min-h-screen bg-brand-offwhite flex items-center justify-center">
      <div className="text-center">
        <Heart className="w-16 h-16 text-text-4 mx-auto mb-4" />
        <h2 className="font-syne font-800 text-2xl text-text-1 mb-2">Your wishlist is empty</h2>
        <p className="font-manrope text-text-3 mb-6">Save items you love to come back later.</p>
        <Link href="/shop" className="inline-flex items-center gap-2 bg-brand-blue text-white font-syne font-700 px-6 py-3 rounded-xl hover:bg-blue-700">
          Browse Products <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  ) : (
    <div className="min-h-screen bg-brand-offwhite py-8">
      <div className="container mx-auto px-4">
        <h1 className="font-syne font-800 text-2xl text-text-1 mb-6 flex items-center gap-3">
          <Heart className="w-6 h-6 text-brand-red" /> My Wishlist ({items.length})
        </h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((item) => (
            <motion.div key={item.id} layout className="bg-white rounded-xl border border-brand-border overflow-hidden">
              <Link href={`/products/${item.slug}`} className="block">
                <div className="aspect-square bg-brand-offwhite">
                  <img src={item.image || '/images/placeholder-product.webp'} alt={item.name} className="w-full h-full object-contain p-3" />
                </div>
              </Link>
              <div className="p-3">
                <div className="font-syne font-700 text-[10px] uppercase text-text-4 mb-1">{item.brand}</div>
                <Link href={`/products/${item.slug}`} className="font-syne font-600 text-sm text-text-1 line-clamp-2 leading-snug mb-2">{item.name}</Link>
                <div className="font-syne font-700 text-brand-red text-sm mb-3">{formatNaira(item.salePriceKobo ?? item.regularPriceKobo)}</div>
                <div className="flex gap-2">
                  <button onClick={() => addToCart(item.id)}
                    className="flex-1 bg-brand-blue text-white text-xs font-syne font-700 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Add to Cart
                  </button>
                  <button onClick={() => remove(item.id)} className="px-3 py-2 border border-brand-border rounded-lg hover:border-brand-red hover:text-brand-red transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
