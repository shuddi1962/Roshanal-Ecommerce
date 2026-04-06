'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import {
  ShoppingBag, Users, TrendingUp, Package, ArrowUp, ArrowDown, ArrowRight,
  AlertTriangle, CheckCircle, Clock, DollarSign, Heart, Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCard {
  label: string
  value: string
  change: number
  icon: React.ElementType
  color: string
  href: string
}

const DUMMY_REVENUE = [
  { month: 'Nov', revenue: 2400000 }, { month: 'Dec', revenue: 3800000 },
  { month: 'Jan', revenue: 2900000 }, { month: 'Feb', revenue: 4200000 },
  { month: 'Mar', revenue: 3700000 }, { month: 'Apr', revenue: 5100000 },
]

const DUMMY_CATEGORIES = [
  { name: 'Security', value: 38, color: '#1641C4' },
  { name: 'Marine', value: 24, color: '#0B6B3A' },
  { name: 'Solar', value: 18, color: '#F59E0B' },
  { name: 'Networking', value: 12, color: '#8B5CF6' },
  { name: 'Other', value: 8, color: '#6B7280' },
]

export default function AdminDashboardContent() {
  const [stats] = useState<StatsCard[]>([
    { label: 'Revenue (Today)', value: '₦842,500', change: 12.4, icon: DollarSign, color: 'bg-blue-50 text-brand-blue', href: '/admin/financial-reports' },
    { label: 'Orders (Today)', value: '47', change: 8.2, icon: ShoppingBag, color: 'bg-green-50 text-success', href: '/admin/orders' },
    { label: 'New Customers', value: '18', change: -3.1, icon: Users, color: 'bg-purple-50 text-purple-600', href: '/admin/customers' },
    { label: 'Low Stock Items', value: '12', change: 25.0, icon: Package, color: 'bg-red-50 text-brand-red', href: '/admin/inventory' },
  ])

  const [recentOrders] = useState([
    { id: 'RG-2026-AB12CD', customer: 'Emeka Okafor', amount: '₦185,000', status: 'processing', time: '12 min ago' },
    { id: 'RG-2026-EF34GH', customer: 'Chidinma Eze', amount: '₦62,500', status: 'pending', time: '38 min ago' },
    { id: 'RG-2026-IJ56KL', customer: 'Babatunde Adewale', amount: '₦420,000', status: 'delivered', time: '1hr ago' },
    { id: 'RG-2026-MN78OP', customer: 'Fatima Abubakar', amount: '₦28,000', status: 'confirmed', time: '2hr ago' },
    { id: 'RG-2026-QR90ST', customer: 'Oluwaseun Bello', amount: '₦915,000', status: 'shipped', time: '3hr ago' },
  ])

  const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped: 'bg-cyan-100 text-cyan-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-syne font-800 text-2xl text-text-1">Dashboard</h1>
          <p className="text-text-3 font-manrope text-sm mt-0.5">Welcome back. Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/orders" className="flex items-center gap-2 bg-brand-blue text-white font-syne font-700 text-sm px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
            <ShoppingBag className="w-4 h-4" /> View Orders
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="bg-white rounded-xl border border-brand-border p-5 hover:shadow-card-hover transition-shadow group">
            <div className="flex items-start justify-between mb-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={cn('flex items-center gap-1 text-xs font-manrope font-600', stat.change >= 0 ? 'text-success' : 'text-brand-red')}>
                {stat.change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {Math.abs(stat.change)}%
              </div>
            </div>
            <div className="font-syne font-800 text-2xl text-text-1 mb-0.5">{stat.value}</div>
            <div className="font-manrope text-text-3 text-xs">{stat.label}</div>
          </Link>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-brand-border p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-syne font-700 text-text-1">Monthly Revenue</h2>
            <Link href="/admin/financial-reports" className="text-xs text-brand-blue hover:underline flex items-center gap-1">
              Full Report <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={DUMMY_REVENUE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EBF6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8990AB', fontFamily: 'var(--font-manrope)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8990AB', fontFamily: 'var(--font-manrope)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₦${(v / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(v) => [`₦${Number(v ?? 0).toLocaleString()}`, 'Revenue']} contentStyle={{ fontFamily: 'var(--font-manrope)', fontSize: 12, border: '1px solid #E8EBF6', borderRadius: 8 }} />
              <Line type="monotone" dataKey="revenue" stroke="#1641C4" strokeWidth={2.5} dot={{ fill: '#1641C4', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category pie */}
        <div className="bg-white rounded-xl border border-brand-border p-5">
          <h2 className="font-syne font-700 text-text-1 mb-4">Sales by Category</h2>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={DUMMY_CATEGORIES} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="value">
                {DUMMY_CATEGORIES.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${String(v ?? 0)}%`, 'Share']} contentStyle={{ fontFamily: 'var(--font-manrope)', fontSize: 12, border: '1px solid #E8EBF6', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {DUMMY_CATEGORIES.map((c) => (
              <div key={c.name} className="flex items-center gap-2 text-xs font-manrope">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-text-2 flex-1">{c.name}</span>
                <span className="font-600 text-text-1">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border">
          <h2 className="font-syne font-700 text-text-1">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs text-brand-blue hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brand-offwhite">
              <tr>
                {['Order #', 'Customer', 'Amount', 'Status', 'Time'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-manrope font-600 text-text-4 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-brand-offwhite transition-colors">
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs font-600 text-brand-blue hover:underline">{order.id}</Link>
                  </td>
                  <td className="px-5 py-3.5 font-manrope text-sm text-text-1">{order.customer}</td>
                  <td className="px-5 py-3.5 font-syne font-700 text-brand-red text-sm">{order.amount}</td>
                  <td className="px-5 py-3.5">
                    <span className={cn('px-2.5 py-1 rounded-full text-[11px] font-manrope font-600 capitalize', STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-700')}>{order.status}</span>
                  </td>
                  <td className="px-5 py-3.5 font-manrope text-xs text-text-4">{order.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Add Product', href: '/admin/products', icon: Package, color: 'bg-blue-600' },
          { label: 'New Booking', href: '/admin/bookings', icon: Clock, color: 'bg-green-600' },
          { label: 'Create Coupon', href: '/admin/coupons', icon: Zap, color: 'bg-amber-600' },
          { label: 'View Site Doctor', href: '/admin/site-doctor', icon: Heart, color: 'bg-red-600' },
        ].map((a) => (
          <Link key={a.label} href={a.href} className={cn('flex items-center gap-3 p-4 rounded-xl text-white transition-all hover:opacity-90 hover:-translate-y-0.5', a.color)}>
            <a.icon className="w-5 h-5 shrink-0" />
            <span className="font-syne font-700 text-sm">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
