import type { Metadata } from 'next'
import { Suspense } from 'react'
import CompareComponents from '@/features/compare/ComparePage'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'Compare Products — Roshanal Global',
  path: '/account/compare',
})

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-offwhite animate-pulse" />}>
      <CompareComponents />
    </Suspense>
  )
}
