import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function MarineSection() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-syne font-800 text-text-1 text-2xl">Marine Accessories</h2>
          <p className="text-text-3 font-manrope text-sm mt-1">Everything for Nigeria&apos;s waterways — safety, navigation & performance</p>
        </div>
        <Link href="/categories/marine" className="hidden sm:flex items-center gap-1.5 text-brand-blue font-manrope font-600 text-sm hover:underline">
          View All Marine <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">⚓</div>
        <p className="font-manrope text-text-3 text-sm">Marine products load dynamically from your catalog.</p>
        <Link href="/categories/marine" className="mt-3 inline-flex items-center gap-1.5 text-brand-blue font-manrope font-600 text-sm hover:underline">
          Browse Marine Products <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
