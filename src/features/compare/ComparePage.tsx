'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BarChart2, X, ArrowRight } from 'lucide-react'
import { cn, formatNaira } from '@/lib/utils'

interface CompareItem {
  id: string; name: string; slug: string; regularPriceKobo: number; salePriceKobo: number | null
  image: string; brand: string; specs: Record<string, string>
}

export default function CompareComponents() {
  const [items, setItems] = useState<CompareItem[]>([])

  useEffect(() => {
    const load = async () => {
      const ids = JSON.parse(localStorage.getItem('rg_compare') ?? '[]') as string[]
      if (ids.length === 0) return
      const res = await fetch(`/api/cart/items?ids=${ids.join(',')}`)
      const data = (await res.json()) as { products: CompareItem[] }
      setItems(data.products ?? [])
    }
    void load()
    const h = () => void load()
    window.addEventListener('rg:compare-updated', h)
    return () => window.removeEventListener('rg:compare-updated', h)
  }, [])

  const removeItem = (id: string) => {
    const comp = JSON.parse(localStorage.getItem('rg_compare') ?? '[]') as string[]
    localStorage.setItem('rg_compare', JSON.stringify(comp.filter((i) => i !== id)))
    setItems((prev) => prev.filter((i) => i.id !== id))
    window.dispatchEvent(new CustomEvent('rg:compare-updated'))
  }

  const clearAll = () => {
    localStorage.setItem('rg_compare', '[]')
    setItems([])
    window.dispatchEvent(new CustomEvent('rg:compare-updated'))
  }

  const allSpecs = Array.from(new Set(items.flatMap((i) => Object.keys(i.specs ?? {}))))

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-brand-offwhite flex items-center justify-center">
        <div className="text-center">
          <BarChart2 className="w-16 h-16 text-text-4 mx-auto mb-4" />
          <h2 className="font-syne font-800 text-2xl text-text-1 mb-2">No products to compare</h2>
          <p className="font-manrope text-text-3 mb-6">Add products from the shop to compare them side-by-side.</p>
          <Link href="/shop" className="inline-flex items-center gap-2 bg-brand-blue text-white font-syne font-700 px-6 py-3 rounded-xl hover:bg-blue-700">
            Browse Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-offwhite py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-syne font-800 text-2xl text-text-1 flex items-center gap-3">
            <BarChart2 className="w-6 h-6 text-brand-blue" /> Compare ({items.length} items)
          </h1>
          <button onClick={clearAll} className="text-sm font-manrope text-brand-red hover:underline">Clear All</button>
        </div>

        <div className="bg-white rounded-xl border border-brand-border overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr>
                <th className="p-4 text-left font-manrope text-xs text-text-4 w-40">Product</th>
                {items.map((item) => (
                  <th key={item.id} className="p-4 text-center min-w-[200px]">
                    <div className="relative">
                      <button onClick={() => removeItem(item.id)} className="absolute -top-1 -right-1 p-1 bg-brand-offwhite rounded-full hover:bg-red-50">
                        <X className="w-3.5 h-3.5 text-text-4 hover:text-brand-red" />
                      </button>
                      <Link href={`/products/${item.slug}`}>
                        <img src={item.image || '/images/placeholder-product.webp'} alt={item.name} className="w-24 h-24 object-contain mx-auto mb-2" />
                        <div className="font-syne font-700 text-sm text-text-1 line-clamp-2">{item.name}</div>
                        <div className="font-manrope text-xs text-text-4 mt-1">{item.brand}</div>
                        <div className="font-syne font-700 text-brand-red mt-1">{formatNaira(item.salePriceKobo ?? item.regularPriceKobo)}</div>
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            {allSpecs.length > 0 && (
              <tbody className="divide-y divide-brand-border">
                {allSpecs.map((spec) => (
                  <tr key={spec}>
                    <td className="p-3 text-sm font-manrope font-600 text-text-3">{spec}</td>
                    {items.map((item) => (
                      <td key={item.id} className="p-3 text-sm font-manrope text-text-1 text-center">{item.specs?.[spec] ?? '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
