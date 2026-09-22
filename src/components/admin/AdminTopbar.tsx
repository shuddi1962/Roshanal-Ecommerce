'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, Search, Heart, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminTopbarProps {
  user: {
    name: string
    email: string
    role: string
    avatar: string | null
  }
}

export default function AdminTopbar({ user }: AdminTopbarProps) {
  const [healthScore, setHealthScore] = useState<number | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    // Fetch site doctor health score
    fetch('/api/site-doctor')
      .then((r) => r.json())
      .then((d: { score?: number }) => setHealthScore(d.score ?? null))
      .catch(() => {})
  }, [])

  const healthColor = healthScore === null ? 'text-text-4' : healthScore >= 90 ? 'text-success' : healthScore >= 70 ? 'text-warning' : 'text-brand-red'

  return (
    <div className="h-14 bg-white border-b border-brand-border flex items-center gap-4 px-6 shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search admin..."
            className="w-full pl-9 pr-4 py-2 bg-brand-offwhite border border-brand-border rounded-lg text-sm text-text-1 placeholder:text-text-4 focus:outline-none focus:border-brand-blue"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Site doctor health score */}
        {healthScore !== null && (
          <Link
            href="/admin/site-doctor"
            className={cn('flex items-center gap-1.5 text-sm font-syne font-700', healthColor)}
            title="Site Doctor Health Score"
          >
            <Heart className="w-4 h-4" />
            {healthScore}/100
          </Link>
        )}

        {/* View site */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-xs text-text-3 hover:text-brand-blue transition-colors border border-brand-border rounded-lg px-3 py-1.5"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Site
        </Link>

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-full bg-brand-offwhite hover:bg-blue-50 flex items-center justify-center transition-colors">
          <Bell className="w-4.5 h-4.5 text-text-3" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-brand-red rounded-full" />
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center">
            <span className="font-syne font-700 text-white text-xs">
              {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
            </span>
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-manrope font-600 text-text-1">{user.name}</div>
            <div className="text-[10px] text-text-4 capitalize">{user.role.replace('_', ' ')}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
