'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const CATEGORIES = [
  { name: 'CCTV & Security', slug: 'security', icon: '🔒', color: 'from-blue-900 to-brand-navy' },
  { name: 'Marine & Naval', slug: 'marine', icon: '⚓', color: 'from-teal-800 to-cyan-900' },
  { name: 'Boat Engines', slug: 'boat-engines', icon: '🚤', color: 'from-indigo-800 to-blue-900' },
  { name: 'Solar & Energy', slug: 'solar', icon: '☀️', color: 'from-orange-800 to-amber-900' },
  { name: 'Fire & Safety', slug: 'fire-safety', icon: '🔥', color: 'from-red-800 to-rose-900' },
  { name: 'Access Control', slug: 'access-control', icon: '🔑', color: 'from-gray-800 to-slate-900' },
  { name: 'Networking', slug: 'networking', icon: '🌐', color: 'from-purple-800 to-violet-900' },
  { name: 'Safety Equipment', slug: 'safety', icon: '🦺', color: 'from-yellow-700 to-orange-800' },
  { name: 'Dredging', slug: 'dredging', icon: '⛏️', color: 'from-stone-700 to-zinc-800' },
  { name: 'Kitchen Install', slug: 'kitchen', icon: '🍳', color: 'from-emerald-800 to-teal-900' },
  { name: 'UPS & Inverters', slug: 'ups-inverters', icon: '⚡', color: 'from-cyan-800 to-blue-900' },
  { name: 'ICT Products', slug: 'ict', icon: '💻', color: 'from-sky-800 to-indigo-900' },
  { name: 'Pumps', slug: 'pumps', icon: '🔧', color: 'from-zinc-700 to-gray-800' },
  { name: 'Navigation Elec.', slug: 'navigation', icon: '🧭', color: 'from-blue-800 to-brand-navy' },
  { name: 'Life Jackets', slug: 'life-jackets', icon: '🔵', color: 'from-orange-700 to-red-800' },
  { name: 'New Arrivals', slug: 'new-arrivals', icon: '✨', color: 'from-pink-700 to-rose-800' },
  { name: 'Best Deals', slug: 'deals', icon: '🏷️', color: 'from-brand-red to-rose-700' },
  { name: 'B2B / Wholesale', slug: 'wholesale', icon: '🏭', color: 'from-slate-700 to-gray-800' },
]

export default function CategorySlider() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = 300
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-syne font-800 text-text-1 text-xl md:text-2xl">Shop by Category</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => scroll('left')} className="w-8 h-8 rounded-full border border-brand-border flex items-center justify-center hover:bg-brand-offwhite transition-colors">
            <ChevronLeft className="w-4 h-4 text-text-3" />
          </button>
          <button onClick={() => scroll('right')} className="w-8 h-8 rounded-full border border-brand-border flex items-center justify-center hover:bg-brand-offwhite transition-colors">
            <ChevronRight className="w-4 h-4 text-text-3" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={cat.slug === 'deals' ? '/deals' : cat.slug === 'new-arrivals' ? '/new-arrivals' : cat.slug === 'wholesale' ? '/wholesale' : `/categories/${cat.slug}`}
            className="shrink-0 flex flex-col items-center group"
          >
            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl md:text-3xl shadow-card group-hover:shadow-card-hover group-hover:-translate-y-1 transition-all duration-300`}>
              {cat.icon}
            </div>
            <span className="mt-2 text-[11px] md:text-xs font-manrope font-600 text-text-2 text-center max-w-[72px] leading-tight">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
