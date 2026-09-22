'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import {
  Wallet, Users, CreditCard, ArrowUpRight, ArrowDownRight, Search,
  Plus, Minus, CheckCircle, XCircle, Clock, DollarSign, Building2,
  X, TrendingUp, AlertCircle, Filter
} from 'lucide-react'
import { cn, formatNaira } from '@/lib/utils'

type TabType = 'wallets' | 'payouts' | 'transactions'
type TransactionType = 'credit' | 'debit'
type PayoutStatus = 'pending' | 'approved' | 'rejected'

interface CustomerWallet {
  id: string
  user_id: string
  user_name: string
  user_email: string
  balance_kobo: number
  loyalty_points: number
  tier: string
  created_at: string
}

interface VendorPayout {
  id: string
  vendor_id: string
  vendor_name: string
  pending_balance: number
  total_earned: number
  bank_name: string
  account_number: string
  account_name: string
  status: PayoutStatus
  requested_at: string
}

interface Transaction {
  id: string
  user_id: string
  user_name: string
  type: TransactionType
  amount_kobo: number
  reference: string
  description: string
  created_at: string
}

interface WalletStats {
  totalPlatformBalance: number
  pendingPayouts: number
  monthlyPayouts: number
}

const adjustmentSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  amountKobo: z.number().min(1, 'Amount must be greater than 0'),
  type: z.enum(['credit', 'debit']),
  reason: z.string().min(1, 'Reason is required'),
})

type AdjustmentFormData = z.infer<typeof adjustmentSchema>

