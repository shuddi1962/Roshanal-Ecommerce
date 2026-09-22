'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ShoppingCart, Heart, BarChart2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSalePercentage, isOnSale } from '@/lib/utils'

interface ProductTab {
  id: string
  label: string
  source: string
  sourceValue: string
  count: number
  sortOrder: string
  isDefault: boolean
  enabled: boolean
}

interface ProductCard {
  id: string
  name: string
  slug: string
  brand: string
  regularPriceKobo: number
  salePriceKobo: number | null
  image: string
  badges: string[]
  saleBadgeLabel?: string
  saleBadgeColor?: string
  countdownEnabled?: boolean
  countdownEnd?: string
  inStock: boolean
}

const DEFAULT_TABS: ProductTab[] = [
  { id: '1', label: 'Trending', source: 'tag', sourceValue: 'trending', count: 8, sortOrder: 'featured', isDefault: true, enabled: true },
  { id: '2', label: 'Best Sellers', source: 'tag', sourceValue: 'bestseller', count: 8, sortOrder: 'bestselling', isDefault: false, enabled: true },
  { id: '3', label: 'Featured', source: 'tag', sourceValue: 'featured', count: 8, sortOrder: 'featured', isDefault: false, enabled: true },
  { id: '4', label: 'New Arrivals', source: 'tag', sourceValue: 'new-arrival', count: 8, sortOrder: 'newest', isDefault: false, enabled: true },
  { id: '5', label: 'Top Rated', source: 'tag', sourceValue: 'top-rated', count: 8, sortOrder: 'rating', isDefault: false, enabled: true },
  { id: '6', label: 'On Sale', source: 'tag', sourceValue: 'sale', count: 8, sortOrder: 'sale', isDefault: false, enabled: true },
]

function ProductCardComponent({ product }: { product: ProductCard }) {
  const onSale = isOnSale(product.regularPriceKobo, product.salePriceKobo)
  const salePercent = onSale ? getSalePercentage(product.regularPriceKobo, product.salePriceKobo!) : 0
  const displayPrice = onSale ? product.salePriceKobo! : product.regularPriceKobo

  const formatPrice = (kobo: number) => `₦${(kobo / 100).toLocaleString('en-NG')}`

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    const cart = JSON.parse(localStorage.getItem('rg_cart') ?? '[]') as { id: string; qty: number }[]
    const existing = cart.find((i) => i.id === product.id)
    if (existing) {
      existing.qty += 1
    } else {
      cart.push({ id: product.id, qty: 1 })
    }
    localStorage.setItem('rg_cart', JSON.stringify(cart))
    window.dispatchEvent(new CustomEvent('rg:cart-updated'))
  }

  const addToWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    const wish = JSON.parse(localStorage.getItem('rg_wishlist') ?? '[]') as string[]
    if (!wish.includes(product.id)) {
      wish.push(product.id)
      localStorage.setItem('rg_wishlist', JSON.stringify(wish))
      window.dispatchEvent(new CustomEvent('rg:wishlist-updated'))
    }
  }

  return (
    <Link href={`/products/${product.slug}`} className="product-card group block">
      {/* Image */}
      <div className="relative aspect-square bg-brand-offwhite overflow-hidden">
        <img
          src={product.image || '/images/placeholder-product.webp'}
          alt={product.name}
          className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Sale badge — auto-detect if on sale */}
        {onSale && (
          <span
            className="sale-badge absolute top-2 left-2 text-white"
            style={{ backgroundColor: product.saleBadgeColor ?? '#C8191C' }}
          >
            {product.saleBadgeLabel ?? 'SALE'} {salePercent > 0 && `-${salePercent}%`}
          </span>
        )}

        {/* Other badges */}
        {product.badges.filter((b) => b !== 'SALE').slice(0, 1).map((badge) => (
          <span
            key={badge}
            className={cn(
              'sale-badge absolute text-white',
              onSale ? 'top-8 left-2' : 'top-2 left-2',
              badge === 'NEW' && 'bg-success',
              badge === 'HOT' && 'bg-orange-500',
              badge === 'FEATURED' && 'bg-brand-blue',
              badge === 'TRENDING' && 'bg-purple-600',
            )}
          >
            {badge}
          </span>
        ))}

        {/* Action overlay */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={addToWishlist}
            className="w-8 h-8 bg-white rounded-full shadow-card flex items-center justify-center hover:bg-brand-red hover:text-white transition-colors"
            title="Add to wishlist"
          >
            <Heart className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              const comp = JSON.parse(localStorage.getItem('rg_compare') ?? '[]') as string[]
              if (!comp.includes(product.id) && comp.length < 4) {
                comp.push(product.id)
                localStorage.setItem('rg_compare', JSON.stringify(comp))
                window.dispatchEvent(new CustomEvent('rg:compare-updated'))
              }
            }}
            className="w-8 h-8 bg-white rounded-full shadow-card flex items-center justify-center hover:bg-brand-blue hover:text-white transition-colors"
            title="Compare"
          >
            <BarChart2 className="w-4 h-4" />
          </button>
        </div>

        {!product.inStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="sale-badge bg-gray-500 text-white">OUT OF STOCK</span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-3">
        <div className="font-syne font-700 uppercase tracking-widest text-[10px] text-text-4 mb-1">{product.brand}</div>
        <div className="font-syne font-600 text-sm text-text-1 line-clamp-2 leading-snug mb-2">{product.name}</div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="font-syne font-700 text-brand-red text-lg price">{formatPrice(displayPrice)}</span>
          {onSale && (
            <span className="font-manrope text-xs text-text-4 line-through">{formatPrice(product.regularPriceKobo)}</span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={addToCart}
          disabled={!product.inStock}
          className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-700 disabled:bg-brand-border text-white font-syne font-700 text-xs py-2.5 rounded-lg transition-colors active:scale-95"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </Link>
  )
}

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-brand-border">
      <div className="skeleton aspect-square" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-6 w-20 rounded" />
        <div className="skeleton h-9 w-full rounded-lg" />
      </div>
    </div>
  )
}

