'use client'

import React, { useEffect, useState } from 'react'
import { eventBus } from '@/lib/event-bus'
import type { FeatureFlagKey } from '@/lib/feature-flags'

interface FeatureFlagGateProps {
  flag: FeatureFlagKey
  children: React.ReactNode
  fallback?: React.ReactNode
}

const flagCache = new Map<FeatureFlagKey, boolean>()

export default function FeatureFlagGate({ flag, children, fallback = null }: FeatureFlagGateProps) {
  const [enabled, setEnabled] = useState<boolean | null>(null)

  useEffect(() => {
    if (flagCache.has(flag)) {
      setEnabled(flagCache.get(flag) ?? false)
      return
    }

    void (async () => {
      try {
        const res = await fetch(`/api/feature-flags?key=${encodeURIComponent(flag)}`)
        const data = (await res.json()) as { enabled?: boolean }
        const isEnabled = data.enabled ?? false
        flagCache.set(flag, isEnabled)
        setEnabled(isEnabled)
      } catch {
        flagCache.set(flag, false)
        setEnabled(false)
      }
    })()
  }, [flag])

  if (enabled === null) return null
  return enabled ? <>{children}</> : <>{fallback}</>
}

export function useFeatureFlag(flag: FeatureFlagKey): boolean {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`/api/feature-flags?key=${encodeURIComponent(flag)}`)
        const data = (await res.json()) as { enabled?: boolean }
        setEnabled(data.enabled ?? false)
      } catch { setEnabled(false) }
    })()
  }, [flag])

  return enabled
}
