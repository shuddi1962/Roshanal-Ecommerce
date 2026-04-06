'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SlidersHorizontal, X, ChevronDown, ChevronUp, Search, Grid3X3, List,
  ArrowRight, Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { isOnSale, getSalePercentage } from '@/lib/utils'

interface Product {
  id: string; name: string; slug: string; brand: string
  regularPriceKobo: number; salePriceKobo: number | null
  image: string; badges: string[]; inStock: boolean
  saleBadgeLabel?: string; saleBadgeColor?: string
}

interface FilterState {
  categories: string[]; brands: string[]; priceMin: number; priceMax: number
  inStockOnly: boolean; onSaleOnly: boolean; sort: string; search: string
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'bestselling', label: 'Best Selling' },
  { value: 'rating', label: 'Top Rated' },
]

const CATEGORIES_LIST = [
  { slug: 'security', name: 'Security Systems' },
  { slug: 'marine', name: 'Marine & Naval' },
  { slug: 'solar', name: 'Solar & Energy' },
  { slug: 'networking', name: 'Networking & ICT' },
  { slug: 'safety', name: 'Safety Equipment' },
  { slug: 'dredging', name: 'Dredging Equipment' },
  { slug: 'boat-engines', name: 'Boat Engines' },
  { slug: 'kitchen', name: 'Kitchen & Cooking' },
]

const BRANDS_LIST = [
  'Yamaha', 'Honda', 'Mercury', 'Suzuki', 'Hikvision', 'Dahua', 'Cisco', 'Sukam',
]

function ProductCard({ product }: { product: Product }) {
  const onSale = isOnSale(product.regularPriceKobo, product.salePriceKobo)
  const pct = onSale ? getSalePercentage(product.regularPriceKobo, product.salePriceKobo!) : 0
  const price = onSale ? product.salePriceKobo! : product.regularPriceKobo
  const fmt = (k: number) => `₦${(k / 100).toLocaleString('en-NG')}`

  return (
    <Link href={`/products/${product.slug}`} className="product-card group block">
      <div className="relative aspect-square bg-brand-offwhite overflow-hidden">
        <img src={product.image || '/images/placeholder-product.webp'} alt={product.name}
          className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        {onSale && (
          <span className="sale-badge absolute top-2 left-2 text-white" style={{ backgroundColor: product.saleBadgeColor ?? '#C8191C' }}>
            {product.saleBadgeLabel ?? 'SALE'} {pct > 0 && `-${pct}%`}
          </span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="sale-badge bg-gray-500 text-white">OUT OF STOCK</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="font-syne font-700 uppercase tracking-widest text-[10px] text-text-4 mb-1">{product.brand}</div>
        <div className="font-syne font-600 text-sm text-text-1 line-clamp-2 leading-snug mb-2">{product.name}</div>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="font-syne font-700 text-brand-red text-lg">{fmt(price)}</span>
          {onSale && <span className="text-xs text-text-4 line-through">{fmt(product.regularPriceKobo)}</span>}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault()
            const cart = JSON.parse(localStorage.getItem('rg_cart') ?? '[]') as { id: string; qty: number }[]
            const ex = cart.find((i) => i.id === product.id)
            if (ex) ex.qty++ ; else cart.push({ id: product.id, qty: 1 })
            localStorage.setItem('rg_cart', JSON.stringify(cart))
            window.dispatchEvent(new CustomEvent('rg:cart-updated'))
          }}
          disabled={!product.inStock}
          className="w-full text-center bg-brand-blue hover:bg-blue-700 disabled:bg-brand-border text-white font-syne font-700 text-xs py-2.5 rounded-lg transition-colors"
        >
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </Link>
  )
}

