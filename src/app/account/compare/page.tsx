import type { Metadata } from 'next'
import { Suspense } from 'react'
import ComparePage from '@/features/compare/ComparePage'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'Compare Products — Roshanal Global',
  description: 'Compare up to 4 products side by side.',
  path: '/account/compare',
})

export default async function ComparePageRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-offwhite animate-pulse" />}>
      <ComparePage />
    </Suspense>
  )
}
