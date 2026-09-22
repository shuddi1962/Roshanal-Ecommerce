'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const BANNERS = [
  {
    title: 'Boat Building Service',
    subtitle: 'Custom vessels for Nigeria\'s waterways',
    cta: 'Configure Yours',
    href: '/services/boat-building',
    gradient: 'from-teal-800 to-cyan-900',
    icon: '🚢',
  },
  {
    title: 'Kitchen Installation',
    subtitle: 'Indoor, outdoor, and commercial kitchens',
    cta: 'Book a Consultation',
    href: '/services/kitchen-installation',
    gradient: 'from-orange-800 to-amber-900',
    icon: '🍳',
  },
]

export default function PromoSplitBanners() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {BANNERS.map((b) => (
        <Link
          key={b.href}
          href={b.href}
          className={`bg-gradient-to-br ${b.gradient} text-white rounded-2xl p-7 flex items-center gap-5 hover:shadow-float transition-all group`}
        >
          <span className="text-5xl shrink-0">{b.icon}</span>
          <div className="flex-1">
            <div className="font-syne font-800 text-xl mb-1">{b.title}</div>
            <div className="text-white/70 text-sm font-manrope mb-3">{b.subtitle}</div>
            <span className="inline-flex items-center gap-1.5 text-sm font-syne font-700 bg-white/20 hover:bg-white/30 group-hover:gap-2.5 px-4 py-2 rounded-lg transition-all">
              {b.cta} <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