export default function WalletAdminContent() {
  const [activeTab, setActiveTab] = useState<TabType>('wallets')
  const [wallets, setWallets] = useState<CustomerWallet[]>([])
  const [payouts, setPayouts] = useState<VendorPayout[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<WalletStats>({
    totalPlatformBalance: 0,
    pendingPayouts: 0,
    monthlyPayouts: 0,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false)
  const [selectedPayout, setSelectedPayout] = useState<VendorPayout | null>(null)
  const [payoutFilter, setPayoutFilter] = useState<PayoutStatus | 'all'>('all')

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AdjustmentFormData>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: { type: 'credit' },
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/wallet')
      const data = await res.json()
      setWallets(data.customerWallets ?? [])
      setPayouts(data.vendorPayouts ?? [])
      setTransactions(data.transactions ?? [])
      setStats(data.stats ?? {
        totalPlatformBalance: 0,
        pendingPayouts: 0,
        monthlyPayouts: 0,
      })
    } catch {
      toast.error('Failed to load wallet data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const onAdjust = async (data: AdjustmentFormData) => {
    try {
      const res = await fetch('/api/admin/wallet/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed to adjust balance')

      toast.success(`Balance ${data.type === 'credit' ? 'credited' : 'debited'} successfully`)
      setShowAdjustmentModal(false)
      reset()
      loadData()
    } catch {
      toast.error('Failed to adjust balance')
    }
  }

  const handlePayout = async (payoutId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/wallet/payouts/${payoutId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) throw new Error('Failed to update payout')

      toast.success(`Payout ${status}`)
      setSelectedPayout(null)
      loadData()
    } catch {
      toast.error('Failed to update payout')
    }
  }

  const filteredWallets = wallets.filter((w) => {
    if (!search) return true
    const s = search.toLowerCase()
    return w.user_name.toLowerCase().includes(s) || w.user_email.toLowerCase().includes(s)
  })

  const filteredPayouts = payouts.filter((p) => {
    if (payoutFilter !== 'all' && p.status !== payoutFilter) return false
    if (!search) return true
    const s = search.toLowerCase()
    return p.vendor_name.toLowerCase().includes(s)
  })

  const filteredTransactions = transactions.filter((t) => {
    if (!search) return true
    const s = search.toLowerCase()
    return t.user_name.toLowerCase().includes(s) || t.reference.toLowerCase().includes(s)
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-syne font-800 text-2xl text-text-1 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-brand-blue" /> Wallet & Payouts
          </h1>
          <p className="font-manrope text-text-3 text-sm mt-0.5">Manage customer wallets and vendor payouts</p>
        </div>
        <button
          onClick={() => setShowAdjustmentModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white font-syne font-700 rounded-lg hover:bg-brand-blue/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Adjust Balance
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Platform Balance', value: formatNaira(stats.totalPlatformBalance), color: 'bg-blue-50 text-brand-blue', icon: Wallet },
          { label: 'Pending Payouts', value: formatNaira(stats.pendingPayouts), color: 'bg-yellow-50 text-warning', icon: Clock },
          { label: 'This Month Payouts', value: formatNaira(stats.monthlyPayouts), color: 'bg-green-50 text-success', icon: TrendingUp },
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

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-brand-border pb-2">
        {[
          { id: 'wallets' as TabType, label: 'Customer Wallets', icon: Users },
          { id: 'payouts' as TabType, label: 'Vendor Payouts', icon: Building2 },
          { id: 'transactions' as TabType, label: 'All Transactions', icon: CreditCard },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-manrope font-600 transition-colors',
              activeTab === tab.id
                ? 'bg-brand-blue text-white'
                : 'text-text-3 hover:bg-brand-offwhite'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-4 py-2 border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-blue"
          />
        </div>
        {activeTab === 'payouts' && (
          <select
            value={payoutFilter}
            onChange={(e) => setPayoutFilter(e.target.value as PayoutStatus | 'all')}
            className="px-3 py-2 border border-brand-border rounded-lg text-sm font-manrope focus:outline-none focus:border-brand-blue"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-brand-offwhite rounded-lg animate-pulse" />
            ))}
          </div>
        ) : activeTab === 'wallets' ? (
          filteredWallets.length === 0 ? (
            <div className="p-10 text-center text-text-4 font-manrope">
              <Wallet className="w-12 h-12 mx-auto mb-3 opacity-30" />
              No wallets found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-brand-offwhite border-b border-brand-border">
                  <tr>
                    <th className="px-4 py-3 text-left font-syne text-xs text-text-3 uppercase">Customer</th>
                    <th className="px-4 py-3 text-right font-syne text-xs text-text-3 uppercase">Balance</th>
                    <th className="px-4 py-3 text-right font-syne text-xs text-text-3 uppercase">Loyalty Points</th>
                    <th className="px-4 py-3 text-center font-syne text-xs text-text-3 uppercase">Tier</th>
                    <th className="px-4 py-3 text-right font-syne text-xs text-text-3 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {filteredWallets.map((wallet) => (
                    <tr key={wallet.id} className="hover:bg-brand-offwhite/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-syne font-700 text-text-1 text-sm">{wallet.user_name}</div>
                        <div className="font-manrope text-text-4 text-xs">{wallet.user_email}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono font-700 text-text-1">{formatNaira(wallet.balance_kobo)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-brand-blue">{wallet.loyalty_points.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-manrope font-600">
                          {wallet.tier}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            reset({ userId: wallet.user_id, type: 'credit', amountKobo: 0, reason: '' })
                            setShowAdjustmentModal(true)
                          }}
                          className="p-1.5 hover:bg-brand-border rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4 text-brand-blue" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : activeTab === 'payouts' ? (
          filteredPayouts.length === 0 ? (
            <div className="p-10 text-center text-text-4 font-manrope">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              No payouts found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-brand-offwhite border-b border-brand-border">
                  <tr>
                    <th className="px-4 py-3 text-left font-syne text-xs text-text-3 uppercase">Vendor</th>
                    <th className="px-4 py-3 text-right font-syne text-xs text-text-3 uppercase">Pending</th>
                    <th className="px-4 py-3 text-right font-syne text-xs text-text-3 uppercase">Total Earned</th>
                    <th className="px-4 py-3 text-center font-syne text-xs text-text-3 uppercase">Status</th>
                    <th className="px-4 py-3 text-right font-syne text-xs text-text-3 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {filteredPayouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-brand-offwhite/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-syne font-700 text-text-1 text-sm">{payout.vendor_name}</div>
                        <div className="font-manrope text-text-4 text-xs">{payout.bank_name} ••••{payout.account_number.slice(-4)}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono font-700 text-brand-blue">{formatNaira(payout.pending_balance)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-text-2">{formatNaira(payout.total_earned)}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-manrope font-600',
                          payout.status === 'approved' ? 'bg-green-100 text-success' :
                          payout.status === 'rejected' ? 'bg-red-100 text-brand-red' :
                          'bg-yellow-100 text-warning'
                        )}>
                          {payout.status === 'approved' ? <CheckCircle className="w-3 h-3" /> :
                           payout.status === 'rejected' ? <XCircle className="w-3 h-3" /> :
                           <Clock className="w-3 h-3" />}
                          {payout.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {payout.status === 'pending' && (
                          <button
                            onClick={() => setSelectedPayout(payout)}
                            className="px-3 py-1.5 bg-brand-blue text-white text-xs font-syne font-700 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Review
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          filteredTransactions.length === 0 ? (
            <div className="p-10 text-center text-text-4 font-manrope">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
              No transactions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-brand-offwhite border-b border-brand-border">
                  <tr>
                    <th className="px-4 py-3 text-left font-syne text-xs text-text-3 uppercase">User</th>
                    <th className="px-4 py-3 text-center font-syne text-xs text-text-3 uppercase">Type</th>
                    <th className="px-4 py-3 text-right font-syne text-xs text-text-3 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left font-syne text-xs text-text-3 uppercase">Reference</th>
                    <th className="px-4 py-3 text-left font-syne text-xs text-text-3 uppercase">Description</th>
                    <th className="px-4 py-3 text-right font-syne text-xs text-text-3 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-brand-offwhite/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-syne font-600 text-text-1 text-sm">{tx.user_name}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-manrope font-600',
                          tx.type === 'credit' ? 'bg-green-100 text-success' : 'bg-red-100 text-brand-red'
                        )}>
                          {tx.type === 'credit' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={cn('font-mono font-700', tx.type === 'credit' ? 'text-success' : 'text-brand-red')}>
                          {tx.type === 'credit' ? '+' : '-'}{formatNaira(tx.amount_kobo)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <code className="font-mono text-xs text-text-3">{tx.reference}</code>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-manrope text-sm text-text-2">{tx.description}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-manrope text-xs text-text-4">{new Date(tx.created_at).toLocaleDateString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Balance Adjustment Modal */}
      <AnimatePresence>
        {showAdjustmentModal && (
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
                <h2 className="font-syne font-800 text-lg text-text-1">Adjust Balance</h2>
                <button
                  onClick={() => {
                    setShowAdjustmentModal(false)
                    reset()
                  }}
                  className="p-2 hover:bg-brand-offwhite rounded-lg"
                >
                  <X className="w-5 h-5 text-text-3" />
                </button>
              </div>
              <form onSubmit={handleSubmit(onAdjust)} className="p-6 space-y-4">
                <div>
                  <label className="font-manrope text-sm text-text-2 mb-1 block">User *</label>
                  <select
                    {...register('userId')}
                    className="w-full px-4 py-2 border border-brand-border rounded-lg focus:outline-none focus:border-brand-blue"
                  >
                    <option value="">Select user</option>
                    {wallets.map((w) => (
                      <option key={w.user_id} value={w.user_id}>{w.user_name} ({w.user_email})</option>
                    ))}
                  </select>
                  {errors.userId && <p className="text-brand-red text-xs mt-1">{errors.userId.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-manrope text-sm text-text-2 mb-1 block">Type *</label>
                    <select
                      {...register('type')}
                      className="w-full px-4 py-2 border border-brand-border rounded-lg focus:outline-none focus:border-brand-blue"
                    >
                      <option value="credit">Credit (Add)</option>
                      <option value="debit">Debit (Deduct)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-manrope text-sm text-text-2 mb-1 block">Amount (₦) *</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('amountKobo', { valueAsNumber: true, setValueAs: (v) => Math.round(parseFloat(v) * 100) })}
                      className="w-full px-4 py-2 border border-brand-border rounded-lg focus:outline-none focus:border-brand-blue"
                      placeholder="0.00"
                    />
                    {errors.amountKobo && <p className="text-brand-red text-xs mt-1">{errors.amountKobo.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="font-manrope text-sm text-text-2 mb-1 block">Reason *</label>
                  <input
                    {...register('reason')}
                    className="w-full px-4 py-2 border border-brand-border rounded-lg focus:outline-none focus:border-brand-blue"
                    placeholder="Why are you adjusting this balance?"
                  />
                  {errors.reason && <p className="text-brand-red text-xs mt-1">{errors.reason.message}</p>}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-brand-border">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdjustmentModal(false)
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
                    {isSubmitting ? 'Saving...' : 'Apply Adjustment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payout Review Modal */}
      <AnimatePresence>
        {selectedPayout && (
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
                <h2 className="font-syne font-800 text-lg text-text-1">Review Payout Request</h2>
                <button
                  onClick={() => setSelectedPayout(null)}
                  className="p-2 hover:bg-brand-offwhite rounded-lg"
                >
                  <X className="w-5 h-5 text-text-3" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-brand-offwhite rounded-lg p-4">
                  <div className="font-syne font-700 text-text-1 mb-1">{selectedPayout.vendor_name}</div>
                  <div className="font-manrope text-text-3 text-sm">Requested {new Date(selectedPayout.requested_at).toLocaleDateString()}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-manrope text-xs text-text-4 uppercase">Amount</label>
                    <div className="font-syne font-800 text-xl text-brand-blue">{formatNaira(selectedPayout.pending_balance)}</div>
                  </div>
                  <div>
                    <label className="font-manrope text-xs text-text-4 uppercase">Total Earned</label>
                    <div className="font-syne font-700 text-text-1">{formatNaira(selectedPayout.total_earned)}</div>
                  </div>
                </div>

                <div>
                  <label className="font-manrope text-xs text-text-4 uppercase">Bank Details</label>
                  <div className="font-manrope text-text-2 text-sm mt-1">
                    <div>{selectedPayout.bank_name}</div>
                    <div>{selectedPayout.account_name}</div>
                    <code className="font-mono">{selectedPayout.account_number}</code>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-brand-border">
                  <button
                    onClick={() => handlePayout(selectedPayout.id, 'rejected')}
                    className="flex-1 py-3 border-2 border-brand-red text-brand-red font-syne font-700 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handlePayout(selectedPayout.id, 'approved')}
                    className="flex-1 py-3 bg-brand-blue text-white font-syne font-700 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Approve & Pay
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
