'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import {
  Ticket, Plus, Search, Filter, Copy, Edit2, Trash2, CheckCircle, XCircle,
  Percent, CreditCard, Calendar, User, Tag, MoreHorizontal, X,
  BarChart3, TrendingUp, Users, Clock
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn, formatNaira } from '@/lib/utils'

interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  min_order_kobo: number
  max_uses: number | null
  used_count: number
  remaining_uses: number
  expires_at: string | null
  is_active: boolean
  product_ids: string[] | null
  category_ids: string[] | null
  user_id: string | null
  created_at: string
}

interface CouponStats {
  activeCoupons: number
  totalUses: number
  totalDiscountGiven: number
  expiresSoon: number
}

interface Product {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
}

const couponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters'),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().min(0.01, 'Value must be greater than 0'),
  min_order_kobo: z.number().min(0).default(0),
  max_uses: z.number().nullable().optional(),
  product_ids: z.array(z.string()).optional(),
  category_ids: z.array(z.string()).optional(),
  user_id: z.string().optional().nullable(),
  expires_at: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
})

type CouponFormData = z.infer<typeof couponSchema>

export default function CouponsAdminContent() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [stats, setStats] = useState<CouponStats>({
    activeCoupons: 0,
    totalUses: 0,
    totalDiscountGiven: 0,
    expiresSoon: 0,
  })
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [usageData, setUsageData] = useState<Array<{ date: string; uses: number }>>([])

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      type: 'percentage',
      value: 10,
      min_order_kobo: 0,
      is_active: true,
      product_ids: [],
      category_ids: [],
    },
  })

  const couponType = watch('type')

  const loadCoupons = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (typeFilter !== 'all') params.append('type', typeFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      params.append('search', search)

      const res = await fetch(`/api/admin/coupons?${params}`)
      const data = await res.json()
      setCoupons(data.coupons ?? [])
      setStats(data.stats ?? {
        activeCoupons: 0,
        totalUses: 0,
        totalDiscountGiven: 0,
        expiresSoon: 0,
      })
    } catch {
      toast.error('Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }, [typeFilter, statusFilter, search])

  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products?limit=100')
      const data = await res.json()
      setProducts(data.products ?? [])
    } catch {
      setProducts([])
    }
  }, [])

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data.categories ?? [])
    } catch {
      setCategories([])
    }
  }, [])

  const loadCouponUsage = useCallback(async (couponId: string) => {
    try {
      const res = await fetch(`/api/admin/coupons/${couponId}/usage`)
      const data = await res.json()
      setUsageData(data.usage ?? [])
    } catch {
      setUsageData([])
    }
  }, [])

  useEffect(() => {
    loadCoupons()
    loadProducts()
    loadCategories()
  }, [loadCoupons, loadProducts, loadCategories])

  useEffect(() => {
    if (selectedCoupon) {
      loadCouponUsage(selectedCoupon.id)
    }
  }, [selectedCoupon, loadCouponUsage])

  const onSubmit = async (data: CouponFormData) => {
    try {
      const url = editingCoupon ? `/api/admin/coupons/${editingCoupon.id}` : '/api/admin/coupons'
      const method = editingCoupon ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed to save coupon')

      toast.success(editingCoupon ? 'Coupon updated' : 'Coupon created')
      setShowCreateModal(false)
      setEditingCoupon(null)
      reset()
      loadCoupons()
    } catch {
      toast.error('Failed to save coupon')
    }
  }

  const toggleActive = async (coupon: Coupon) => {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !coupon.is_active }),
      })

      if (!res.ok) throw new Error('Failed to update coupon')

      setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, is_active: !c.is_active } : c))
      toast.success(coupon.is_active ? 'Coupon deactivated' : 'Coupon activated')
    } catch {
      toast.error('Failed to update coupon')
    }
  }

  const deleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return

    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete coupon')

      setCoupons(prev => prev.filter(c => c.id !== id))
      toast.success('Coupon deleted')
    } catch {
      toast.error('Failed to delete coupon')
    }
  }

  const duplicateCoupon = (coupon: Coupon) => {
    reset({
      code: `${coupon.code}-COPY`,
      type: coupon.type,
      value: coupon.value,
      min_order_kobo: coupon.min_order_kobo,
      max_uses: coupon.max_uses,
      product_ids: coupon.product_ids || [],
      category_ids: coupon.category_ids || [],
      user_id: coupon.user_id,
      expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().slice(0, 16) : null,
      is_active: true,
    })
    setEditingCoupon(null)
    setShowCreateModal(true)
  }

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setValue('code', code)
  }

  const filteredCoupons = coupons.filter((c) => {
    if (!search) return true
    const s = search.toLowerCase()
    return c.code.toLowerCase().includes(s)
  })

  const isExpired = (coupon: Coupon) => {
    if (!coupon.expires_at) return false
    return new Date(coupon.expires_at) < new Date()
  }

  const expiresSoon = (coupon: Coupon) => {
    if (!coupon.expires_at) return false
    const daysUntilExpiry = Math.ceil((new Date(coupon.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-syne font-800 text-2xl text-text-1 flex items-center gap-2">
            <Ticket className="w-6 h-6 text-brand-blue" /> Coupons & Discounts
          </h1>
          <p className="font-manrope text-text-3 text-sm mt-0.5">Manage promotional codes and discounts</p>
        </div>
        <button
          onClick={() => {
            setEditingCoupon(null)
            reset({
              code: '',
              type: 'percentage',
              value: 10,
              min_order_kobo: 0,
              max_uses: null,
              is_active: true,
              product_ids: [],
              category_ids: [],
            })
            setShowCreateModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white font-syne font-700 rounded-lg hover:bg-brand-blue/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Coupons', value: stats.activeCoupons, color: 'bg-green-50 text-success', icon: CheckCircle },
          { label: 'Total Uses', value: stats.totalUses, color: 'bg-blue-50 text-brand-blue', icon: TrendingUp },
          { label: 'Total Discount', value: formatNaira(stats.totalDiscountGiven), color: 'bg-purple-50 text-purple-700', icon: CreditCard },
          { label: 'Expires Soon', value: stats.expiresSoon, color: 'bg-yellow-50 text-warning', icon: Clock },
        ].map((s) => (
          <div key={s.label} className={cn('rounded-xl border border-brand-border p-4', s.color)}>
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4" />
              <span className="font-manrope text-xs opacity-80">{s.label}</span>
            </div>
            <div className="font-syne font-800 text-2xl">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coupons..."
            className="w-full pl-9 pr-4 py-2 border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-blue"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-brand-border rounded-lg text-sm font-manrope focus:outline-none focus:border-brand-blue"
          >
            <option value="all">All Types</option>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-brand-border rounded-lg text-sm font-manrope focus:outline-none focus:border-brand-blue"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-brand-offwhite rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-10 text-center text-text-4 font-manrope">
            <Ticket className="w-12 h-12 mx-auto mb-3 opacity-30" />
            No coupons found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-brand-offwhite border-b border-brand-border">
                <tr>
                  <th className="px-4 py-3 text-left font-syne text-xs text-text-3 uppercase">Code</th>
                  <th className="px-4 py-3 text-left font-syne text-xs text-text-3 uppercase">Type</th>
                  <th className="px-4 py-3 text-left font-syne text-xs text-text-3 uppercase">Value</th>
                  <th className="px-4 py-3 text-left font-syne text-xs text-text-3 uppercase">Min Order</th>
                  <th className="px-4 py-3 text-center font-syne text-xs text-text-3 uppercase">Uses</th>
                  <th className="px-4 py-3 text-left font-syne text-xs text-text-3 uppercase">Expires</th>
                  <th className="px-4 py-3 text-center font-syne text-xs text-text-3 uppercase">Status</th>
                  <th className="px-4 py-3 text-right font-syne text-xs text-text-3 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {filteredCoupons.map((coupon) => (
                  <tr
                    key={coupon.id}
                    className="hover:bg-brand-offwhite/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedCoupon(coupon)}
                  >
                    <td className="px-4 py-3">
                      <code className="font-mono text-sm font-700 text-brand-blue">{coupon.code}</code>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-manrope font-600',
                        coupon.type === 'percentage' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      )}>
                        {coupon.type === 'percentage' ? <Percent className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                        {coupon.type === 'percentage' ? 'Percentage' : 'Fixed'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-syne font-700 text-text-1">
                        {coupon.type === 'percentage' ? `${coupon.value}%` : formatNaira(coupon.value * 100)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-manrope text-sm text-text-3">
                        {coupon.min_order_kobo > 0 ? formatNaira(coupon.min_order_kobo) : 'None'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-mono text-sm text-text-1">
                        {coupon.used_count}
                        {coupon.max_uses ? ` / ${coupon.max_uses}` : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'font-manrope text-xs',
                        isExpired(coupon) ? 'text-brand-red' : expiresSoon(coupon) ? 'text-warning' : 'text-text-3'
                      )}>
                        {coupon.expires_at
                          ? new Date(coupon.expires_at).toLocaleDateString()
                          : 'Never'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleActive(coupon)
                        }}
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-manrope font-600 transition-colors',
                          coupon.is_active && !isExpired(coupon)
                            ? 'bg-green-100 text-success'
                            : 'bg-gray-100 text-gray-500'
                        )}
                      >
                        {coupon.is_active && !isExpired(coupon) ? (
                          <><CheckCircle className="w-3 h-3" /> Active</>
                        ) : (
                          <><XCircle className="w-3 h-3" /> {isExpired(coupon) ? 'Expired' : 'Inactive'}</>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            duplicateCoupon(coupon)
                          }}
                          className="p-1.5 hover:bg-brand-border rounded-lg transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4 text-text-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingCoupon(coupon)
                            reset({
                              code: coupon.code,
                              type: coupon.type,
                              value: coupon.value,
                              min_order_kobo: coupon.min_order_kobo,
                              max_uses: coupon.max_uses,
                              product_ids: coupon.product_ids || [],
                              category_ids: coupon.category_ids || [],
                              user_id: coupon.user_id,
                              expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().slice(0, 16) : null,
                              is_active: coupon.is_active,
                            })
                            setShowCreateModal(true)
                          }}
                          className="p-1.5 hover:bg-brand-border rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-brand-blue" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteCoupon(coupon.id)
                          }}
                          className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-brand-red" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-auto"
            >
              <div className="p-6 border-b border-brand-border flex items-center justify-between">
                <h2 className="font-syne font-800 text-xl text-text-1">
                  {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingCoupon(null)
                    reset()
                  }}
                  className="p-2 hover:bg-brand-offwhite rounded-lg"
                >
                  <X className="w-5 h-5 text-text-3" />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div>
                  <label className="font-manrope text-sm text-text-2 mb-1 flex items-center justify-between">
                    Code *
                    <button
                      type="button"
                      onClick={generateCode}
                      className="text-brand-blue text-xs hover:underline"
                    >
                      Auto-generate
                    </button>
                  </label>
                  <input
                    {...register('code')}
                    className="w-full px-4 py-2 border border-brand-border rounded-lg font-mono uppercase focus:outline-none focus:border-brand-blue"
                    placeholder="e.g. SUMMER2026"
                  />
                  {errors.code && <p className="text-brand-red text-xs mt-1">{errors.code.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-manrope text-sm text-text-2 mb-1 block">Type *</label>
                    <select
                      {...register('type')}
                      className="w-full px-4 py-2 border border-brand-border rounded-lg focus:outline-none focus:border-brand-blue"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₦)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-manrope text-sm text-text-2 mb-1 block">Value *</label>
                    <input
                      type="number"
                      step={couponType === 'percentage' ? 1 : 0.01}
                      {...register('value', { valueAsNumber: true })}
                      className="w-full px-4 py-2 border border-brand-border rounded-lg focus:outline-none focus:border-brand-blue"
                    />
                    {errors.value && <p className="text-brand-red text-xs mt-1">{errors.value.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-manrope text-sm text-text-2 mb-1 block">Min Order (₦)</label>
                    <input
                      type="number"
                      {...register('min_order_kobo', { valueAsNumber: true })}
                      className="w-full px-4 py-2 border border-brand-border rounded-lg focus:outline-none focus:border-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="font-manrope text-sm text-text-2 mb-1 block">Max Uses (optional)</label>
                    <input
                      type="number"
                      {...register('max_uses', { valueAsNumber: true })}
                      className="w-full px-4 py-2 border border-brand-border rounded-lg focus:outline-none focus:border-brand-blue"
                      placeholder="Unlimited"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-manrope text-sm text-text-2 mb-1 block">Expires At (optional)</label>
                  <input
                    type="datetime-local"
                    {...register('expires_at')}
                    className="w-full px-4 py-2 border border-brand-border rounded-lg focus:outline-none focus:border-brand-blue"
                  />
                </div>

                <div>
                  <label className="font-manrope text-sm text-text-2 mb-1 block">Specific Products (optional)</label>
                  <select
                    multiple
                    {...register('product_ids')}
                    className="w-full px-4 py-2 border border-brand-border rounded-lg focus:outline-none focus:border-brand-blue h-24"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-text-4 mt-1">Hold Ctrl/Cmd to select multiple</p>
                </div>

                <div>
                  <label className="font-manrope text-sm text-text-2 mb-1 block">Specific Categories (optional)</label>
                  <select
                    multiple
                    {...register('category_ids')}
                    className="w-full px-4 py-2 border border-brand-border rounded-lg focus:outline-none focus:border-brand-blue h-24"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register('is_active')}
                    className="w-4 h-4 accent-brand-blue"
                  />
                  <label className="font-manrope text-sm text-text-2">Active</label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-brand-border">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setEditingCoupon(null)
                      reset()
                    }}
                    className="px-4 py-2 border border-brand-border rounded-lg font-manrope text-text-3 hover:bg-brand-offwhite"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-brand-blue text-white font-syne font-700 rounded-lg hover:bg-brand-blue/90 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Usage Analytics Modal */}
      <AnimatePresence>
        {selectedCoupon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full"
            >
              <div className="p-6 border-b border-brand-border flex items-center justify-between">
                <div>
                  <h2 className="font-syne font-800 text-xl text-text-1">Coupon Analytics</h2>
                  <code className="font-mono text-sm text-brand-blue">{selectedCoupon.code}</code>
                </div>
                <button
                  onClick={() => setSelectedCoupon(null)}
                  className="p-2 hover:bg-brand-offwhite rounded-lg"
                >
                  <X className="w-5 h-5 text-text-3" />
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-brand-offwhite rounded-lg p-4 text-center">
                    <div className="font-syne font-800 text-2xl text-brand-blue">{selectedCoupon.used_count}</div>
                    <div className="font-manrope text-text-4 text-xs">Total Uses</div>
                  </div>
                  <div className="bg-brand-offwhite rounded-lg p-4 text-center">
                    <div className="font-syne font-800 text-2xl text-success">
                      {selectedCoupon.max_uses ? selectedCoupon.max_uses - selectedCoupon.used_count : '∞'}
                    </div>
                    <div className="font-manrope text-text-4 text-xs">Remaining</div>
                  </div>
                  <div className="bg-brand-offwhite rounded-lg p-4 text-center">
                    <div className="font-syne font-800 text-2xl text-brand-navy">
                      {selectedCoupon.type === 'percentage' ? `${selectedCoupon.value}%` : formatNaira(selectedCoupon.value * 100)}
                    </div>
                    <div className="font-manrope text-text-4 text-xs">Discount</div>
                  </div>
                </div>

                <h3 className="font-syne font-700 text-text-1 mb-4">Usage Over Time</h3>
                <div className="h-48 bg-brand-offwhite rounded-lg p-4">
                  {usageData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={usageData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8EBF6" />
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#4A5270' }} />
                        <YAxis tick={{ fontSize: 12, fill: '#4A5270' }} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E8EBF6' }} />
                        <Line type="monotone" dataKey="uses" stroke="#1641C4" strokeWidth={2} dot={{ fill: '#1641C4' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-text-4 font-manrope text-sm">
                      No usage data available
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
