'use client'

import React, { useState, useEffect } from 'react'
import {
  Mail,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit3,
  Copy,
  Eye,
  Send,
  Calendar,
  Clock,
  Users,
  BarChart3,
  X,
  ChevronDown,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface Campaign {
  id: string
  name: string
  subject: string
  preview_text?: string
  from_name: string
  from_email: string
  template: 'welcome' | 'abandoned_cart' | 'reorder_reminder' | 'new_product' | 'seasonal_sale'
  audience: 'all_customers' | 'active_30d' | 'cart_abandoners' | 'VIP' | 'newsletter_only'
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused'
  scheduled_at?: string
  sent_at?: string
  recipients_count: number
  open_rate?: number
  click_rate?: number
  created_at: string
}

interface CampaignStats {
  total: number
  active: number
  scheduled: number
  sent: number
  avgOpenRate: number
  avgClickRate: number
}

const statusConfig = {
  draft: { label: 'Draft', className: 'bg-text-4/20 text-text-3' },
  scheduled: { label: 'Scheduled', className: 'bg-brand-blue/20 text-brand-blue' },
  sending: { label: 'Sending', className: 'bg-warning/20 text-warning' },
  sent: { label: 'Sent', className: 'bg-success/20 text-success' },
  paused: { label: 'Paused', className: 'bg-brand-red/20 text-brand-red' },
}

const templateOptions = [
  { value: 'welcome', label: 'Welcome Email' },
  { value: 'abandoned_cart', label: 'Abandoned Cart' },
  { value: 'reorder_reminder', label: 'Reorder Reminder' },
  { value: 'new_product', label: 'New Product' },
  { value: 'seasonal_sale', label: 'Seasonal Sale' },
]

const audienceOptions = [
  { value: 'all_customers', label: 'All Customers' },
  { value: 'active_30d', label: 'Active (30 days)' },
  { value: 'cart_abandoners', label: 'Cart Abandoners' },
  { value: 'VIP', label: 'VIP Customers' },
  { value: 'newsletter_only', label: 'Newsletter Only' },
]

export default function EmailCampaignsContent() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [stats, setStats] = useState<CampaignStats>({
    total: 0,
    active: 0,
    scheduled: 0,
    sent: 0,
    avgOpenRate: 0,
    avgClickRate: 0,
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [performanceData, setPerformanceData] = useState<Array<{ date: string; openRate: number; clickRate: number }>>([])

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    preview_text: '',
    from_name: '',
    from_email: '',
    template: 'welcome' as Campaign['template'],
    audience: 'all_customers' as Campaign['audience'],
    scheduled_at: '',
    send_now: true,
  })

  useEffect(() => {
    fetchCampaigns()
  }, [statusFilter])

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)

      const response = await fetch(`/api/admin/email-campaigns?${params}`)
      if (!response.ok) throw new Error('Failed to fetch campaigns')

      const data = await response.json()
      setCampaigns(data.campaigns)

      const total = data.campaigns.length
      const active = data.campaigns.filter((c: Campaign) => c.status === 'sending').length
      const scheduled = data.campaigns.filter((c: Campaign) => c.status === 'scheduled').length
      const sent = data.campaigns.filter((c: Campaign) => c.status === 'sent').length

      const sentCampaigns = data.campaigns.filter((c: Campaign) => c.status === 'sent' && c.open_rate)
      const avgOpenRate = sentCampaigns.length
        ? sentCampaigns.reduce((sum: number, c: Campaign) => sum + (c.open_rate || 0), 0) / sentCampaigns.length
        : 0
      const avgClickRate = sentCampaigns.length
        ? sentCampaigns.reduce((sum: number, c: Campaign) => sum + (c.click_rate || 0), 0) / sentCampaigns.length
        : 0

      setStats({
        total,
        active,
        scheduled,
        sent,
        avgOpenRate: Math.round(avgOpenRate * 100) / 100,
        avgClickRate: Math.round(avgClickRate * 100) / 100,
      })

      const chartData = data.campaigns
        .filter((c: Campaign) => c.sent_at)
        .slice(0, 10)
        .map((c: Campaign) => ({
          date: new Date(c.sent_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          openRate: Math.round((c.open_rate || 0) * 100),
          clickRate: Math.round((c.click_rate || 0) * 100),
        }))
        .reverse()

      setPerformanceData(chartData)
    } catch (error) {
      toast.error('Failed to load campaigns')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCampaign = async () => {
    try {
      const payload = {
        ...formData,
        status: formData.send_now ? 'sending' : formData.scheduled_at ? 'scheduled' : 'draft',
      }

      const response = await fetch('/api/admin/email-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Failed to create campaign')

      toast.success(formData.send_now ? 'Campaign sent!' : 'Campaign saved as draft')
      setIsModalOpen(false)
      resetForm()
      fetchCampaigns()
    } catch (error) {
      toast.error('Failed to create campaign')
      console.error(error)
    }
  }

  const handleUpdateCampaign = async () => {
    if (!editingCampaign) return

    try {
      const response = await fetch(`/api/admin/email-campaigns/${editingCampaign.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to update campaign')

      toast.success('Campaign updated')
      setIsModalOpen(false)
      setEditingCampaign(null)
      resetForm()
      fetchCampaigns()
    } catch (error) {
      toast.error('Failed to update campaign')
      console.error(error)
    }
  }

  const handleDuplicate = async (campaign: Campaign) => {
    try {
      const payload = {
        name: `${campaign.name} (Copy)`,
        subject: campaign.subject,
        preview_text: campaign.preview_text,
        from_name: campaign.from_name,
        from_email: campaign.from_email,
        template: campaign.template,
        audience: campaign.audience,
        status: 'draft',
      }

      const response = await fetch('/api/admin/email-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Failed to duplicate campaign')

      toast.success('Campaign duplicated')
      fetchCampaigns()
    } catch (error) {
      toast.error('Failed to duplicate campaign')
      console.error(error)
    }
  }

  const handleSendNow = async (campaign: Campaign) => {
    try {
      const response = await fetch(`/api/admin/email-campaigns/${campaign.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'sending' }),
      })

      if (!response.ok) throw new Error('Failed to send campaign')

      toast.success('Campaign is being sent')
      fetchCampaigns()
    } catch (error) {
      toast.error('Failed to send campaign')
      console.error(error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      preview_text: '',
      from_name: '',
      from_email: '',
      template: 'welcome',
      audience: 'all_customers',
      scheduled_at: '',
      send_now: true,
    })
  }

  const openEditModal = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setFormData({
      name: campaign.name,
      subject: campaign.subject,
      preview_text: campaign.preview_text || '',
      from_name: campaign.from_name,
      from_email: campaign.from_email,
      template: campaign.template,
      audience: campaign.audience,
      scheduled_at: campaign.scheduled_at || '',
      send_now: false,
    })
    setIsModalOpen(true)
  }

  const filteredCampaigns = campaigns.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="font-syne font-700 text-3xl text-text-1">Email Campaigns</h1>
          <p className="font-manrope text-text-3 mt-1">Manage your email marketing campaigns</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border border-brand-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-navy/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-brand-navy" />
              </div>
              <div>
                <p className="font-manrope text-text-4 text-sm">Total</p>
                <p className="font-syne font-700 text-xl text-text-1">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-brand-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Send className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="font-manrope text-text-4 text-sm">Active</p>
                <p className="font-syne font-700 text-xl text-text-1">{stats.active}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-brand-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-brand-blue" />
              </div>
              <div>
                <p className="font-manrope text-text-4 text-sm">Scheduled</p>
                <p className="font-syne font-700 text-xl text-text-1">{stats.scheduled}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-brand-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="font-manrope text-text-4 text-sm">Sent</p>
                <p className="font-syne font-700 text-xl text-text-1">{stats.sent}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-brand-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-brand-blue" />
              </div>
              <div>
                <p className="font-manrope text-text-4 text-sm">Avg Open</p>
                <p className="font-syne font-700 text-xl text-text-1">{stats.avgOpenRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-brand-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-brand-blue" />
              </div>
              <div>
                <p className="font-manrope text-text-4 text-sm">Avg Click</p>
                <p className="font-syne font-700 text-xl text-text-1">{stats.avgClickRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {performanceData.length > 0 && (
          <div className="bg-white rounded-lg p-6 border border-brand-border mb-8">
            <h2 className="font-syne font-700 text-lg text-text-1 mb-4">Performance Overview</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EBF6" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#4A5270' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#4A5270' }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0C1A36', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#F3F5FB' }}
                    itemStyle={{ color: '#F3F5FB' }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [`${value}%`, '']}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="openRate" name="Open Rate" stroke="#1641C4" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="clickRate" name="Click Rate" stroke="#0B6B3A" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg border border-brand-border overflow-hidden">
          <div className="p-4 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-brand-offwhite border border-brand-border rounded-lg font-manrope text-sm text-text-1 placeholder:text-text-4 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 bg-brand-offwhite border border-brand-border rounded-lg font-manrope text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                >
                  <option value="">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="sending">Sending</option>
                  <option value="sent">Sent</option>
                  <option value="paused">Paused</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4 pointer-events-none" />
              </div>
            </div>
            <button
              onClick={() => {
                setEditingCampaign(null)
                resetForm()
                setIsModalOpen(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-brand-navy text-white rounded-lg font-syne font-700 text-sm hover:bg-text-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Campaign
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-brand-offwhite">
                <tr>
                  <th className="px-4 py-3 text-left font-syne font-700 text-xs text-text-2 uppercase tracking-wider">Campaign</th>
                  <th className="px-4 py-3 text-left font-syne font-700 text-xs text-text-2 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left font-syne font-700 text-xs text-text-2 uppercase tracking-wider">Recipients</th>
                  <th className="px-4 py-3 text-left font-syne font-700 text-xs text-text-2 uppercase tracking-wider">Open Rate</th>
                  <th className="px-4 py-3 text-left font-syne font-700 text-xs text-text-2 uppercase tracking-wider">Click Rate</th>
                  <th className="px-4 py-3 text-left font-syne font-700 text-xs text-text-2 uppercase tracking-wider">Sent Date</th>
                  <th className="px-4 py-3 text-right font-syne font-700 text-xs text-text-2 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center font-manrope text-text-3">
                      Loading campaigns...
                    </td>
                  </tr>
                ) : filteredCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center font-manrope text-text-3">
                      No campaigns found
                    </td>
                  </tr>
                ) : (
                  filteredCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-brand-offwhite/50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-syne font-700 text-sm text-text-1">{campaign.name}</p>
                          <p className="font-manrope text-xs text-text-3">{campaign.subject}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-syne font-700 ${statusConfig[campaign.status].className}`}>
                          {statusConfig[campaign.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 font-manrope text-sm text-text-2">
                          <Users className="w-4 h-4 text-text-4" />
                          {campaign.recipients_count.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-4 font-manrope text-sm text-text-2">
                        {campaign.open_rate ? `${(campaign.open_rate * 100).toFixed(1)}%` : '-'}
                      </td>
                      <td className="px-4 py-4 font-manrope text-sm text-text-2">
                        {campaign.click_rate ? `${(campaign.click_rate * 100).toFixed(1)}%` : '-'}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 font-manrope text-sm text-text-2">
                          <Clock className="w-4 h-4 text-text-4" />
                          {campaign.sent_at
                            ? new Date(campaign.sent_at).toLocaleDateString()
                            : campaign.scheduled_at
                            ? new Date(campaign.scheduled_at).toLocaleDateString()
                            : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {campaign.status === 'draft' && (
                            <button
                              onClick={() => handleSendNow(campaign)}
                              className="p-2 hover:bg-success/10 rounded-lg text-success transition-colors"
                              title="Send Now"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(campaign)}
                            className="p-2 hover:bg-brand-blue/10 rounded-lg text-brand-blue transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(campaign)}
                            className="p-2 hover:bg-brand-offwhite rounded-lg text-text-3 transition-colors"
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-brand-navy/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-brand-border flex items-center justify-between">
              <h2 className="font-syne font-700 text-lg text-text-1">
                {editingCampaign ? 'Edit Campaign' : 'Create Campaign'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingCampaign(null)
                  resetForm()
                }}
                className="p-2 hover:bg-brand-offwhite rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-text-3" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-4">
                <div>
                  <label className="block font-syne font-700 text-sm text-text-2 mb-1">Campaign Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-brand-offwhite border border-brand-border rounded-lg font-manrope text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    placeholder="Summer Sale 2024"
                  />
                </div>

                <div>
                  <label className="block font-syne font-700 text-sm text-text-2 mb-1">Subject Line</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2 bg-brand-offwhite border border-brand-border rounded-lg font-manrope text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    placeholder="Don't miss our biggest sale!"
                  />
                </div>

                <div>
                  <label className="block font-syne font-700 text-sm text-text-2 mb-1">Preview Text</label>
                  <input
                    type="text"
                    value={formData.preview_text}
                    onChange={(e) => setFormData({ ...formData, preview_text: e.target.value })}
                    className="w-full px-4 py-2 bg-brand-offwhite border border-brand-border rounded-lg font-manrope text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    placeholder="Up to 50% off selected items..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-syne font-700 text-sm text-text-2 mb-1">From Name</label>
                    <input
                      type="text"
                      value={formData.from_name}
                      onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
                      className="w-full px-4 py-2 bg-brand-offwhite border border-brand-border rounded-lg font-manrope text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      placeholder="Roshanal Store"
                    />
                  </div>
                  <div>
                    <label className="block font-syne font-700 text-sm text-text-2 mb-1">From Email</label>
                    <input
                      type="email"
                      value={formData.from_email}
                      onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
                      className="w-full px-4 py-2 bg-brand-offwhite border border-brand-border rounded-lg font-manrope text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      placeholder="hello@roshanal.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-syne font-700 text-sm text-text-2 mb-1">Template</label>
                    <div className="relative">
                      <select
                        value={formData.template}
                        onChange={(e) => setFormData({ ...formData, template: e.target.value as Campaign['template'] })}
                        className="appearance-none w-full px-4 py-2 bg-brand-offwhite border border-brand-border rounded-lg font-manrope text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      >
                        {templateOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block font-syne font-700 text-sm text-text-2 mb-1">Audience</label>
                    <div className="relative">
                      <select
                        value={formData.audience}
                        onChange={(e) => setFormData({ ...formData, audience: e.target.value as Campaign['audience'] })}
                        className="appearance-none w-full px-4 py-2 bg-brand-offwhite border border-brand-border rounded-lg font-manrope text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      >
                        {audienceOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {!editingCampaign && (
                  <div className="space-y-3 pt-4 border-t border-brand-border">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.send_now}
                        onChange={() => setFormData({ ...formData, send_now: true, scheduled_at: '' })}
                        className="w-4 h-4 text-brand-blue"
                      />
                      <span className="font-manrope text-sm text-text-2">Send immediately</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        checked={!formData.send_now && !formData.scheduled_at}
                        onChange={() => setFormData({ ...formData, send_now: false, scheduled_at: '' })}
                        className="w-4 h-4 text-brand-blue"
                      />
                      <span className="font-manrope text-sm text-text-2">Save as draft</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        checked={!!formData.scheduled_at}
                        onChange={() => setFormData({ ...formData, send_now: false, scheduled_at: new Date().toISOString().slice(0, 16) })}
                        className="w-4 h-4 text-brand-blue"
                      />
                      <span className="font-manrope text-sm text-text-2">Schedule for later</span>
                    </label>

                    {!!formData.scheduled_at && (
                      <input
                        type="datetime-local"
                        value={formData.scheduled_at}
                        onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                        className="w-full px-4 py-2 bg-brand-offwhite border border-brand-border rounded-lg font-manrope text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-brand-border flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingCampaign(null)
                  resetForm()
                }}
                className="px-4 py-2 font-syne font-700 text-sm text-text-3 hover:text-text-1 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingCampaign ? handleUpdateCampaign : handleCreateCampaign}
                className="px-6 py-2 bg-brand-navy text-white rounded-lg font-syne font-700 text-sm hover:bg-text-2 transition-colors"
              >
                {editingCampaign ? 'Update' : formData.send_now ? 'Send Campaign' : 'Save as Draft'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
