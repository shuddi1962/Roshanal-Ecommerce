'use client'

import { Suspense } from 'react'
import POSContent from '@/components/admin/POSContent'

export default function POSPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-brand-offwhite animate-pulse" />}>
      <POSContent />
    </Suspense>
  )
}