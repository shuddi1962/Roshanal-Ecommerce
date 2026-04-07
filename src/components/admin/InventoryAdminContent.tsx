'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import {
  Package, Search, Filter, Download, AlertTriangle, Plus, Minus,
  ChevronDown, ChevronUp, X, Building2, BarChart3, FileText,
  CheckCircle, XCircle, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { cn } from '@/lib/utils'

interface Branch {
  id: string
  name: string
  city: string
}

interface InventoryItem {
  id: string
  product_id: string
  product_name: string
  sku: string
  branch_id: string
  branch_name: string
  quantity: number
  reserved_qty: number
  available_qty: number
  low_stock_threshold: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked'
  last_updated: string
}

interface InventoryStats {
  totalSKUs: number
  lowStock: number
  outOfStock: number
  reserved: number
  totalQuantity: number
}

const adjustmentSchema = z.object({
  change: z.number().min(-10000).max(10000),
  reason: z.enum(['received', 'adjustment', 'damage', 'returned', 'sale', 'transfer']),
  notes: z.string().optional(),
})

type AdjustmentFormData = z.infer<typeof adjustmentSchema>

const STATUS_CONFIG = {
  in_stock: { label: 'In Stock', bg: 'bg-green-100', text: 'text-success', icon: CheckCircle },
  low_stock: { label: 'Low Stock', bg: 'bg-yellow-100', text: 'text-warning', icon: AlertTriangle },
  out_of_stock: { label: 'Out of Stock', bg: 'bg-red-100', text: 'text-brand-red', icon: XCircle },
  overstocked: { label: 'Overstocked', bg: 'bg-blue-100', text: 'text-brand-blue', icon: ArrowUpCircle },
}

const REASON_OPTIONS = [
  { value: 'received', label: 'Stock Received' },
  { value: 'adjustment', label: 'Inventory Adjustment' },
  { value: 'damage', label: 'Damaged/Lost' },
  { value: 'returned', label: 'Customer Return' },
  { value: 'sale', label: 'Sale Correction' },
  { value: 'transfer', label: 'Branch Transfer' },
]

