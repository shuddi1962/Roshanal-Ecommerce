'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Phone, Mail, ChevronDown, Search, ShoppingCart,
  Heart, BarChart2, User, Package, Menu, X, ArrowRight,
  Globe, Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Sub-components ─────────────────────────────────────────────────────────

function TopBar() {
  return (
    <div className="bg-brand-navy text-white text-xs h-[34px] flex items-center px-4 shrink-0">
      <div className="container mx-auto flex items-center justify-between">
        {/* Left */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/stores" className="flex items-center gap-1 hover:text-white/80 transition-colors text-white/70">
            <MapPin className="w-3 h-3" />
            <span>Find a Store</span>
          </Link>
          <a href="tel:+2348001234567" className="flex items-center gap-1 hover:text-white/80 transition-colors text-white/70">
            <Phone className="w-3 h-3" />
            <span>+234 800 ROSHANAL</span>
          </a>
          <a href="mailto:info@roshanalglobal.com" className="flex items-center gap-1 hover:text-white/80 transition-colors text-white/70">
            <Mail className="w-3 h-3" />
            <span>info@roshanalglobal.com</span>
          </a>
          <span className="text-white/50">Mon–Sat 8AM–6PM WAT</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4 text-white/70 ml-auto">
          <Link href="/about" className="hover:text-white transition-colors hidden sm:inline">About</Link>
          <Link href="/blog" className="hover:text-white transition-colors hidden sm:inline">Blog</Link>
          <Link href="/affiliate" className="hover:text-white transition-colors hidden lg:inline">Affiliates</Link>
          <Link href="/wholesale" className="hover:text-white transition-colors hidden lg:inline">B2B/Wholesale</Link>
          <Link href="/track-order" className="hover:text-white transition-colors hidden sm:inline">Track Order</Link>
          <CurrencySelector />
          <LocationPill />
        </div>
      </div>
    </div>
  )
}

function CurrencySelector() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState('NGN')
  const ref = useRef<HTMLDivElement>(null)

  const currencies = ['NGN', 'USD', 'GBP', 'EUR', 'GHS', 'AED', 'CAD', 'AUD', 'ZAR', 'KES']

  useEffect(() => {
    const stored = localStorage.getItem('rg_currency')
    if (stored) setSelected(stored)
  }, [])

  const select = (code: string) => {
    setSelected(code)
    localStorage.setItem('rg_currency', code)
    setOpen(false)
    // Dispatch event for live currency update
    window.dispatchEvent(new CustomEvent('rg:currency-changed', { detail: { code } }))
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 hover:text-white transition-colors text-white/70"
      >
        <Globe className="w-3 h-3" />
        <span>{selected}</span>
        <ChevronDown className={cn('w-3 h-3 transition-transform duration-200', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute right-0 top-full mt-1 bg-white text-text-1 rounded-lg shadow-float border border-brand-border z-50 p-2 grid grid-cols-2 gap-0.5 w-40"
          >
            {currencies.map((c) => (
              <button
                key={c}
                onClick={() => select(c)}
                className={cn(
                  'text-left px-3 py-1.5 text-xs rounded-md hover:bg-brand-offwhite transition-colors',
                  selected === c && 'bg-blue-50 text-brand-blue font-semibold'
                )}
              >
                {c}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function LocationPill() {
  const [geo, setGeo] = useState({ city: 'Port Harcourt', country: 'NG' })

  useEffect(() => {
    const stored = localStorage.getItem('rg_geo')
    if (stored) {
      try { setGeo(JSON.parse(stored) as { city: string; country: string }) } catch {}
    } else {
      // Fetch from our geo API
      fetch('/api/geo')
        .then((r) => r.json())
        .then((d: { city?: string; countryCode?: string }) => {
          if (d.city) {
            const g = { city: d.city, country: d.countryCode ?? 'NG' }
            setGeo(g)
            localStorage.setItem('rg_geo', JSON.stringify(g))
          }
        })
        .catch(() => {})
    }
  }, [])

  return (
    <div className="hidden lg:flex items-center gap-1 text-white/70 cursor-pointer hover:text-white transition-colors group">
      <span className="inline-block w-2 h-2 rounded-full bg-green-400 group-hover:animate-pulse" />
      <MapPin className="w-3 h-3" />
      <span>{geo.city}, {geo.country}</span>
    </div>
  )
}

function NoticeBar() {
  const [msgIndex, setMsgIndex] = useState(0)
  const messages = [
    '🚚 Free delivery on orders over ₦50,000 within Port Harcourt',
    '⚡ Same-day installation available — call +234 800 ROSHANAL',
    '🔒 100% Genuine products with manufacturer warranty',
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex((i) => (i + 1) % messages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [messages.length])

  return (
    <div className="bg-brand-red text-white text-[13px] h-[32px] flex items-center justify-center relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={msgIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="font-manrope font-medium"
        >
          {messages[msgIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

interface SearchResult {
  id: string
  type: 'product' | 'category' | 'blog'
  name: string
  slug: string
  price?: string
  image?: string
}

function MainHeader() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cart count from localStorage/state
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [compareCount, setCompareCount] = useState(0)

  useEffect(() => {
    const updateCounts = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('rg_cart') ?? '[]') as unknown[]
        const wish = JSON.parse(localStorage.getItem('rg_wishlist') ?? '[]') as unknown[]
        const comp = JSON.parse(localStorage.getItem('rg_compare') ?? '[]') as unknown[]
        setCartCount(cart.length)
        setWishlistCount(wish.length)
        setCompareCount(comp.length)
      } catch {}
    }
    updateCounts()
    window.addEventListener('rg:cart-updated', updateCounts)
    window.addEventListener('rg:wishlist-updated', updateCounts)
    window.addEventListener('rg:compare-updated', updateCounts)
    return () => {
      window.removeEventListener('rg:cart-updated', updateCounts)
      window.removeEventListener('rg:wishlist-updated', updateCounts)
      window.removeEventListener('rg:compare-updated', updateCounts)
    }
  }, [])

  const handleSearch = useCallback((value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.length < 2) { setResults([]); setShowResults(false); return }

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value)}&limit=8`)
        const data = (await res.json()) as { results: SearchResult[] }
        setResults(data.results ?? [])
        setShowResults(true)
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 200)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setShowResults(false)
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`)
    }
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="bg-white border-b border-brand-border py-3 px-4">
      <div className="container mx-auto flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-blue to-blue-800 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <span className="font-syne font-800 text-white text-lg leading-none">RS</span>
          </div>
          <div className="hidden sm:block">
            <div className="font-syne font-800 text-brand-navy text-[17px] leading-tight tracking-wide uppercase">
              Roshanal Global
            </div>
            <div className="font-manrope text-brand-red text-[9px] font-600 uppercase tracking-[0.12em]">
              Infotech Limited
            </div>
          </div>
        </Link>

        {/* Live Search */}
        <div className="flex-1 max-w-2xl" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => results.length > 0 && setShowResults(true)}
              placeholder="Search products, categories, brands..."
              className="w-full pl-10 pr-4 py-2.5 bg-brand-offwhite border border-brand-border rounded-lg text-sm text-text-1 placeholder:text-text-4 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors"
            />
            {searching && (
              <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-blue animate-spin" />
            )}
          </form>

          {/* Search results dropdown */}
          <AnimatePresence>
            {showResults && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute left-0 right-0 mt-1 bg-white border border-brand-border rounded-xl shadow-float z-50 overflow-hidden max-h-96 overflow-y-auto"
              >
                {['product', 'category', 'blog'].map((type) => {
                  const group = results.filter((r) => r.type === type)
                  if (!group.length) return null
                  return (
                    <div key={type}>
                      <div className="px-4 py-2 text-[10px] font-700 uppercase tracking-widest text-text-4 bg-brand-offwhite">
                        {type === 'product' ? 'Products' : type === 'category' ? 'Categories' : 'Blog Posts'}
                      </div>
                      {group.map((r) => (
                        <Link
                          key={r.id}
                          href={type === 'product' ? `/products/${r.slug}` : type === 'category' ? `/categories/${r.slug}` : `/blog/${r.slug}`}
                          onClick={() => { setShowResults(false); setQuery('') }}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-brand-offwhite transition-colors"
                        >
                          {r.image && (
                            <img src={r.image} alt={r.name} className="w-9 h-9 object-contain rounded bg-brand-offwhite shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-manrope text-text-1 truncate">{r.name}</div>
                            {r.price && <div className="text-xs font-syne font-700 text-brand-red">{r.price}</div>}
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-text-4 shrink-0" />
                        </Link>
                      ))}
                    </div>
                  )
                })}

                <Link
                  href={`/shop?search=${encodeURIComponent(query)}`}
                  onClick={() => setShowResults(false)}
                  className="flex items-center justify-center gap-2 py-3 text-sm text-brand-blue font-manrope font-600 hover:bg-brand-offwhite border-t border-brand-border"
                >
                  <Search className="w-3.5 h-3.5" />
                  See all results for &quot;{query}&quot;
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-1 shrink-0">
          <Link href="/track-order" className="hidden lg:flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg hover:bg-brand-offwhite transition-colors group">
            <Package className="w-5 h-5 text-text-3 group-hover:text-brand-blue transition-colors" />
            <span className="text-[10px] font-manrope text-text-4">Track</span>
          </Link>

          <Link href="/account/compare" className="relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg hover:bg-brand-offwhite transition-colors group">
            <BarChart2 className="w-5 h-5 text-text-3 group-hover:text-brand-blue transition-colors" />
            {compareCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-brand-blue text-white text-[9px] font-700 rounded-full flex items-center justify-center font-syne">{compareCount}</span>
            )}
            <span className="text-[10px] font-manrope text-text-4 hidden sm:block">Compare</span>
          </Link>

          <Link href="/account/wishlist" className="relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg hover:bg-brand-offwhite transition-colors group">
            <Heart className="w-5 h-5 text-text-3 group-hover:text-brand-red transition-colors" />
            {wishlistCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-brand-red text-white text-[9px] font-700 rounded-full flex items-center justify-center font-syne">{wishlistCount}</span>
            )}
            <span className="text-[10px] font-manrope text-text-4 hidden sm:block">Wishlist</span>
          </Link>

          <Link href="/cart" className="relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg hover:bg-brand-offwhite transition-colors group">
            <ShoppingCart className="w-5 h-5 text-text-3 group-hover:text-brand-blue transition-colors" />
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-brand-red text-white text-[9px] font-700 rounded-full flex items-center justify-center font-syne">{cartCount}</span>
            )}
            <span className="text-[10px] font-manrope text-text-4 hidden sm:block">Cart</span>
          </Link>

          <Link href="/account/dashboard" className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg hover:bg-brand-offwhite transition-colors group">
            <User className="w-5 h-5 text-text-3 group-hover:text-brand-blue transition-colors" />
            <span className="text-[10px] font-manrope text-text-4 hidden sm:block">Account</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Deals', href: '/deals' },
  { label: 'New Arrivals', href: '/new-arrivals' },
  { label: 'Brands', href: '/brands' },
  {
    label: 'Services',
    href: '/services',
    children: [
      { label: 'CCTV Installation', href: '/services/cctv-installation' },
      { label: 'Fire Alarm', href: '/services/fire-alarm' },
      { label: 'Access Control', href: '/services/access-control' },
      { label: 'Kitchen Installation', href: '/services/kitchen-installation' },
      { label: 'Dredging Services', href: '/services/dredging' },
      { label: 'Boat Building', href: '/services/boat-building' },
      { label: 'Maintenance', href: '/services/maintenance' },
      { label: 'Consultation', href: '/services/consultation' },
    ],
  },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
]

const DEPARTMENTS = [
  { name: 'Security Systems', slug: 'security', icon: '🔒', children: ['CCTV & DVR Systems', 'Fire Alarm Systems', 'Access Control', 'Video Door Phones', 'Electric Fencing'] },
  { name: 'Marine & Naval', slug: 'marine', icon: '⚓', children: ['Boat Engines', 'Marine Safety', 'Navigation Electronics', 'Marine Pumps', 'Boat Lighting'] },
  { name: 'Solar & Energy', slug: 'solar', icon: '☀️', children: ['Solar Panels', 'Inverters & UPS', 'Solar Batteries', 'Charge Controllers', 'Solar Accessories'] },
  { name: 'Networking & ICT', slug: 'networking', icon: '🌐', children: ['Routers & Switches', 'Access Points', 'Network Cables', 'Fiber Equipment', 'ICT Accessories'] },
  { name: 'Safety Equipment', slug: 'safety', icon: '🦺', children: ['Life Jackets', 'Safety Helmets', 'Fire Extinguishers', 'First Aid Kits', 'Protective Gear'] },
  { name: 'Dredging Equipment', slug: 'dredging', icon: '⛏️', children: ['Dredge Pumps', 'Cutter Heads', 'Dredge Pipes', 'Winches & Anchors', 'Spare Parts'] },
  { name: 'Boat Engines', slug: 'boat-engines', icon: '🚤', children: ['Outboard Engines', 'Inboard Engines', 'Engine Parts', 'Propellers', 'Engine Services'] },
  { name: 'Kitchen & Cooking', slug: 'kitchen', icon: '🍳', children: ['Cooking Ranges', 'Kitchen Cabinets', 'Outdoor Grills', 'Commercial Kitchens', 'Kitchen Accessories'] },
]

function NavBar({ mobileOpen, setMobileOpen }: { mobileOpen: boolean; setMobileOpen: (v: boolean) => void }) {
  const [deptOpen, setDeptOpen] = useState(false)
  const [activeService, setActiveService] = useState<string | null>(null)

  return (
    <nav className="bg-brand-blue text-white relative z-30">
      <div className="container mx-auto px-4 flex items-center h-[44px]">
        {/* ALL DEPARTMENTS */}
        <div
          className="relative shrink-0"
          onMouseEnter={() => setDeptOpen(true)}
          onMouseLeave={() => setDeptOpen(false)}
        >
          <button className="flex items-center gap-2 bg-brand-red hover:bg-red-700 transition-colors h-[44px] px-4 text-sm font-syne font-700 uppercase tracking-wide">
            <Menu className="w-4 h-4" />
            <span className="hidden sm:inline">All Departments</span>
            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', deptOpen && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {deptOpen && (
              <motion.div
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-full left-0 bg-white text-text-1 shadow-float rounded-b-xl border border-brand-border z-50 flex"
                style={{ minWidth: 600 }}
              >
                {/* Dept list */}
                <div className="w-56 border-r border-brand-border py-2">
                  {DEPARTMENTS.map((dept) => (
                    <Link
                      key={dept.slug}
                      href={`/categories/${dept.slug}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-brand-offwhite hover:text-brand-blue transition-colors text-sm font-manrope group"
                      onMouseEnter={() => setActiveService(dept.slug)}
                    >
                      <span className="text-base">{dept.icon}</span>
                      <span className="flex-1">{dept.name}</span>
                      <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-text-4 group-hover:text-brand-blue" />
                    </Link>
                  ))}
                </div>

                {/* Sub-categories panel */}
                <div className="flex-1 p-5">
                  {activeService ? (
                    <>
                      {DEPARTMENTS.filter((d) => d.slug === activeService).map((dept) => (
                        <div key={dept.slug}>
                          <div className="font-syne font-700 text-brand-navy mb-3">{dept.name}</div>
                          <div className="grid grid-cols-2 gap-1">
                            {dept.children.map((child) => (
                              <Link
                                key={child}
                                href={`/categories/${dept.slug}?filter=${encodeURIComponent(child)}`}
                                className="text-sm text-text-3 py-1.5 hover:text-brand-blue transition-colors flex items-center gap-1.5"
                              >
                                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                                {child}
                              </Link>
                            ))}
                          </div>
                          <Link
                            href={`/categories/${dept.slug}`}
                            className="mt-4 inline-flex items-center gap-1.5 text-sm font-600 text-brand-blue hover:text-blue-800"
                          >
                            View all {dept.name} <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="text-text-4 text-sm">Hover a department to see categories</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main nav links — desktop */}
        <div className="hidden lg:flex items-center flex-1 px-2 gap-0.5">
          {NAV_ITEMS.map((item) => (
            <div key={item.href} className="relative group">
              <Link
                href={item.href}
                className="flex items-center gap-1 px-3 py-2 text-[13px] font-manrope font-500 text-white/90 hover:text-white hover:bg-white/10 rounded-md transition-all"
              >
                {item.label}
                {item.children && <ChevronDown className="w-3 h-3 opacity-60" />}
              </Link>

              {item.children && (
                <div className="absolute top-full left-0 hidden group-hover:block bg-white text-text-1 shadow-float rounded-xl border border-brand-border z-50 py-2 min-w-[220px]">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-2 hover:bg-brand-offwhite hover:text-brand-blue transition-colors"
                    >
                      <ArrowRight className="w-3 h-3 opacity-30" />
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="ml-auto lg:hidden p-2 rounded-md hover:bg-white/10 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle mobile menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 top-0 z-50 bg-white text-text-1 flex flex-col overflow-y-auto"
          >
            <div className="bg-brand-navy text-white px-4 h-14 flex items-center justify-between">
              <Link href="/" onClick={() => setMobileOpen(false)} className="font-syne font-700 text-lg">
                ROSHANAL GLOBAL
              </Link>
              <button onClick={() => setMobileOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="px-4 py-4 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 border-b border-brand-border font-manrope text-text-2 font-500 flex items-center justify-between"
                >
                  {item.label}
                  <ArrowRight className="w-4 h-4 text-text-4" />
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-shadow duration-300',
        scrolled && 'shadow-float'
      )}
    >
      {/* Layer 1 — Topbar */}
      <TopBar />
      {/* Layer 2 — Notice Bar */}
      <NoticeBar />
      {/* Layer 3 — Main Header (Logo + Search + Icons) */}
      <MainHeader />
      {/* Layer 4 — Navigation Bar */}
      <NavBar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
    </header>
  )
}