export default function ProductTabSection() {
  const [tabs, setTabs] = useState<ProductTab[]>(DEFAULT_TABS)
  const [activeTab, setActiveTab] = useState<string>(DEFAULT_TABS.find((t) => t.isDefault)?.id ?? DEFAULT_TABS[0].id)
  const [products, setProducts] = useState<ProductCard[]>([])
  const [loading, setLoading] = useState(true)

  const loadProducts = useCallback(async (tabId: string) => {
    setLoading(true)
    const tab = tabs.find((t) => t.id === tabId)
    if (!tab) return

    try {
      const res = await fetch(`/api/products?source=${tab.source}&sourceValue=${tab.sourceValue}&count=${tab.count}&sort=${tab.sortOrder}`)
      const data = (await res.json()) as { products: ProductCard[] }
      setProducts(data.products ?? [])
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [tabs])

  useEffect(() => {
    void loadProducts(activeTab)
  }, [activeTab, loadProducts])

  useEffect(() => {
    // Fetch tab configuration from homepage config
    fetch('/api/homepage/product-tabs')
      .then((r) => r.json())
      .then((d: { tabs?: ProductTab[] }) => {
        if (d.tabs?.length) {
          setTabs(d.tabs.filter((t) => t.enabled))
          const defaultTab = d.tabs.find((t) => t.isDefault && t.enabled)
          if (defaultTab) setActiveTab(defaultTab.id)
        }
      })
      .catch(() => {})
  }, [])

  const activeTabs = tabs.filter((t) => t.enabled)

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-syne font-800 text-text-1 text-2xl md:text-3xl">Featured Products</h2>
        <Link href="/shop" className="hidden sm:flex items-center gap-1.5 text-brand-blue font-manrope font-600 text-sm hover:underline">
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1 scrollbar-none">
        {activeTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'shrink-0 px-4 py-2 text-sm font-manrope font-600 rounded-full transition-all',
              activeTab === tab.id
                ? 'bg-brand-blue text-white shadow-sm'
                : 'bg-white text-text-3 border border-brand-border hover:border-brand-blue hover:text-brand-blue'
            )}
          >
            {tab.label}
          </button>
        ))}

        {/* Add tab (visual indicator — admin only edits via homepage builder) */}
        <Link
          href="/admin/homepage-builder"
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full border-2 border-dashed border-brand-border text-text-4 hover:border-brand-blue hover:text-brand-blue transition-colors"
          title="Manage tabs (Admin)"
        >
          <Plus className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Product grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
            : products.length > 0
            ? products.map((p) => <ProductCardComponent key={p.id} product={p} />)
            : (
              <div className="col-span-full py-16 text-center">
                <p className="text-text-4 font-manrope">No products found in this tab.</p>
                <Link href="/admin/homepage-builder" className="mt-2 inline-block text-sm text-brand-blue hover:underline">
                  Configure in Homepage Builder →
                </Link>
              </div>
            )
          }
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