export default function InventoryAdminContent() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [stats, setStats] = useState<InventoryStats>({
    totalSKUs: 0,
    lowStock: 0,
    outOfStock: 0,
    reserved: 0,
    totalQuantity: 0,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedBranch, setSelectedBranch] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false)
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null)
  const [showLowStockAlert, setShowLowStockAlert] = useState(false)
  const [chartData, setChartData] = useState<Array<{ name: string; quantity: number; fill: string }>>([])

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AdjustmentFormData>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: { change: 0, reason: 'adjustment' },
  })

  const loadBranches = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/branches')
      const data = await res.json()
      setBranches(data.branches ?? [])
    } catch {
      setBranches([])
    }
  }, [])

  const loadInventory = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedBranch !== 'all') params.append('branchId', selectedBranch)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      params.append('search', search)

      const res = await fetch(`/api/admin/inventory?${params}`)
      const data = await res.json()
      setInventory(data.inventory ?? [])
      setStats(data.stats ?? {
        totalSKUs: 0,
        lowStock: 0,
        outOfStock: 0,
        reserved: 0,
        totalQuantity: 0,
      })
      setShowLowStockAlert((data.stats?.lowStock ?? 0) > 0 || (data.stats?.outOfStock ?? 0) > 0)

      // Prepare chart data by branch
      const branchData = data.inventoryByBranch ?? []
      setChartData(branchData.map((b: { name: string; quantity: number }) => ({
        name: b.name,
        quantity: b.quantity,
        fill: '#1641C4',
      })))
    } catch {
      toast.error('Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }, [selectedBranch, statusFilter, search])

  useEffect(() => {
    loadBranches()
  }, [loadBranches])

  useEffect(() => {
    loadInventory()
  }, [loadInventory])

  const onAdjust = async (data: AdjustmentFormData) => {
    if (!adjustingItem) return

    try {
      const res = await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventoryId: adjustingItem.id,
          change: data.change,
          reason: data.reason,
          notes: data.notes,
        }),
      })

      if (!res.ok) throw new Error('Failed to adjust stock')

      toast.success('Stock adjusted successfully')
      setShowAdjustmentModal(false)
      setAdjustingItem(null)
      reset()
      loadInventory()
    } catch {
      toast.error('Failed to adjust stock')
    }
  }

  const exportCSV = () => {
    const headers = ['Product', 'SKU', 'Branch', 'Quantity', 'Reserved', 'Available', 'Status']
    const rows = inventory.map((item) => [
      item.product_name,
      item.sku,
      item.branch_name,
      item.quantity,
      item.reserved_qty,
      item.available_qty,
      STATUS_CONFIG[item.status].label,
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Inventory exported to CSV')
  }

  const filteredInventory = inventory.filter((item) => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      item.product_name.toLowerCase().includes(s) ||
      item.sku.toLowerCase().includes(s) ||
      item.branch_name.toLowerCase().includes(s)
    )
  })

  return (
    <div className="space-y-5">
      {/* Low Stock Alert Banner */}
      <AnimatePresence>
        {showLowStockAlert && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-brand-red shrink-0" />
            <div className="flex-1">
              <p className="font-syne font-700 text-brand-red text-sm">
                Low Stock Alert: {stats.lowStock} items below threshold, {stats.outOfStock} out of stock
              </p>
              <p className="font-manrope text-text-3 text-xs">
                Review inventory and restock items as needed
              </p>
            </div>
            <button
              onClick={() => setStatusFilter('low')}
              className="px-4 py-2 bg-brand-red text-white text-sm font-syne font-700 rounded-lg hover:bg-red-700 transition-colors"
            >
              View Low Stock
            </button>
            <button
              onClick={() => setShowLowStockAlert(false)}
              className="p-1 hover:bg-red-100 rounded-lg"
            >
              <X className="w-4 h-4 text-brand-red" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-syne font-800 text-2xl text-text-1 flex items-center gap-2">
            <Package className="w-6 h-6 text-brand-blue" /> Inventory Management
          </h1>
          <p className="font-manrope text-text-3 text-sm mt-0.5">Multi-location stock tracking and management</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-brand-border rounded-lg text-sm font-manrope text-text-2 hover:bg-brand-offwhite transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total SKUs', value: stats.totalSKUs, color: 'bg-brand-offwhite text-brand-blue', icon: Package },
          { label: 'Total Quantity', value: stats.totalQuantity, color: 'bg-blue-50 text-blue-700', icon: BarChart3 },
          { label: 'Low Stock', value: stats.lowStock, color: 'bg-yellow-50 text-warning', icon: AlertTriangle },
          { label: 'Out of Stock', value: stats.outOfStock, color: 'bg-red-50 text-brand-red', icon: XCircle },
          { label: 'Reserved', value: stats.reserved, color: 'bg-purple-50 text-purple-700', icon: Building2 },
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

      {/* Chart */}
      <div className="bg-white rounded-xl border border-brand-border p-4">
        <h3 className="font-syne font-700 text-text-1 mb-4">Stock Levels by Branch</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EBF6" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#4A5270' }} />
              <YAxis tick={{ fontSize: 12, fill: '#4A5270' }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #E8EBF6' }}
                cursor={{ fill: '#F3F5FB' }}
              />
              <Bar dataKey="quantity" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#1641C4', '#0C1A36', '#C8191C', '#0B6B3A', '#9C4B10'][index % 5]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product or SKU..."
            className="w-full pl-9 pr-4 py-2 border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-blue"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3 py-2 border border-brand-border rounded-lg text-sm font-manrope focus:outline-none focus:border-brand-blue"
          >
            <option value="all">All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-brand-border rounded-lg text-sm font-manrope focus:outline-none focus:border-brand-blue"
          >
            <option value="all">All Status</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
            <option value="overstocked">Overstocked</option>
          </select>
        </div>
      </div>

      {/* Branch Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-brand-border pb-2">
        <button
          onClick={() => setSelectedBranch('all')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-manrope font-600 transition-colors',
            selectedBranch === 'all'
              ? 'bg-brand-blue text-white'
              : 'text-text-3 hover:bg-brand-offwhite'
          )}
        >
          All Branches
        </button>
        {branches.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelectedBranch(b.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-manrope font-600 transition-colors',
              selectedBranch === b.id
                ? 'bg-brand-blue text-white'
                : 'text-text-3 hover:bg-brand-offwhite'
            )}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-brand-offwhite rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="p-10 text-center text-text-4 font-manrope">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            No inventory items found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-brand-offwhite border-b border-brand-border">
                <tr>
                  <th className="px-4 py-3 text-left font-syne text-xs text-text-3 uppercase">Product</th>
                  <th className="px-4 py-3 text-left font-syne text-xs text-text-3 uppercase">SKU</th>
                  <th className="px-4 py-3 text-left font-syne text-xs text-text-3 uppercase">Branch</th>
                  <th className="px-4 py-3 text-right font-syne text-xs text-text-3 uppercase">Quantity</th>
                  <th className="px-4 py-3 text-right font-syne text-xs text-text-3 uppercase">Reserved</th>
                  <th className="px-4 py-3 text-right font-syne text-xs text-text-3 uppercase">Available</th>
                  <th className="px-4 py-3 text-center font-syne text-xs text-text-3 uppercase">Status</th>
                  <th className="px-4 py-3 text-right font-syne text-xs text-text-3 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {filteredInventory.map((item) => {
                  const statusConfig = STATUS_CONFIG[item.status]
                  return (
                    <tr key={item.id} className="hover:bg-brand-offwhite/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-syne font-700 text-text-1 text-sm">{item.product_name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="font-mono text-xs text-text-3">{item.sku}</code>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-manrope text-sm text-text-2">{item.branch_name}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-sm text-text-1">{item.quantity}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-sm text-text-3">{item.reserved_qty}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={cn('font-mono text-sm font-700', item.available_qty <= 0 ? 'text-brand-red' : 'text-text-1')}>
                          {item.available_qty}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-manrope font-600', statusConfig.bg, statusConfig.text)}>
                          <statusConfig.icon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setAdjustingItem(item)
                            setShowAdjustmentModal(true)
                          }}
                          className="p-1.5 hover:bg-brand-border rounded-lg transition-colors"
                          title="Adjust stock"
                        >
                          <Plus className="w-4 h-4 text-brand-blue" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjustment Modal */}
      <AnimatePresence>
        {showAdjustmentModal && adjustingItem && (
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
              className="bg-white rounded-xl max-w-md w-full"
            >
              <div className="p-6 border-b border-brand-border flex items-center justify-between">
                <div>
                  <h2 className="font-syne font-800 text-lg text-text-1">Adjust Stock</h2>
                  <p className="font-manrope text-text-4 text-xs">{adjustingItem.product_name} at {adjustingItem.branch_name}</p>
                </div>
                <button
                  onClick={() => {
                    setShowAdjustmentModal(false)
                    setAdjustingItem(null)
                    reset()
                  }}
                  className="p-2 hover:bg-brand-offwhite rounded-lg"
                >
                  <X className="w-5 h-5 text-text-3" />
                </button>
              </div>
              <form onSubmit={handleSubmit(onAdjust)} className="p-6 space-y-4">
                <div className="bg-brand-offwhite rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="font-mono text-lg text-text-1">{adjustingItem.quantity}</div>
                      <div className="font-manrope text-xs text-text-4">Current</div>
                    </div>
                    <div>
                      <div className="font-mono text-lg text-text-3">{adjustingItem.reserved_qty}</div>
                      <div className="font-manrope text-xs text-text-4">Reserved</div>
                    </div>
                    <div>
                      <div className="font-mono text-lg text-brand-blue">{adjustingItem.available_qty}</div>
                      <div className="font-manrope text-xs text-text-4">Available</div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-manrope text-sm text-text-2 mb-1 block">Quantity Change</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => reset({ ...reset(), change: (adjustingItem.quantity || 0) - 1 })}
                      className="p-2 border border-brand-border rounded-lg hover:bg-brand-offwhite"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      {...register('change', { valueAsNumber: true })}
                      className="flex-1 px-4 py-2 border border-brand-border rounded-lg text-center font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => reset({ ...reset(), change: (adjustingItem.quantity || 0) + 1 })}
                      className="p-2 border border-brand-border rounded-lg hover:bg-brand-offwhite"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-text-4 mt-1">Use negative values to reduce stock</p>
                  {errors.change && (
                    <p className="text-brand-red text-xs mt-1">{errors.change.message}</p>
                  )}
                </div>

                <div>
                  <label className="font-manrope text-sm text-text-2 mb-1 block">Reason *</label>
                  <select
                    {...register('reason')}
                    className="w-full px-4 py-2 border border-brand-border rounded-lg focus:outline-none focus:border-brand-blue"
                  >
                    {REASON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {errors.reason && (
                    <p className="text-brand-red text-xs mt-1">{errors.reason.message}</p>
                  )}
                </div>

                <div>
                  <label className="font-manrope text-sm text-text-2 mb-1 block">Notes</label>
                  <textarea
                    {...register('notes')}
                    rows={3}
                    className="w-full px-4 py-2 border border-brand-border rounded-lg focus:outline-none focus:border-brand-blue resize-none"
                    placeholder="Optional notes about this adjustment..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-brand-border">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdjustmentModal(false)
                      setAdjustingItem(null)
                      reset()
                    }}
                    className="px-4 py-2 border border-brand-border rounded-lg font-manrope text-text-3 hover:bg-brand-offwhite"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-brand-blue text-white font-syne font-700 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Adjustment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
