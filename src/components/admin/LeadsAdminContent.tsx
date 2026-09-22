'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { 
  Users, Search, Plus, Filter, MoreHorizontal, Phone, Mail, Building2, 
  TrendingUp, Target, CheckCircle, XCircle, Clock, ChevronRight, X,
  BarChart3, UserPlus, Calendar
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn, formatDate } from '@/lib/utils'

interface Lead {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  industry: string | null
  source: string
  score: number
  status: LeadStatus
  assigned_to: string | null
  next_follow_up: string | null
  notes: string | null
  created_at: string
  assigned_staff?: { name: string }
}

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'

interface Staff {
  id: string
  name: string
}

const leadSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z.string().min(1, 'Source is required'),
  score: z.number().min(0).max(100).default(50),
})

type LeadFormData = z.infer<typeof leadSchema>

const PIPELINE_STAGES: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'new', label: 'New', color: 'bg-gray-500' },
  { id: 'contacted', label: 'Contacted', color: 'bg-blue-500' },
  { id: 'qualified', label: 'Qualified', color: 'bg-purple-500' },
  { id: 'proposal', label: 'Proposal', color: 'bg-orange-500' },
  { id: 'won', label: 'Won', color: 'bg-green-500' },
  { id: 'lost', label: 'Lost', color: 'bg-red-500' },
]

const SOURCES = [
  'Website', 'Referral', 'Social Media', 'Email Campaign', 
  'Phone Inquiry', 'Trade Show', 'Advertisement', 'Other'
]

function getScoreBadge(score: number): { bg: string; text: string; label: string } {
  if (score <= 30) return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cold' }
  if (score <= 60) return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Warm' }
  if (score <= 80) return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Hot' }
  return { bg: 'bg-red-100', text: 'text-red-700', label: 'Very Hot' }
}

function getStatusBadge(status: LeadStatus): { bg: string; text: string; icon: React.ReactNode } {
  switch (status) {
    case 'new':
      return { bg: 'bg-gray-100', text: 'text-gray-700', icon: <Clock className="w-3 h-3" /> }
    case 'contacted':
      return { bg: 'bg-blue-100', text: 'text-blue-700', icon: <Phone className="w-3 h-3" /> }
    case 'qualified':
      return { bg: 'bg-purple-100', text: 'text-purple-700', icon: <Target className="w-3 h-3" /> }
    case 'proposal':
      return { bg: 'bg-orange-100', text: 'text-orange-700', icon: <BarChart3 className="w-3 h-3" /> }
    case 'won':
      return { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle className="w-3 h-3" /> }
    case 'lost':
      return { bg: 'bg-red-100', text: 'text-red-700', icon: <XCircle className="w-3 h-3" /> }
  }
}

