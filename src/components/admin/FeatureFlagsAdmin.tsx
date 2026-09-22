'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Flag, Search, RefreshCw, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeatureFlag {
  id: string; key: string; name: string; description: string
  module: string; enabled: boolean; updated_at: string
}

export default function FeatureFlagsAdmin() {
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [moduleFilter, setModuleFilter] = useState<string>('All')

  useEffect(() => {
    void loadFlags()
  }, [])

  const loadFlags = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/feature-flags')
      const data = (await res.json()) as { flags: FeatureFlag[] }
      setFlags(data.flags ?? [])
    } catch {}
    finally { setLoading(false) }
  }

  const toggle = async (key: string, enabled: boolean) => {
    setUpdating(key)
    try {
      await fetch('/api/admin/feature-flags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, enabled }),
      })
      setFlags((prev) => prev.map((f) => f.key === key ? { ...f, enabled } : f))
    } catch {}
    finally { setUpdating(null) }
  }

  const modules = ['All', ...Array.from(new Set(flags.map((f) => f.module))).sort()]

  const filtered = flags.filter((f) => {
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.key.includes(search.toLowerCase())
    const matchModule = moduleFilter === 'All' || f.module === moduleFilter
    return matchSearch && matchModule
  })

  const grouped = filtered.reduce<Record<string, FeatureFlag[]>>((acc, flag) => {
    const mod = flag.module
    if (!acc[mod]) acc[mod] = []
    acc[mod].push(flag)
    return acc
  }, {})

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-syne font-800 text-2xl text-text-1 flex items-center gap-2">
            <Flag className="w-6 h-6 text-brand-blue" /> Feature Flags
          </h1>
          <p className="font-manrope text-text-3 text-sm mt-0.5">Toggle features on/off without redeployment. {flags.length} flags total.</p>
        </div>
        <button onClick={() => void loadFlags()} className="flex items-center gap-2 px-4 py-2 border border-brand-border rounded-lg text-sm font-manrope text-text-3 hover:bg-brand-offwhite">
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search flags..."
            className="w-full pl-9 pr-4 py-2 border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-blue" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {modules.map((mod) => (
            <button key={mod} onClick={() => setModuleFilter(mod)}
              className={cn('shrink-0 px-3 py-1.5 text-xs font-manrope font-600 rounded-full transition-colors',
                moduleFilter === mod ? 'bg-brand-blue text-white' : 'bg-white border border-brand-border text-text-3 hover:border-brand-blue hover:text-brand-blue')}>
              {mod}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Flags', value: flags.length, color: 'text-text-1' },
          { label: 'Enabled', value: flags.filter((f) => f.enabled).length, color: 'text-success' },
          { label: 'Disabled', value: flags.filter((f) => !f.enabled).length, color: 'text-brand-red' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-brand-border p-4 text-center">
            <div className={cn('font-syne font-800 text-2xl', s.color)}>{s.value}</div>
            <div className="font-manrope text-text-4 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Flag groups */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-40 rounded-xl" />)}
        </div>
      ) : (
        Object.entries(grouped).map(([module, moduleFlags]) => (
          <div key={module} className="bg-white rounded-xl border border-brand-border overflow-hidden">
            <div className="px-5 py-3 bg-brand-offwhite border-b border-brand-border flex items-center justify-between">
              <h3 className="font-syne font-700 text-text-1 text-sm">{module}</h3>
              <span className="text-xs font-manrope text-text-4">{moduleFlags.filter((f) => f.enabled).length}/{moduleFlags.length} enabled</span>
            </div>
            <div className="divide-y divide-brand-border">
              {moduleFlags.map((flag) => (
                <motion.div key={flag.key} layout
                  className="flex items-center gap-4 px-5 py-3.5">
                  <div className="flex-1 min-w-0">
                    <div className="font-syne font-700 text-text-1 text-sm">{flag.name}</div>
                    <div className="font-mono text-[10px] text-text-4 mt-0.5">{flag.key}</div>
                    <div className="font-manrope text-text-3 text-xs mt-0.5">{flag.description}</div>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => void toggle(flag.key, !flag.enabled)}
                    disabled={updating === flag.key}
                    className={cn(
                      'relative w-11 h-6 rounded-full transition-all duration-200 disabled:opacity-60',
                      flag.enabled ? 'bg-brand-blue' : 'bg-brand-border'
                    )}
                  >
                    <span className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
                      flag.enabled ? 'translate-x-5' : 'translate-x-0.5')} />
                  </button>

                  <span className={cn('text-xs font-manrope w-14 text-right', flag.enabled ? 'text-success' : 'text-text-4')}>
                    {flag.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
