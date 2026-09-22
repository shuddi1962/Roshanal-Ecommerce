'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Package, Plus, Search, Filter, MoreHorizontal, Edit, Trash2,
  Eye, Copy, Upload, Download, Bot, CheckCircle, XCircle, AlertCircle,
} from 'lucide-react'
import { cn, formatNaira } from '@/lib/utils'

interface Product {
  id: string; name: string; slug: string; sku: string; type: string
  regular_price_kobo: number; sale_price_kobo: number | null
  is_active: boolean; is_draft: boolean; is_featured: boolean
  images: Array<{ small?: string; url?: string }>
  categories?: { name: string } | null
  brands?: { name: string } | null
  created_at: string
}

export default function AdminProductsContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'inactive'>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        admin: '1',
        page: String(page),
        count: '25',
        ...(search && { search }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      })
      const res = await fetch(`/api/admin/products?${params}`)
      const data = (await res.json()) as { products: Product[]; total: number }
      setProducts(data.products ?? [])
      setTotal(data.total ?? 0)
    } catch { setProducts([]) }
    finally { setLoading(false) }
  }, [page, search, statusFilter])

  useEffect(() => { void load() }, [load])

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === products.length) { setSelected(new Set()) }
    else { setSelected(new Set(products.map((p) => p.id))) }
  }

  const STATUS_BADGE = (product: Product) => {
    if (product.is_draft) return { label: 'Draft', cls: 'bg-yellow-100 text-yellow-700', icon: <AlertCircle className="w-3 h-3" /> }
    if (!product.is_active) return { label: 'Inactive', cls: 'bg-red-100 text-red-700', icon: <XCircle className="w-3 h-3" /> }
    return { label: 'Active', cls: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3 h-3" /> }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-syne font-800 text-2xl text-text-1 flex items-center gap-2">
            <Package className="w-6 h-6 text-brand-blue" /> Products
          </h1>
          <p className="text-text-3 font-manrope text-sm mt-0.5">{total} total products</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-brand-border rounded-lg text-sm font-manrope text-text-2 hover:bg-brand-offwhite">
            <Upload className="w-4 h-4" /> Import CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-brand-border rounded-lg text-sm font-manrope text-text-2 hover:bg-brand-offwhite">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <Link href="/admin/products/new"
            className="flex items-center gap-2 bg-brand-blue text-white font-syne font-700 text-sm px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-brand-border p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search products, SKUs..." className="w-full pl-9 pr-4 py-2 border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-blue" />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'draft', 'inactive'] as const).map((status) => (
            <button key={status} onClick={() => setStatusFilter(status)}
              className={cn('px-3 py-2 text-xs font-manrope font-600 rounded-lg capitalize transition-colors',
                statusFilter === status ? 'bg-brand-blue text-white' : 'bg-brand-offwhite text-text-3 hover:bg-blue-50')}>
              {status}
            </button>
          ))}
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm font-manrope text-text-3">{selected.size} selected</span>
            <button className="text-xs px-3 py-1.5 bg-red-50 text-brand-red border border-red-200 rounded-lg hover:bg-red-100 font-manrope">Delete</button>
            <button className="text-xs px-3 py-1.5 bg-brand-offwhite border border-brand-border rounded-lg hover:bg-blue-50 text-brand-blue font-manrope">Publish</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brand-offwhite">
              <tr>
                <th className="w-10 px-4 py-3 text-left">
                  <input type="checkbox" checked={selected.size === products.length && products.length > 0}
                    onChange={toggleAll} className="w-4 h-4 accent-brand-blue" />
                </th>
                {['Product', 'SKU', 'Category', 'Price', 'Status', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-manrope font-700 text-text-4 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((__, j) => <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>)}
                  </tr>
                ))
                : products.length === 0
                ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center">
                      <Package className="w-10 h-10 text-text-4 mx-auto mb-3" />
                      <p className="font-manrope text-text-3">No products found.</p>
                      <Link href="/admin/products/new" className="mt-2 inline-flex items-center gap-1 text-sm text-brand-blue hover:underline">
                        <Plus className="w-3.5 h-3.5" /> Add your first product
                      </Link>
                    </td>
                  </tr>
                )
                : products.map((product) => {
                  const status = STATUS_BADGE(product)
                  const image = product.images?.[0]?.small ?? product.images?.[0]?.url
                  return (
                    <motion.tr key={product.id} layout className="hover:bg-brand-offwhite transition-colors">
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.has(product.id)} onChange={() => toggleSelect(product.id)} className="w-4 h-4 accent-brand-blue" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brand-offwhite rounded-lg overflow-hidden shrink-0 border border-brand-border">
                            {image ? <img src={image} alt="" className="w-full h-full object-contain p-1" /> : <Package className="w-5 h-5 text-text-4 m-auto mt-2.5" />}
                          </div>
                          <div>
                            <Link href={`/admin/products/${product.id}`} className="font-manrope font-600 text-text-1 text-sm hover:text-brand-blue transition-colors line-clamp-1">{product.name}</Link>
                            <div className="font-manrope text-text-4 text-xs capitalize">{product.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-text-3">{product.sku}</td>
                      <td className="px-4 py-3 font-manrope text-xs text-text-3">{(product.categories as { name: string } | null)?.name ?? '—'}</td>
                      <td className="px-4 py-3">
                        <div className="font-syne font-700 text-brand-red text-sm">{formatNaira(product.sale_price_kobo ?? product.regular_price_kobo)}</div>
                        {product.sale_price_kobo && <div className="text-text-4 text-xs line-through">{formatNaira(product.regular_price_kobo)}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-manrope font-600', status.cls)}>
                          {status.icon}{status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-manrope text-xs text-text-4">
                        {new Date(product.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link href={`/admin/products/${product.id}`} className="p-1.5 hover:bg-brand-offwhite rounded-lg transition-colors" title="Edit">
                            <Edit className="w-3.5 h-3.5 text-text-3" />
                          </Link>
                          <Link href={`/products/${product.slug}`} target="_blank" className="p-1.5 hover:bg-brand-offwhite rounded-lg transition-colors" title="Preview">
                            <Eye className="w-3.5 h-3.5 text-text-3" />
                          </Link>
                          <button className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors" title="AI Generate Content">
                            <Bot className="w-3.5 h-3.5 text-brand-blue" />
                          </button>
                          <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-3.5 h-3.5 text-brand-red" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 25 && (
          <div className="px-4 py-3 border-t border-brand-border flex items-center justify-between">
            <span className="text-xs font-manrope text-text-4">Showing {Math.min((page - 1) * 25 + 1, total)}–{Math.min(page * 25, total)} of {total}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border border-brand-border rounded-lg text-xs font-manrope disabled:opacity-40 hover:bg-brand-offwhite">
                Previous
              </button>
              <button disabled={page * 25 >= total} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border border-brand-border rounded-lg text-xs font-manrope disabled:opacity-40 hover:bg-brand-offwhite">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