export default function LeadsAdminContent() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [activeTab, setActiveTab] = useState<'list' | 'pipeline'>('list')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<any>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(leadSchema) as any,
    defaultValues: { score: 50 },
  })

  useEffect(() => {
    loadLeads()
    loadStaff()
  }, [statusFilter, sourceFilter, page])

  const loadLeads = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (sourceFilter !== 'all') params.append('source', sourceFilter)
      params.append('page', page.toString())
      params.append('limit', '20')

      const res = await fetch(`/api/admin/leads?${params}`)
      const data = await res.json()
      setLeads(data.leads ?? [])
      setTotal(data.total ?? 0)
    } catch {
      setLeads([])
    } finally {
      setLoading(false)
    }
  }

  const loadStaff = async () => {
    try {
      const res = await fetch('/api/admin/staff')
      const data = await res.json()
      setStaff(data.staff ?? [])
    } catch {
      setStaff([])
    }
  }

  const onSubmit = async (data: LeadFormData) => {
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          email: data.email || null,
          phone: data.phone || null,
          company: data.company || null,
          status: 'new',
        }),
      })
      if (!res.ok) throw new Error('Failed to create lead')
      toast.success('Lead added successfully')
      setShowAddModal(false)
      reset()
      loadLeads()
    } catch {
      toast.error('Failed to add lead')
    }
  }

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('Failed to update lead')
      setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l))
      toast.success('Lead updated')
    } catch {
      toast.error('Failed to update lead')
    }
  }

  const deleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return
    try {
      const res = await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete lead')
      setLeads(prev => prev.filter(l => l.id !== id))
      toast.success('Lead deleted')
    } catch {
      toast.error('Failed to delete lead')
    }
  }

  const filteredLeads = leads.filter(l => {
    if (!search) return true
    const s = search.toLowerCase()
    return l.name.toLowerCase().includes(s) ||
      l.email?.toLowerCase().includes(s) ||
      l.company?.toLowerCase().includes(s)
  })

  const stats = {
    total: total,
    newThisWeek: leads.filter(l => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(l.created_at) >= weekAgo
    }).length,
    hotLeads: leads.filter(l => l.score > 70 && l.status !== 'won' && l.status !== 'lost').length,
    converted: leads.filter(l => l.status === 'won').length,
  }

  const pipelineData = PIPELINE_STAGES.map(stage => ({
    name: stage.label,
    count: leads.filter(l => l.status === stage.id).length,
    fill: stage.color.replace('bg-', '#').replace('500', '1641C4').replace('gray', '6B7280').replace('blue', '3B82F6').replace('purple', '8B5CF6').replace('orange', 'F97316').replace('green', '10B981').replace('red', 'EF4444'),
  }))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-syne font-800 text-2xl text-text-1 flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-blue" /> CRM Leads
          </h1>
          <p className="font-manrope text-text-3 text-sm mt-0.5">Manage sales leads and pipeline</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white font-syne font-700 rounded-lg hover:bg-brand-blue/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Lead
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: stats.total, color: 'bg-brand-offwhite text-brand-blue', icon: Users },
          { label: 'New This Week', value: stats.newThisWeek, color: 'bg-blue-50 text-blue-700', icon: Clock },
          { label: 'Hot Leads', value: stats.hotLeads, color: 'bg-red-50 text-red-700', icon: TrendingUp },
          { label: 'Converted', value: stats.converted, color: 'bg-green-50 text-green-700', icon: CheckCircle },
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

      <div className="bg-white rounded-xl border border-brand-border p-4">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pipelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EBF6" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#4A5270' }} />
              <YAxis tick={{ fontSize: 12, fill: '#4A5270' }} />
              <Tooltip 
                contentStyle={{ borderRadius: 8, border: '1px solid #E8EBF6' }}
                cursor={{ fill: '#F3F5FB' }}
              />
              <Bar dataKey="count" fill="#1641C4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="w-full pl-9 pr-4 py-2 border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-blue"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'all')}
            className="px-3 py-2 border border-brand-border rounded-lg text-sm font-manrope focus:outline-none focus:border-brand-blue"
          >
            <option value="all">All Status</option>
            {PIPELINE_STAGES.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 border border-brand-border rounded-lg text-sm font-manrope focus:outline-none focus:border-brand-blue"
          >
            <option value="all">All Sources</option>
            {SOURCES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={cn(
              'px-3 py-2 rounded-lg text-sm font-manrope font-600',
              activeTab === 'list' ? 'bg-brand-blue text-white' : 'border border-brand-border text-text-3'
            )}
          >
            List
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={cn(
              'px-3 py-2 rounded-lg text-sm font-manrope font-600',
              activeTab === 'pipeline' ? 'bg-brand-blue text-white' : 'border border-brand-border text-text-3'
            )}
          >
            Pipeline
          </button>
        </div>
      </div>

      {activeTab === 'list' ? (
        <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-brand-offwhite rounded-lg animate-pulse" />)}
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-10 text-center text-text-4 font-manrope">No leads found.</div>
          ) : (
            <div className="divide-y divide-brand-border">
              {filteredLeads.map(lead => {
                const scoreBadge = getScoreBadge(lead.score)
                const statusBadge = getStatusBadge(lead.status)
                return (
                  <motion.div
                    key={lead.id}
                    layout
                    className="px-5 py-4 flex items-center gap-4 hover:bg-brand-offwhite transition-colors"
                  >
                    <div className="w-10 h-10 bg-brand-offwhite rounded-lg flex items-center justify-center shrink-0">
                      <UserPlus className="w-5 h-5 text-brand-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-syne font-700 text-text-1 text-sm">{lead.name}</span>
                        <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-manrope font-600', scoreBadge.bg, scoreBadge.text)}>
                          {scoreBadge.label} ({lead.score})
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs font-manrope text-text-3">
                        {lead.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</span>}
                        {lead.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</span>}
                        {lead.company && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{lead.company}</span>}
                        <span className="text-text-4">{lead.source}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn('flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-manrope font-600', statusBadge.bg, statusBadge.text)}>
                        {statusBadge.icon}
                        {lead.status}
                      </span>
                      <select
                        value={lead.assigned_to || ''}
                        onChange={(e) => updateLead(lead.id, { assigned_to: e.target.value || null })}
                        className="text-xs border border-brand-border rounded-lg px-2 py-1 focus:outline-none focus:border-brand-blue"
                      >
                        <option value="">Unassigned</option>
                        {staff.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setEditingLead(lead)}
                        className="p-1.5 hover:bg-brand-border rounded-lg transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4 text-text-3" />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
          {total > 20 && (
            <div className="flex justify-center gap-2 p-4 border-t border-brand-border">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 border border-brand-border rounded-lg text-sm font-manrope disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-4 py-2 font-manrope text-sm text-text-3">Page {page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border border-brand-border rounded-lg text-sm font-manrope"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {PIPELINE_STAGES.map(stage => {
            const stageLeads = leads.filter(l => l.status === stage.id)
            return (
              <div key={stage.id} className="bg-brand-offwhite rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-syne font-700 text-sm text-text-1">{stage.label}</span>
                  <span className={cn('w-2 h-2 rounded-full', stage.color)} />
                </div>
                <div className="space-y-2">
                  {stageLeads.map(lead => (
                    <motion.div
                      key={lead.id}
                      layoutId={lead.id}
                      className="bg-white rounded-lg p-3 shadow-card cursor-pointer hover:shadow-card-hover transition-shadow"
                      onClick={() => setEditingLead(lead)}
                    >
                      <p className="font-syne font-700 text-sm text-text-1 truncate">{lead.name}</p>
                      <p className="text-xs text-text-4 truncate">{lead.company || 'No company'}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full', getScoreBadge(lead.score).bg, getScoreBadge(lead.score).text)}>
                          {lead.score}
                        </span>
                        {lead.next_follow_up && (
                          <Calendar className="w-3 h-3 text-brand-blue" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {stageLeads.length === 0 && (
                    <p className="text-center text-text-4 text-xs py-4 font-manrope">No leads</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {showAddModal && (
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
                <h2 className="font-syne font-800 text-xl text-text-1">Add New Lead</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-brand-offwhite rounded-lg">
                  <X className="w-5 h-5 text-text-3" />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div>
                  <label className="font-manrope text-sm text-text-2 mb-1 block">Name *</label>
                  <input
                    {...register('name')}
                    className="w-full px-4 py-2 border border-brand-border rounded-lg focus:outline-none focus:border-brand-blue"
                  />
                  {errors.name && <p className="text-brand-red text-xs mt-1">{String(errors.name.message)}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-manrope text-sm text-text-2 mb-1 block">Email</label>
                    <input
                      type="email"
                      {...register('email')}
                      className="w-full px-4 py-2 border border-brand-border rounded-lg focus:outline-none focus:border-brand-blue"
                    />
                    {errors.email && <p className="text-brand-red text-xs mt-1">{String(errors.email.message)}</p>}
                  </div>
                  <div>
                    <label className="font-manrope text-sm text-text-2 mb-1 block">Phone</label>
                    <input
                      {...register('phone')}
                      className="w-full px-4 py-2 border border-brand-border rounded-lg focus:outline-none focus:border-brand-blue"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-manrope text-sm text-text-2 mb-1 block">Company</label>
                  <input
                    {...register('company')}
                    className="w-full px-4 py-2 border border-brand-border rounded-lg focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="font-manrope text-sm text-text-2 mb-1 block">Source *</label>
                  <select
                    {...register('source')}
                    className="w-full px-4 py-2 border border-brand-border rounded-lg focus:outline-none focus:border-brand-blue"
                  >
                    <option value="">Select source</option>
                    {SOURCES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.source && <p className="text-brand-red text-xs mt-1">{String(errors.source.message)}</p>}
                </div>
                <div>
                  <label className="font-manrope text-sm text-text-2 mb-1 block">Initial Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    {...register('score', { valueAsNumber: true })}
                    className="w-full px-4 py-2 border border-brand-border rounded-lg focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-brand-border rounded-lg font-manrope text-text-3 hover:bg-brand-offwhite"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-brand-blue text-white font-syne font-700 rounded-lg hover:bg-brand-blue/90 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Lead'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {editingLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-auto"
            >
              <div className="p-6 border-b border-brand-border flex items-center justify-between">
                <h2 className="font-syne font-800 text-xl text-text-1">Edit Lead</h2>
                <button onClick={() => setEditingLead(null)} className="p-2 hover:bg-brand-offwhite rounded-lg">
                  <X className="w-5 h-5 text-text-3" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="font-manrope text-sm text-text-2 mb-1 block">Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PIPELINE_STAGES.map(stage => (
                      <button
                        key={stage.id}
                        onClick={() => {
                          updateLead(editingLead.id, { status: stage.id })
                          setEditingLead({ ...editingLead, status: stage.id })
                        }}
                        className={cn(
                          'px-3 py-2 rounded-lg text-xs font-manrope font-600 capitalize',
                          editingLead.status === stage.id
                            ? 'bg-brand-blue text-white'
                            : 'border border-brand-border text-text-3 hover:border-brand-blue'
                        )}
                      >
                        {stage.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="font-manrope text-sm text-text-2 mb-1 block">Score ({editingLead.score})</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editingLead.score}
                    onChange={(e) => {
                      const score = parseInt(e.target.value)
                      updateLead(editingLead.id, { score })
                      setEditingLead({ ...editingLead, score })
                    }}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="font-manrope text-sm text-text-2 mb-1 block">Assigned To</label>
                  <select
                    value={editingLead.assigned_to || ''}
                    onChange={(e) => {
                      updateLead(editingLead.id, { assigned_to: e.target.value || null })
                      setEditingLead({ ...editingLead, assigned_to: e.target.value || null })
                    }}
                    className="w-full px-4 py-2 border border-brand-border rounded-lg focus:outline-none focus:border-brand-blue"
                  >
                    <option value="">Unassigned</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-manrope text-sm text-text-2 mb-1 block">Next Follow-up</label>
                  <input
                    type="datetime-local"
                    value={editingLead.next_follow_up?.slice(0, 16) || ''}
                    onChange={(e) => {
                      updateLead(editingLead.id, { next_follow_up: e.target.value || null })
                      setEditingLead({ ...editingLead, next_follow_up: e.target.value || null })
                    }}
                    className="w-full px-4 py-2 border border-brand-border rounded-lg focus:outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="font-manrope text-sm text-text-2 mb-1 block">Notes</label>
                  <textarea
                    rows={4}
                    value={editingLead.notes || ''}
                    onChange={(e) => {
                      updateLead(editingLead.id, { notes: e.target.value || null })
                      setEditingLead({ ...editingLead, notes: e.target.value || null })
                    }}
                    className="w-full px-4 py-2 border border-brand-border rounded-lg focus:outline-none focus:border-brand-blue"
                    placeholder="Add notes about this lead..."
                  />
                </div>
                <div className="flex justify-between pt-4 border-t border-brand-border">
                  <button
                    onClick={() => deleteLead(editingLead.id)}
                    className="px-4 py-2 text-brand-red font-manrope hover:bg-brand-red/10 rounded-lg"
                  >
                    Delete Lead
                  </button>
                  <button
                    onClick={() => setEditingLead(null)}
                    className="px-4 py-2 bg-brand-blue text-white font-syne font-700 rounded-lg hover:bg-brand-blue/90"
                  >
                    Done
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
