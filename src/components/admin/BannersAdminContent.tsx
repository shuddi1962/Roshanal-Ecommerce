'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Image,
  Plus,
  Search,
  MoreHorizontal,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  X,
  Upload,
  Link,
  Calendar,
  Clock,
  MousePointerClick,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Banner {
  id: string
  title: string
  image_url: string
  link_url: string
  position: 'homepage_hero' | 'shop_banner' | 'popup' | 'sidebar'
  sizes: string
  sort_order: number
  is_active: boolean
  starts_at?: string
  ends_at?: string
  popup_trigger?: 'exit_intent' | 'after_5s' | 'after_30s_scroll' | 'once_per_session'
  created_at: string
}

const positionLabels: Record<string, string> = {
  homepage_hero: 'Homepage Hero',
  shop_banner: 'Shop Banner',
  popup: 'Popup',
  sidebar: 'Sidebar',
}

const triggerLabels: Record<string, string> = {
  exit_intent: 'Exit Intent',
  after_5s: 'After 5 Seconds',
  after_30s_scroll: 'After 30% Scroll',
  once_per_session: 'Once Per Session',
}

export default function BannersAdminContent() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [positionFilter, setPositionFilter] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<'hero' | 'popup'>('hero')
  const [draggedItem, setDraggedItem] = useState<Banner | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    link_url: '',
    position: 'homepage_hero' as Banner['position'],
    sort_order: 0,
    is_active: true,
    starts_at: '',
    ends_at: '',
    popup_trigger: 'once_per_session' as Banner['popup_trigger'],
  })

  useEffect(() => {
    fetchBanners()
  }, [positionFilter])

  const fetchBanners = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (positionFilter) params.append('position', positionFilter)

      const response = await fetch(`/api/admin/banners?${params}`)
      if (!response.ok) throw new Error('Failed to fetch banners')

      const data = await response.json()
      setBanners(data.banners)
    } catch (error) {
      toast.error('Failed to load banners')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      if (!response.ok) throw new Error('Failed to upload image')

      const data = await response.json()
      setFormData((prev) => ({ ...prev, image_url: data.url }))
      toast.success('Image uploaded')
    } catch (error) {
      toast.error('Failed to upload image')
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleCreateBanner = async () => {
    try {
      const response = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to create banner')

      toast.success('Banner created successfully')
      setIsModalOpen(false)
      resetForm()
      fetchBanners()
    } catch (error) {
      toast.error('Failed to create banner')
      console.error(error)
    }
  }

  const handleUpdateBanner = async () => {
    if (!editingBanner) return

    try {
      const response = await fetch(`/api/admin/banners/${editingBanner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to update banner')

      toast.success('Banner updated')
      setIsModalOpen(false)
      setEditingBanner(null)
      resetForm()
      fetchBanners()
    } catch (error) {
      toast.error('Failed to update banner')
      console.error(error)
    }
  }

  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return

    try {
      const response = await fetch(`/api/admin/banners/${bannerId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete banner')

      toast.success('Banner deleted')
      fetchBanners()
    } catch (error) {
      toast.error('Failed to delete banner')
      console.error(error)
    }
  }

  const handleToggleActive = async (banner: Banner) => {
    try {
      const response = await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !banner.is_active }),
      })

      if (!response.ok) throw new Error('Failed to update banner')

      toast.success(banner.is_active ? 'Banner deactivated' : 'Banner activated')
      fetchBanners()
    } catch (error) {
      toast.error('Failed to update banner')
      console.error(error)
    }
  }

  const handleReorder = async (draggedId: string, targetId: string) => {
    const draggedIndex = banners.findIndex((b) => b.id === draggedId)
    const targetIndex = banners.findIndex((b) => b.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newBanners = [...banners]
    const [removed] = newBanners.splice(draggedIndex, 1)
    newBanners.splice(targetIndex, 0, removed)

    const updates = newBanners.map((banner, index) => ({
      id: banner.id,
      sort_order: index,
    }))

    setBanners(newBanners)

    try {
      await Promise.all(
        updates.map((update) =>
          fetch(`/api/admin/banners/${update.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sort_order: update.sort_order }),
          })
        )
      )
    } catch (error) {
      toast.error('Failed to save order')
      console.error(error)
      fetchBanners()
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      image_url: '',
      link_url: '',
      position: 'homepage_hero',
      sort_order: 0,
      is_active: true,
      starts_at: '',
      ends_at: '',
      popup_trigger: 'once_per_session',
    })
  }

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title,
      image_url: banner.image_url,
      link_url: banner.link_url,
      position: banner.position,
      sort_order: banner.sort_order,
      is_active: banner.is_active,
      starts_at: banner.starts_at ? banner.starts_at.slice(0, 16) : '',
      ends_at: banner.ends_at ? banner.ends_at.slice(0, 16) : '',
      popup_trigger: banner.popup_trigger || 'once_per_session',
    })
    setIsModalOpen(true)
  }

  const filteredBanners = banners.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (activeTab === 'hero' ? b.position !== 'popup' : b.position === 'popup')
  )

  const heroBanners = banners.filter((b) => b.position !== 'popup')
  const popupBanners = banners.filter((b) => b.position === 'popup')

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="font-syne font-700 text-3xl text-text-1">Banners & Popups</h1>
          <p className="font-manrope text-text-3 mt-1">Manage hero banners and promotional popups</p>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('hero')}
            className={`px-4 py-2 rounded-lg font-syne font-700 text-sm transition-colors ${
              activeTab === 'hero'
                ? 'bg-brand-navy text-white'
                : 'bg-white text-text-2 hover:bg-brand-offwhite border border-brand-border'
            }`}
          >
            Hero Banners ({heroBanners.length})
          </button>
          <button
            onClick={() => setActiveTab('popup')}
            className={`px-4 py-2 rounded-lg font-syne font-700 text-sm transition-colors ${
              activeTab === 'popup'
                ? 'bg-brand-navy text-white'
                : 'bg-white text-text-2 hover:bg-brand-offwhite border border-brand-border'
            }`}
          >
            Popups ({popupBanners.length})
          </button>
        </div>

        <div className="bg-white rounded-lg border border-brand-border overflow-hidden">
          <div className="p-4 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
                <input
                  type="text"
                  placeholder="Search banners..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-brand-offwhite border border-brand-border rounded-lg font-manrope text-sm text-text-1 placeholder:text-text-4 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
              </div>
            </div>
            <button
              onClick={() => {
                setEditingBanner(null)
                resetForm()
                setFormData((prev) => ({
                  ...prev,
                  position: activeTab === 'popup' ? 'popup' : 'homepage_hero',
                }))
                setIsModalOpen(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-brand-navy text-white rounded-lg font-syne font-700 text-sm hover:bg-text-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create {activeTab === 'popup' ? 'Popup' : 'Banner'}
            </button>
          </div>

          {isLoading ? (
            <div className="p-12 text-center font-manrope text-text-3">Loading...</div>
          ) : filteredBanners.length === 0 ? (
            <div className="p-12 text-center">
              <Image className="w-12 h-12 text-text-4 mx-auto mb-4" />
              <p className="font-syne font-700 text-text-1 mb-1">
                No {activeTab === 'popup' ? 'popups' : 'banners'} yet
              </p>
              <p className="font-manrope text-text-3">
                Create your first {activeTab === 'popup' ? 'popup' : 'banner'} to get started
              </p>
            </div>
          ) : activeTab === 'hero' ? (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBanners.map((banner, index) => (
                <div
                  key={banner.id}
                  draggable
                  onDragStart={() => setDraggedItem(banner)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (draggedItem && draggedItem.id !== banner.id) {
                      handleReorder(draggedItem.id, banner.id)
                    }
                    setDraggedItem(null)
                  }}
                  className={`border border-brand-border rounded-lg overflow-hidden bg-white group ${
                    draggedItem?.id === banner.id ? 'opacity-50' : ''
                  }`}
                >
                  <div className="relative aspect-[16/9] bg-brand-offwhite overflow-hidden">
                    {banner.image_url ? (
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Image className="w-12 h-12 text-text-4" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-syne font-700 ${
                          banner.is_active
                            ? 'bg-success/20 text-success'
                            : 'bg-text-4/20 text-text-3'
                        }`}
                      >
                        {banner.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-brand-navy/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(banner)}
                        className="p-2 bg-white rounded-lg text-brand-navy hover:bg-brand-offwhite transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(banner)}
                        className="p-2 bg-white rounded-lg text-brand-navy hover:bg-brand-offwhite transition-colors"
                      >
                        {banner.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="p-2 bg-brand-red text-white rounded-lg hover:bg-brand-red/80 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-syne font-700 text-sm text-text-1 line-clamp-1">{banner.title}</p>
                        <p className="font-manrope text-xs text-text-3">{positionLabels[banner.position]}</p>
                      </div>
                      <GripVertical className="w-4 h-4 text-text-4 cursor-grab" />
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-text-3">
                      <Link className="w-3 h-3" />
                      <span className="truncate font-mono">{banner.link_url}</span>
                    </div>
                    {(banner.starts_at || banner.ends_at) && (
                      <div className="flex items-center gap-2 mt-1 text-xs text-text-3">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {banner.starts_at ? new Date(banner.starts_at).toLocaleDateString() : 'Now'} -
                          {banner.ends_at ? new Date(banner.ends_at).toLocaleDateString() : 'Forever'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-brand-offwhite">
                  <tr>
                    <th className="px-4 py-3 text-left font-syne font-700 text-xs text-text-2 uppercase tracking-wider">Popup</th>
                    <th className="px-4 py-3 text-left font-syne font-700 text-xs text-text-2 uppercase tracking-wider">Trigger</th>
                    <th className="px-4 py-3 text-left font-syne font-700 text-xs text-text-2 uppercase tracking-wider">Schedule</th>
                    <th className="px-4 py-3 text-left font-syne font-700 text-xs text-text-2 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right font-syne font-700 text-xs text-text-2 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {filteredBanners.map((banner) => (
                    <tr key={banner.id} className="hover:bg-brand-offwhite/50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-brand-offwhite overflow-hidden">
                            {banner.image_url ? (
                              <img src={banner.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Image className="w-6 h-6 text-text-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-syne font-700 text-sm text-text-1">{banner.title}</p>
                            <a
                              href={banner.link_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-xs text-brand-blue hover:underline flex items-center gap-1"
                            >
                              {banner.link_url.slice(0, 30)}...
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <MousePointerClick className="w-4 h-4 text-text-4" />
                          <span className="font-manrope text-sm text-text-2">
                            {banner.popup_trigger ? triggerLabels[banner.popup_trigger] : 'Manual'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-text-4" />
                          <span className="font-manrope text-sm text-text-2">
                            {banner.starts_at || banner.ends_at
                              ? `${banner.starts_at ? new Date(banner.starts_at).toLocaleDateString() : 'Now'} - ${
                                  banner.ends_at ? new Date(banner.ends_at).toLocaleDateString() : '∞'
                                }`
                              : 'Always active'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleToggleActive(banner)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-syne font-700 transition-colors ${
                            banner.is_active
                              ? 'bg-success/20 text-success'
                              : 'bg-text-4/20 text-text-3'
                          }`}
                        >
                          {banner.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {banner.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(banner)}
                            className="p-2 hover:bg-brand-blue/10 rounded-lg text-brand-blue transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBanner(banner.id)}
                            className="p-2 hover:bg-brand-red/10 rounded-lg text-brand-red transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-brand-navy/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-brand-border flex items-center justify-between">
              <h2 className="font-syne font-700 text-lg text-text-1">
                {editingBanner ? 'Edit Banner' : 'Create Banner'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingBanner(null)
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
                  <label className="block font-syne font-700 text-sm text-text-2 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-brand-offwhite border border-brand-border rounded-lg font-manrope text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    placeholder="Summer Sale 2024"
                  />
                </div>

                <div>
                  <label className="block font-syne font-700 text-sm text-text-2 mb-1">Image</label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        className="w-full px-4 py-2 bg-brand-offwhite border border-brand-border rounded-lg font-manrope text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                        placeholder="https://..."
                      />
                    </div>
                    <label className="flex items-center gap-2 px-4 py-2 bg-brand-offwhite border border-brand-border rounded-lg cursor-pointer hover:bg-brand-border transition-colors">
                      <Upload className="w-4 h-4 text-text-3" />
                      <span className="font-manrope text-sm text-text-2">{isUploading ? '...' : 'Upload'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                    </label>
                  </div>
                  {formData.image_url && (
                    <div className="mt-2 aspect-video bg-brand-offwhite rounded-lg overflow-hidden">
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-syne font-700 text-sm text-text-2 mb-1">Link URL</label>
                  <input
                    type="url"
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    className="w-full px-4 py-2 bg-brand-offwhite border border-brand-border rounded-lg font-manrope text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    placeholder="/shop/sale"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-syne font-700 text-sm text-text-2 mb-1">Position</label>
                    <div className="relative">
                      <select
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value as Banner['position'] })}
                        className="appearance-none w-full px-4 py-2 bg-brand-offwhite border border-brand-border rounded-lg font-manrope text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      >
                        <option value="homepage_hero">Homepage Hero</option>
                        <option value="shop_banner">Shop Banner</option>
                        <option value="popup">Popup</option>
                        <option value="sidebar">Sidebar</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block font-syne font-700 text-sm text-text-2 mb-1">Status</label>
                    <div className="relative">
                      <select
                        value={formData.is_active ? 'active' : 'inactive'}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                        className="appearance-none w-full px-4 py-2 bg-brand-offwhite border border-brand-border rounded-lg font-manrope text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {formData.position === 'popup' && (
                  <div>
                    <label className="block font-syne font-700 text-sm text-text-2 mb-1">Trigger</label>
                    <div className="relative">
                      <select
                        value={formData.popup_trigger}
                        onChange={(e) => setFormData({ ...formData, popup_trigger: e.target.value as Banner['popup_trigger'] })}
                        className="appearance-none w-full px-4 py-2 bg-brand-offwhite border border-brand-border rounded-lg font-manrope text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      >
                        <option value="exit_intent">Exit Intent</option>
                        <option value="after_5s">After 5 Seconds</option>
                        <option value="after_30s_scroll">After 30% Scroll</option>
                        <option value="once_per_session">Once Per Session</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4 pointer-events-none" />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-syne font-700 text-sm text-text-2 mb-1">Start Date</label>
                    <input
                      type="datetime-local"
                      value={formData.starts_at}
                      onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                      className="w-full px-4 py-2 bg-brand-offwhite border border-brand-border rounded-lg font-manrope text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                  <div>
                    <label className="block font-syne font-700 text-sm text-text-2 mb-1">End Date</label>
                    <input
                      type="datetime-local"
                      value={formData.ends_at}
                      onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                      className="w-full px-4 py-2 bg-brand-offwhite border border-brand-border rounded-lg font-manrope text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-brand-border flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingBanner(null)
                  resetForm()
                }}
                className="px-4 py-2 font-syne font-700 text-sm text-text-3 hover:text-text-1 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingBanner ? handleUpdateBanner : handleCreateBanner}
                className="px-6 py-2 bg-brand-navy text-white rounded-lg font-syne font-700 text-sm hover:bg-text-2 transition-colors"
              >
                {editingBanner ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
