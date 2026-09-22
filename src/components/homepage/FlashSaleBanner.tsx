'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'

function Countdown({ endDate }: { endDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 })

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, endDate.getTime() - Date.now())
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    calc()
    const timer = setInterval(calc, 1000)
    return () => clearInterval(timer)
  }, [endDate])

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4 text-white/70" />
      {[timeLeft.h, timeLeft.m, timeLeft.s].map((val, i) => (
        <React.Fragment key={i}>
          <div className="bg-white/20 rounded-md px-2.5 py-1.5 font-mono font-700 text-white text-lg min-w-[40px] text-center">{pad(val)}</div>
          {i < 2 && <span className="text-white/70 font-700">:</span>}
        </React.Fragment>
      ))}
    </div>
  )
}

export default function FlashSaleBanner() {
  // In production: fetched from seasonal_campaigns / flash_sale feature
  const endDate = new Date(Date.now() + 8 * 3600 * 1000) // 8 hours from now

  return (
    <div className="bg-gradient-to-r from-brand-red to-red-700 text-white py-8">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="font-syne font-800 text-2xl md:text-3xl mb-1">⚡ Flash Sale — Up to 40% Off</div>
          <p className="font-manrope text-white/80 text-sm">Limited time deals on security systems, marine accessories & more</p>
        </div>
        <div className="flex items-center gap-6">
          <Countdown endDate={endDate} />
          <Link href="/deals" className="flex items-center gap-2 bg-white text-brand-red font-syne font-700 px-5 py-2.5 rounded-lg hover:bg-red-50 transition-colors shrink-0">
            Shop Deals <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
