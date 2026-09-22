'use client'

import React, { useState, useEffect } from 'react'
import {
  Search,
  Globe,
  FileCode,
  Settings,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  Copy,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface IndexingUrl {
  id: string
  url: string
  submitted_at: string
  google_status: 'indexed' | 'pending' | 'error' | 'not_submitted'
  bing_status: 'indexed' | 'pending' | 'error' | 'not_submitted'
}

interface SitemapInfo {
  last_generated: string
  url_count: number
  url: string
}

interface SchemaSettings {
  product: boolean
  organization: boolean
  faq: boolean
  review: boolean
  breadcrumb: boolean
}

interface SEOMetaPreview {
  title: string
  description: string
  url: string
}

export default function SEOAdminContent() {
  const [urls, setUrls] = useState<IndexingUrl[]>([])
  const [sitemap, setSitemap] = useState<SitemapInfo>({
    last_generated: '',
    url_count: 0,
    url: '/sitemap.xml',
  })
  const [schemaSettings, setSchemaSettings] = useState<SchemaSettings>({
    product: true,
    organization: true,
    faq: false,
    review: true,
    breadcrumb: true,
  })
  const [previewUrl, setPreviewUrl] = useState('')
  const [metaPreview, setMetaPreview] = useState<SEOMetaPreview | null>(null)
  const [newUrl, setNewUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  const stats = {
    indexed: urls.filter((u) => u.google_status === 'indexed' || u.bing_status === 'indexed').length,
    pending: urls.filter((u) => u.google_status === 'pending' || u.bing_status === 'pending').length,
    sitemapUrls: sitemap.url_count,
    schemaActive: Object.values(schemaSettings).filter(Boolean).length,
  }

  useEffect(() => {
    fetchSEOData()
  }, [])

  const fetchSEOData = async () => {
    try {
      setIsLoading(true)

      const [indexingRes, sitemapRes, schemaRes] = await Promise.all([
        fetch('/api/indexing/status').catch(() => null),
        fetch('/api/sitemap/info').catch(() => null),
        fetch('/api/admin/seo/schema').catch(() => null),
      ])

      if (indexingRes?.ok) {
        const indexingData = await indexingRes.json()
        setUrls(indexingData.urls || [])
      }

      if (sitemapRes?.ok) {
        const sitemapData = await sitemapRes.json()
        setSitemap(sitemapData)
      }

      if (schemaRes?.ok) {
        const schemaData = await schemaRes.json()
        setSchemaSettings(schemaData.settings)
      }
    } catch (error) {
      toast.error('Failed to load SEO data')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResubmitGoogle = async (urlId: string) => {
    try {
      const response = await fetch('/api/indexing/google', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url_id: urlId }),
      })

      if (!response.ok) throw new Error('Failed to resubmit')

      toast.success('Submitted to Google')
      fetchSEOData()
    } catch (error) {
      toast.error('Failed to resubmit to Google')
      console.error(error)
    }
  }

  const handleResubmitBing = async (urlId: string) => {
    try {
      const response = await fetch('/api/indexing/bing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url_id: urlId }),
      })

      if (!response.ok) throw new Error('Failed to resubmit')

      toast.success('Submitted to Bing')
      fetchSEOData()
    } catch (error) {
      toast.error('Failed to resubmit to Bing')
      console.error(error)
    }
  }

  const handleGenerateSitemap = async () => {
    try {
      setIsGenerating(true)
      const response = await fetch('/api/sitemap/generate', { method: 'POST' })

      if (!response.ok) throw new Error('Failed to generate sitemap')

      const data = await response.json()
      setSitemap((prev) => ({
        ...prev,
        last_generated: new Date().toISOString(),
        url_count: data.url_count || prev.url_count,
      }))
      toast.success('Sitemap generated successfully')
    } catch (error) {
      toast.error('Failed to generate sitemap')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleToggleSchema = async (type: keyof SchemaSettings) => {
    const newSettings = { ...schemaSettings, [type]: !schemaSettings[type] }
    setSchemaSettings(newSettings)

    try {
      const response = await fetch('/api/admin/seo/schema', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [type]: newSettings[type] }),
      })

      if (!response.ok) throw new Error('Failed to update schema')

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} schema ${newSettings[type] ? 'enabled' : 'disabled'}`)
    } catch (error) {
      toast.error('Failed to update schema settings')
      setSchemaSettings(schemaSettings)
      console.error(error)
    }
  }

  const handlePreviewUrl = async () => {
    if (!previewUrl) {
      toast.error('Please enter a URL')
      return
    }

    try {
      const response = await fetch(`/api/seo/preview?url=${encodeURIComponent(previewUrl)}`)

      if (!response.ok) throw new Error('Failed to fetch preview')

      const data = await response.json()
      setMetaPreview(data)
    } catch (error) {
      toast.error('Failed to load preview')
      console.error(error)
    }
  }

  const handleSubmitNewUrl = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUrl) {
      toast.error('Please enter a URL')
      return
    }

    try {
      const response = await fetch('/api/indexing/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newUrl }),
      })

      if (!response.ok) throw new Error('Failed to submit URL')

      toast.success('URL submitted for indexing')
      setNewUrl('')
      fetchSEOData()
    } catch (error) {
      toast.error('Failed to submit URL')
      console.error(error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'indexed':
        return <CheckCircle className="w-4 h-4 text-success" />
      case 'pending':
        return <Clock className="w-4 h-4 text-warning" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-brand-red" />
      default:
        return <span className="w-4 h-4 rounded-full bg-text-4/20" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'indexed':
        return 'Indexed'
      case 'pending':
        return 'Pending'
      case 'error':
        return 'Error'
      default:
        return 'Not Submitted'
    }
  }

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="font-syne font-700 text-3xl text-text-1">SEO & Indexing</h1>
          <p className="font-manrope text-text-3 mt-1">Manage search engine indexing and structured data</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border border-brand-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="font-manrope text-text-4 text-sm">Indexed URLs</p>
                <p className="font-syne font-700 text-xl text-text-1">{stats.indexed}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-brand-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="font-manrope text-text-4 text-sm">Pending</p>
                <p className="font-syne font-700 text-xl text-text-1">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-brand-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                <FileCode className="w-5 h-5 text-brand-blue" />
              </div>
              <div>
                <p className="font-manrope text-text-4 text-sm">Sitemap URLs</p>
                <p className="font-syne font-700 text-xl text-text-1">{stats.sitemapUrls}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-brand-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-navy/10 flex items-center justify-center">
                <Settings className="w-5 h-5 text-brand-navy" />
              </div>
              <div>
                <p className="font-manrope text-text-4 text-sm">Active Schemas</p>
                <p className="font-syne font-700 text-xl text-text-1">{stats.schemaActive}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg border border-brand-border overflow-hidden">
            <div className="p-4 border-b border-brand-border flex items-center justify-between">
              <h2 className="font-syne font-700 text-lg text-text-1 flex items-center gap-2">
                <Globe className="w-5 h-5 text-brand-blue" />
                Indexing Status
              </h2>
              <form onSubmit={handleSubmitNewUrl} className="flex items-center gap-2">
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="Add URL to index..."
                  className="px-3 py-1.5 bg-brand-offwhite border border-brand-border rounded-lg font-manrope text-sm text-text-1 placeholder:text-text-4 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 w-48"
                />
                <button
                  type="submit"
                  className="p-2 bg-brand-navy text-white rounded-lg hover:bg-text-2 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-brand-offwhite">
                  <tr>
                    <th className="px-4 py-3 text-left font-syne font-700 text-xs text-text-2 uppercase tracking-wider">URL</th>
                    <th className="px-4 py-3 text-left font-syne font-700 text-xs text-text-2 uppercase tracking-wider">Google</th>
                    <th className="px-4 py-3 text-left font-syne font-700 text-xs text-text-2 uppercase tracking-wider">Bing</th>
                    <th className="px-4 py-3 text-right font-syne font-700 text-xs text-text-2 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center font-manrope text-text-3">
                        Loading...
                      </td>
                    </tr>
                  ) : urls.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center font-manrope text-text-3">
                        No URLs indexed yet
                      </td>
                    </tr>
                  ) : (
                    urls.map((url) => (
                      <tr key={url.id} className="hover:bg-brand-offwhite/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-text-3 truncate max-w-[200px]">{url.url}</span>
                            <button
                              onClick={() => navigator.clipboard.writeText(url.url)}
                              className="p-1 hover:bg-brand-offwhite rounded"
                            >
                              <Copy className="w-3 h-3 text-text-4" />
                            </button>
                          </div>
                          <p className="font-manrope text-xs text-text-4">
                            {new Date(url.submitted_at).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {getStatusIcon(url.google_status)}
                            <span className="font-manrope text-xs text-text-2">{getStatusLabel(url.google_status)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {getStatusIcon(url.bing_status)}
                            <span className="font-manrope text-xs text-text-2">{getStatusLabel(url.bing_status)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleResubmitGoogle(url.id)}
                              className="p-1.5 hover:bg-brand-blue/10 rounded-lg text-brand-blue transition-colors"
                              title="Resubmit to Google"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleResubmitBing(url.id)}
                              className="p-1.5 hover:bg-brand-blue/10 rounded-lg text-brand-blue transition-colors"
                              title="Resubmit to Bing"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
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

          <div className="bg-white rounded-lg border border-brand-border p-6">
            <h2 className="font-syne font-700 text-lg text-text-1 flex items-center gap-2 mb-4">
              <FileCode className="w-5 h-5 text-brand-blue" />
              Sitemap
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-brand-offwhite rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-manrope text-sm text-text-3">Last Generated</span>
                  <span className="font-mono text-sm text-text-2">
                    {sitemap.last_generated
                      ? new Date(sitemap.last_generated).toLocaleString()
                      : 'Never'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-manrope text-sm text-text-3">URL Count</span>
                  <span className="font-syne font-700 text-lg text-text-1">{sitemap.url_count}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleGenerateSitemap}
                  disabled={isGenerating}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-brand-navy text-white rounded-lg font-syne font-700 text-sm hover:bg-text-2 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'Generating...' : 'Regenerate Sitemap'}
                </button>
                <a
                  href={sitemap.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-offwhite border border-brand-border text-text-2 rounded-lg font-syne font-700 text-sm hover:bg-brand-border transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-brand-border p-6">
            <h2 className="font-syne font-700 text-lg text-text-1 flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-brand-blue" />
              Schema.org Settings
            </h2>
            <div className="space-y-3">
              {[
                { key: 'product', label: 'Product Schema', description: 'Structured data for products' },
                { key: 'organization', label: 'Organization Schema', description: 'Business information' },
                { key: 'faq', label: 'FAQ Schema', description: 'FAQ page structured data' },
                { key: 'review', label: 'Review Schema', description: 'Product reviews and ratings' },
                { key: 'breadcrumb', label: 'Breadcrumb Schema', description: 'Navigation breadcrumbs' },
              ].map(({ key, label, description }) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 bg-brand-offwhite rounded-lg cursor-pointer hover:bg-brand-border/50 transition-colors"
                  onClick={() => handleToggleSchema(key as keyof SchemaSettings)}
                >
                  <div>
                    <p className="font-syne font-700 text-sm text-text-1">{label}</p>
                    <p className="font-manrope text-xs text-text-3">{description}</p>
                  </div>
                  <button className="text-brand-blue">
                    {schemaSettings[key as keyof SchemaSettings] ? (
                      <ToggleRight className="w-6 h-6" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-text-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-brand-border p-6">
            <h2 className="font-syne font-700 text-lg text-text-1 flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-brand-blue" />
              Meta Tags Preview
            </h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={previewUrl}
                  onChange={(e) => setPreviewUrl(e.target.value)}
                  placeholder="Enter URL to preview..."
                  className="flex-1 px-4 py-2 bg-brand-offwhite border border-brand-border rounded-lg font-manrope text-sm text-text-1 placeholder:text-text-4 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
                <button
                  onClick={handlePreviewUrl}
                  className="px-4 py-2 bg-brand-navy text-white rounded-lg font-syne font-700 text-sm hover:bg-text-2 transition-colors"
                >
                  Preview
                </button>
              </div>

              {metaPreview ? (
                <div className="space-y-4">
                  <div className="p-4 border border-brand-border rounded-lg bg-white">
                    <p className="font-syne font-700 text-xs text-text-4 uppercase mb-2">Google Search Result</p>
                    <div className="space-y-1">
                      <p className="font-syne text-lg text-brand-blue hover:underline cursor-pointer line-clamp-1">
                        {metaPreview.title || 'Page Title'}
                      </p>
                      <p className="font-manrope text-sm text-success">
                        {previewUrl || 'https://example.com/page'}
                      </p>
                      <p className="font-manrope text-sm text-text-3 line-clamp-2">
                        {metaPreview.description || 'Meta description will appear here...'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 border border-brand-border rounded-lg bg-white">
                    <p className="font-syne font-700 text-xs text-text-4 uppercase mb-2">Social Share Card</p>
                    <div className="border border-brand-border rounded-lg overflow-hidden">
                      <div className="h-32 bg-brand-offwhite flex items-center justify-center">
                        <span className="font-manrope text-text-4 text-sm">OG Image Preview</span>
                      </div>
                      <div className="p-3">
                        <p className="font-syne font-700 text-sm text-text-1 line-clamp-1">{metaPreview.title}</p>
                        <p className="font-manrope text-xs text-text-3 line-clamp-2 mt-1">{metaPreview.description}</p>
                        <p className="font-manrope text-xs text-text-4 uppercase mt-2">{previewUrl}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-brand-border rounded-lg">
                  <Search className="w-8 h-8 text-text-4 mx-auto mb-2" />
                  <p className="font-manrope text-sm text-text-3">Enter a URL and click Preview to see meta tags</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