export default function ShopPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [filters, setFilters] = useState<FilterState>({
    categories: searchParams.get('category') ? [searchParams.get('category')!] : [],
    brands: [],
    priceMin: 0,
    priceMax: 50000000,
    inStockOnly: false,
    onSaleOnly: false,
    sort: searchParams.get('sort') ?? 'newest',
    search: searchParams.get('search') ?? '',
  })

  const loadProducts = useCallback(async (f: FilterState, p: number) => {
    setLoading(true)
    const params = new URLSearchParams({
      sort: f.sort,
      page: String(p),
      count: '24',
      ...(f.search && { search: f.search }),
      ...(f.categories.length === 1 && { category: f.categories[0] }),
      ...(f.onSaleOnly && { onSale: '1' }),
      ...(f.inStockOnly && { inStock: '1' }),
    })

    try {
      const res = await fetch(`/api/products?${params.toString()}`)
      const data = (await res.json()) as { products: Product[]; total?: number }
      setProducts(p === 1 ? data.products : (prev) => [...prev, ...data.products])
      setTotal(data.total ?? data.products.length)
    } catch { setProducts([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    setPage(1)
    void loadProducts(filters, 1)
  }, [filters, loadProducts])

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
    const [expanded, setExpanded] = useState(true)
    return (
      <div className="border-b border-brand-border py-4">
        <button onClick={() => setExpanded(!expanded)} className="flex items-center justify-between w-full mb-2">
          <span className="font-syne font-700 text-text-1 text-sm">{title}</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-text-4" /> : <ChevronDown className="w-4 h-4 text-text-4" />}
        </button>
        {expanded && children}
      </div>
    )
  }

  const toggleCategory = (slug: string) => {
    setFilters((f) => ({
      ...f,
      categories: f.categories.includes(slug) ? f.categories.filter((c) => c !== slug) : [...f.categories, slug],
    }))
  }

  const toggleBrand = (brand: string) => {
    setFilters((f) => ({
      ...f,
      brands: f.brands.includes(brand) ? f.brands.filter((b) => b !== brand) : [...f.brands, brand],
    }))
  }

  const activeFilterCount = filters.categories.length + filters.brands.length +
    (filters.inStockOnly ? 1 : 0) + (filters.onSaleOnly ? 1 : 0)

  return (
    <div className="min-h-screen bg-brand-offwhite">
      {/* Breadcrumb + heading */}
      <div className="bg-white border-b border-brand-border py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-xs font-manrope text-text-4 mb-2">
            <Link href="/" className="hover:text-brand-blue">Home</Link>
            <span>/</span>
            <span className="text-text-2">Shop</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="font-syne font-800 text-2xl text-text-1">
              {filters.search ? `Results for "${filters.search}"` : 'All Products'}
            </h1>
            <span className="text-text-3 font-manrope text-sm">{total} products</span>
          </div>
          {/* Search bar */}
          <div className="mt-3 relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
            <input
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-blue bg-white"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filter Sidebar — desktop */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="bg-white rounded-xl border border-brand-border p-4 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-syne font-700 text-text-1">Filters</h2>
                {activeFilterCount > 0 && (
                  <button onClick={() => setFilters((f) => ({ ...f, categories: [], brands: [], inStockOnly: false, onSaleOnly: false }))}
                    className="text-xs text-brand-red hover:underline">Clear all</button>
                )}
              </div>

              <FilterSection title="Categories">
                {CATEGORIES_LIST.map((cat) => (
                  <label key={cat.slug} className="flex items-center gap-2 py-1 cursor-pointer group">
                    <div onClick={() => toggleCategory(cat.slug)}
                      className={cn('w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
                        filters.categories.includes(cat.slug) ? 'border-brand-blue bg-brand-blue' : 'border-brand-border group-hover:border-brand-blue')}>
                      {filters.categories.includes(cat.slug) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm font-manrope text-text-2 group-hover:text-brand-blue">{cat.name}</span>
                  </label>
                ))}
              </FilterSection>

              <FilterSection title="Brands">
                {BRANDS_LIST.map((brand) => (
                  <label key={brand} className="flex items-center gap-2 py-1 cursor-pointer group">
                    <div onClick={() => toggleBrand(brand)}
                      className={cn('w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
                        filters.brands.includes(brand) ? 'border-brand-blue bg-brand-blue' : 'border-brand-border group-hover:border-brand-blue')}>
                      {filters.brands.includes(brand) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm font-manrope text-text-2 group-hover:text-brand-blue">{brand}</span>
                  </label>
                ))}
              </FilterSection>

              <FilterSection title="Availability">
                {[
                  { key: 'inStockOnly', label: 'In Stock Only' },
                  { key: 'onSaleOnly', label: 'On Sale Only' },
                ].map((opt) => (
                  <label key={opt.key} className="flex items-center gap-2 py-1 cursor-pointer group">
                    <div onClick={() => setFilters((f) => ({ ...f, [opt.key]: !f[opt.key as keyof FilterState] }))}
                      className={cn('w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
                        filters[opt.key as keyof FilterState] ? 'border-brand-blue bg-brand-blue' : 'border-brand-border group-hover:border-brand-blue')}>
                      {filters[opt.key as keyof FilterState] && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm font-manrope text-text-2">{opt.label}</span>
                  </label>
                ))}
              </FilterSection>
            </div>
          </aside>

          {/* Products area */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center gap-3 mb-5">
              <button onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-white border border-brand-border rounded-lg px-3 py-2 text-sm font-manrope font-600 text-text-2 hover:bg-brand-offwhite">
                <SlidersHorizontal className="w-4 h-4" />
                Filters {activeFilterCount > 0 && <span className="bg-brand-blue text-white text-[10px] font-syne font-700 rounded-full w-4 h-4 flex items-center justify-center">{activeFilterCount}</span>}
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
                  className="border border-brand-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-brand-blue"
                >
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <div className="flex border border-brand-border rounded-lg overflow-hidden bg-white">
                  {(['grid', 'list'] as const).map((mode) => (
                    <button key={mode} onClick={() => setViewMode(mode)}
                      className={cn('p-2 transition-colors', viewMode === mode ? 'bg-brand-blue text-white' : 'text-text-3 hover:bg-brand-offwhite')}>
                      {mode === 'grid' ? <Grid3X3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Product grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${filters.sort}-${filters.categories.join()}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4'
                    : 'flex flex-col gap-3'
                )}
              >
                {loading && products.length === 0
                  ? Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-lg overflow-hidden border border-brand-border">
                      <div className="skeleton aspect-square" />
                      <div className="p-3 space-y-2">
                        <div className="skeleton h-3 w-16 rounded" />
                        <div className="skeleton h-4 w-full rounded" />
                        <div className="skeleton h-8 w-full rounded-lg" />
                      </div>
                    </div>
                  ))
                  : products.length > 0
                  ? products.map((p) => <ProductCard key={p.id} product={p} />)
                  : (
                    <div className="col-span-full py-20 text-center">
                      <div className="text-4xl mb-3">🔍</div>
                      <h3 className="font-syne font-700 text-text-1 mb-2">No products found</h3>
                      <p className="text-text-3 font-manrope text-sm">Try adjusting your filters or search term.</p>
                    </div>
                  )
                }
              </motion.div>
            </AnimatePresence>

            {/* Load more */}
            {products.length > 0 && products.length < total && (
              <div className="text-center mt-8">
                <button
                  onClick={() => { const next = page + 1; setPage(next); void loadProducts(filters, next) }}
                  disabled={loading}
                  className="px-8 py-3 border-2 border-brand-blue text-brand-blue font-syne font-700 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : `Load More (${total - products.length} remaining)`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white overflow-y-auto shadow-float">
              <div className="flex items-center justify-between px-4 py-4 border-b border-brand-border">
                <span className="font-syne font-700 text-text-1">Filters</span>
                <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5 text-text-3" /></button>
              </div>
              <div className="p-4">
                <p className="text-text-3 font-manrope text-sm">Filter options available in desktop view.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
