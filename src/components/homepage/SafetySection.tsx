import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function SafetySection() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-syne font-800 text-text-1 text-2xl">Safety Equipment</h2>
          <p className="text-text-3 font-manrope text-sm mt-1">Life jackets, fire extinguishers, PPE & emergency equipment</p>
        </div>
        <Link href="/categories/safety" className="hidden sm:flex items-center gap-1.5 text-brand-blue font-manrope font-600 text-sm hover:underline">
          View All Safety <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-orange-100 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">🦺</div>
        <p className="font-manrope text-text-3 text-sm">Safety products load dynamically from your catalog.</p>
        <Link href="/categories/safety" className="mt-3 inline-flex items-center gap-1.5 text-brand-blue font-manrope font-600 text-sm hover:underline">
          Browse Safety Products <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
