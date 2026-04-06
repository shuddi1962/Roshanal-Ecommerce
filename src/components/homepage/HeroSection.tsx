'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeroSlide {
  id: string
  headline: string
  subheadline: string
  cta_label: string
  cta_href: string
  cta2_label?: string
  cta2_href?: string
  bg_color: string
  image_url: string
  badge?: string
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: '1',
    headline: 'Secure What Matters Most',
    subheadline: 'Professional CCTV, fire alarm & access control systems with same-day installation across Port Harcourt.',
    cta_label: 'Shop Security Systems',
    cta_href: '/categories/security',
    cta2_label: 'Book Installation',
    cta2_href: '/services/cctv-installation',
    bg_color: 'from-brand-navy to-blue-900',
    image_url: '/images/hero/security.jpg',
    badge: 'SAME DAY INSTALL',
  },
  {
    id: '2',
    headline: 'Built for the Water',
    subheadline: 'Premium marine accessories, Yamaha & Mercury boat engines, safety equipment for Nigeria\'s waterways.',
    cta_label: 'Shop Marine Products',
    cta_href: '/categories/marine',
    cta2_label: 'Build Your Boat',
    cta2_href: '/services/boat-building',
    bg_color: 'from-teal-900 to-cyan-900',
    image_url: '/images/hero/marine.jpg',
    badge: 'GENUINE YAMAHA DEALER',
  },
  {
    id: '3',
    headline: 'Power. Reliability. Freedom.',
    subheadline: 'Solar panels, inverters & UPS systems. Never depend on NEPA again. Installed & guaranteed.',
    cta_label: 'Shop Solar Solutions',
    cta_href: '/categories/solar',
    cta2_label: 'Get a Free Quote',
    cta2_href: '/quote',
    bg_color: 'from-orange-900 to-amber-900',
    image_url: '/images/hero/solar.jpg',
    badge: '10-YEAR WARRANTY',
  },
]

export default function HeroSection() {
  const [slides] = useState<HeroSlide[]>(DEFAULT_SLIDES)
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [slides.length, paused])

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length)
  const next = () => setCurrent((c) => (c + 1) % slides.length)

  return (
    <div
      className="relative h-[440px] md:h-[520px] xl:h-[560px] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="wait">
        {slides.map((slide, i) =>
          i === current ? (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className={cn('absolute inset-0 bg-gradient-to-r', slide.bg_color, 'flex items-center')}
            >
              {/* Background image overlay */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: `url(${slide.image_url})` }}
              />

              <div className="container mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                {/* Text content — 3 cols */}
                <div className="lg:col-span-3">
                  {slide.badge && (
                    <motion.span
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="inline-block sale-badge bg-brand-red text-white mb-4"
                    >
                      {slide.badge}
                    </motion.span>
                  )}

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="font-syne font-800 text-white text-3xl md:text-4xl xl:text-5xl leading-tight mb-4"
                  >
                    {slide.headline}
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-white/80 font-manrope text-base md:text-lg max-w-lg mb-8 leading-relaxed"
                  >
                    {slide.subheadline}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap gap-3"
                  >
                    <Link
                      href={slide.cta_href}
                      className="flex items-center gap-2 bg-white text-brand-blue font-syne font-700 text-sm px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
                    >
                      {slide.cta_label}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    {slide.cta2_label && slide.cta2_href && (
                      <Link
                        href={slide.cta2_href}
                        className="flex items-center gap-2 border-2 border-white text-white font-syne font-700 text-sm px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        {slide.cta2_label}
                      </Link>
                    )}
                  </motion.div>
                </div>

                {/* Right side: 2 featured product cards */}
                <div className="lg:col-span-2 hidden lg:grid grid-cols-1 gap-4">
                  {[0, 1].map((cardIndex) => (
                    <div key={cardIndex} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                          <div className="w-8 h-8 bg-white/40 rounded" />
                        </div>
                        <div>
                          <div className="font-syne font-700 text-white text-sm">Featured Product {cardIndex + 1}</div>
                          <div className="text-white/60 text-xs font-manrope mt-0.5">Category Name</div>
                          <div className="font-syne font-700 text-brand-red text-base mt-1">₦125,000</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : null
        )}
      </AnimatePresence>

      {/* Navigation arrows */}
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors">
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              'transition-all duration-300 rounded-full',
              i === current ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'
            )}
          />
        ))}
      </div>
    </div>
  )
}
