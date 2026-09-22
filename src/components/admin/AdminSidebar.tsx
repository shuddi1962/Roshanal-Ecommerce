'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Package, Archive, ShoppingBag, Users, RotateCcw, Shield, Star,
  Gift, FileText, Calendar, Monitor, Package2, CreditCard, Wallet, BarChart3,
  FileBarChart, Contact, Target, Grid3X3, Building, Truck, Truck as TruckIcon,
  Users2, Zap, Settings, Key, UserCog, Activity, Lock, Globe, Search, Mail, Megaphone,
  Hash, Rss, Speaker, Layers, Image, Palette, Menu, X, ChevronDown, ChevronRight,
  ShoppingCart, Anchor, ChefHat, Bot, Cpu, Video, Flag, Puzzle, GitBranch, Heart,
  Store, BadgeDollarSign, Handshake, DollarSign, BookOpen, Map, Radio, Wrench,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/database'

interface NavItem {
  label: string
  href?: string
  icon: React.ElementType
  children?: NavItem[]
  roles?: UserRole[]
  badge?: string
}

const NAV_STRUCTURE: Array<{ section: string; items: NavItem[] }> = [
  {
    section: 'COMMERCE',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Products', href: '/admin/products', icon: Package },
      { label: 'Inventory', href: '/admin/inventory', icon: Archive },
      { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
      { label: 'Customers', href: '/admin/customers', icon: Users },
      { label: 'Returns & RMA', href: '/admin/returns', icon: RotateCcw },
      { label: 'Warranty', href: '/admin/warranty', icon: Shield },
      { label: 'Reviews', href: '/admin/reviews', icon: Star },
      { label: 'Gift Cards', href: '/admin/gift-cards', icon: Gift },
    ],
  },
  {
    section: 'SALES',
    items: [
      { label: 'Quotes', href: '/admin/quotes', icon: FileText, roles: ['super_admin', 'store_manager', 'sales_staff'] },
      { label: 'Bookings', href: '/admin/bookings', icon: Calendar },
      { label: 'POS System', href: '/admin/pos', icon: Monitor },
      { label: 'Rentals', href: '/admin/rentals', icon: Package2 },
      { label: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
    ],
  },
  {
    section: 'SERVICES',
    items: [
      {
        label: 'Boat Building', href: '/admin/boat-building/enquiries', icon: Anchor,
        children: [
          { label: 'Enquiries', href: '/admin/boat-building/enquiries', icon: FileText },
          { label: 'Portfolio', href: '/admin/boat-building/portfolio', icon: Image },
          { label: 'Vessel Types', href: '/admin/boat-building/vessel-types', icon: Layers },
          { label: 'Settings', href: '/admin/boat-building/settings', icon: Settings },
        ],
      },
      { label: 'Kitchen Install', href: '/admin/bookings?type=kitchen', icon: ChefHat },
      { label: 'All Bookings', href: '/admin/bookings', icon: Calendar },
    ],
  },
  {
    section: 'MARKETING',
    items: [
      { label: 'Email Campaigns', href: '/admin/email-campaigns', icon: Mail },
      { label: 'SMS Campaigns', href: '/admin/sms-campaigns', icon: Hash },
      { label: 'Social Posting', href: '/admin/social-posting', icon: Speaker },
      { label: 'Content Calendar', href: '/admin/content-calendar', icon: Calendar },
      { label: 'Blog', href: '/admin/blog', icon: BookOpen },
      {
        label: 'SEO', href: '/admin/seo', icon: Search,
        children: [
          { label: 'SEO Overview', href: '/admin/seo', icon: Globe },
          { label: 'Indexing Status', href: '/admin/seo/indexing', icon: Radio },
        ],
      },
      { label: 'Popups', href: '/admin/popups', icon: Layers },
      { label: 'Banners', href: '/admin/banners', icon: Image },
      { label: 'Coupons', href: '/admin/coupons', icon: BadgeDollarSign },
      { label: 'Seasonal Campaigns', href: '/admin/seasonal-campaigns', icon: Megaphone },
      { label: 'Affiliate Program', href: '/admin/affiliate', icon: Handshake },
      { label: 'Research Agent', href: '/admin/research-agent', icon: Target },
      { label: 'Competitor Monitor', href: '/admin/competitor-monitor', icon: Zap },
    ],
  },
  {
    section: 'FINANCE',
    items: [
      { label: 'Payments', href: '/admin/payments', icon: CreditCard },
      { label: 'Wallet & Loyalty', href: '/admin/wallet-loyalty', icon: Wallet },
      { label: 'Accounting P&L', href: '/admin/accounting', icon: DollarSign },
      { label: 'Invoices', href: '/admin/invoices', icon: FileText },
      { label: 'Financial Reports', href: '/admin/financial-reports', icon: BarChart3 },
    ],
  },
  {
    section: 'CRM',
    items: [
      { label: 'CRM Pipeline', href: '/admin/crm', icon: Contact },
      { label: 'Leads', href: '/admin/leads', icon: Target },
      { label: 'Segments', href: '/admin/segments', icon: Grid3X3 },
      { label: 'B2B / Wholesale', href: '/admin/b2b', icon: Building },
    ],
  },
  {
    section: 'OPERATIONS',
    items: [
      { label: 'Shipping', href: '/admin/shipping', icon: Truck },
      { label: 'Carriers', href: '/admin/carriers', icon: TruckIcon },
      { label: 'Delivery Boys', href: '/admin/delivery-boys', icon: Users2 },
      { label: 'Field Team', href: '/admin/field-team', icon: Wrench },
      { label: 'Dropshipping', href: '/admin/dropshipping', icon: GitBranch },
    ],
  },
  {
    section: 'AI & AUTOMATION',
    items: [
      { label: 'AI Tools', href: '/admin/ai-tools', icon: Bot },
      { label: 'UGC Video Creator', href: '/admin/ugc-video', icon: Video },
      { label: 'Voice Agent', href: '/admin/voice-agent', icon: Radio },
      { label: 'Feature Flags', href: '/admin/feature-flags', icon: Flag },
      { label: 'Plugin Manager', href: '/admin/plugin-manager', icon: Puzzle },
      { label: 'Automation Flows', href: '/admin/automation-flows', icon: GitBranch },
      { label: 'Site Doctor', href: '/admin/site-doctor', icon: Heart },
    ],
  },
  {
    section: 'CONTENT & DESIGN',
    items: [
      { label: 'Homepage Builder', href: '/admin/homepage-builder', icon: LayoutDashboard },
      { label: 'Page Builder', href: '/admin/page-builder', icon: Layers },
      { label: 'Menu Builder', href: '/admin/menu-builder', icon: Menu },
      { label: 'Footer Builder', href: '/admin/footer-builder', icon: Cpu },
      { label: 'Banner Builder', href: '/admin/banner-builder', icon: Image },
      { label: 'Email Builder', href: '/admin/email-builder', icon: Mail },
      { label: 'Media Library', href: '/admin/media-library', icon: Image },
      { label: 'Themes', href: '/admin/themes', icon: Palette },
    ],
  },
  {
    section: 'VENDOR MARKETPLACE',
    items: [
      { label: 'Vendors', href: '/admin/vendor-marketplace', icon: Store },
      { label: 'Vendor Ads', href: '/admin/vendor-marketplace#ads', icon: Megaphone },
      { label: 'Vendor Payouts', href: '/admin/vendor-marketplace#payouts', icon: DollarSign },
    ],
  },
  {
    section: 'SYSTEM',
    items: [
      { label: 'Settings', href: '/admin/settings', icon: Settings },
      { label: 'API Vault', href: '/admin/api-vault', icon: Key },
      { label: 'Role Manager', href: '/admin/role-manager', icon: UserCog },
      { label: 'Staff Accounts', href: '/admin/staff', icon: Users },
      { label: 'Activity Log', href: '/admin/activity-log', icon: Activity },
      { label: 'Security', href: '/admin/security', icon: Lock },
      { label: 'Google Integrations', href: '/admin/google-integrations', icon: Globe },
      { label: 'Bing Integrations', href: '/admin/bing-integrations', icon: Search },
      { label: 'Analytics Settings', href: '/admin/analytics-settings', icon: BarChart3 },
    ],
  },
]

interface AdminSidebarProps {
  userRole: UserRole
}

function NavItemComponent({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)

  const isActive = item.href ? (pathname === item.href || pathname.startsWith(item.href + '/')) : false
  const hasChildren = !!item.children?.length

  if (hasChildren) {
    const isAnyChildActive = item.children?.some((c) => c.href && pathname.startsWith(c.href))
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left',
            isAnyChildActive ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'
          )}
        >
          <item.icon className="w-4 h-4 shrink-0" />
          <span className="font-manrope text-[13px] flex-1">{item.label}</span>
          <ChevronDown className={cn('w-3.5 h-3.5 transition-transform shrink-0', expanded && 'rotate-180')} />
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden pl-4">
              {item.children!.map((child) => (
                <NavItemComponent key={child.href} item={child} depth={depth + 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <Link
      href={item.href!}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors',
        isActive ? 'text-white bg-white/15 font-600' : 'text-white/60 hover:text-white hover:bg-white/5'
      )}
    >
      <item.icon className="w-4 h-4 shrink-0" />
      <span className="font-manrope text-[13px]">{item.label}</span>
      {item.badge && (
        <span className="ml-auto bg-brand-red text-white text-[9px] font-700 rounded-full px-1.5 py-0.5 font-syne">{item.badge}</span>
      )}
    </Link>
  )
}

export default function AdminSidebar({ userRole }: AdminSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const sidebar = (
    <div className={cn('admin-sidebar flex flex-col h-full transition-all duration-300', collapsed ? 'w-14' : 'w-60')}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 shrink-0">
        <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center shrink-0">
          <span className="font-syne font-700 text-white text-sm">RS</span>
        </div>
        {!collapsed && (
          <div>
            <div className="font-syne font-700 text-white text-sm leading-tight">Roshanal</div>
            <div className="text-white/50 text-[10px] font-manrope">Admin Panel</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-white/50 hover:text-white transition-colors hidden md:block"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-4 scrollbar-none">
        {NAV_STRUCTURE.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !item.roles || item.roles.includes(userRole)
          )
          if (!visibleItems.length) return null

          return (
            <div key={section.section}>
              {!collapsed && (
                <div className="px-3 mb-1 text-[9px] font-700 uppercase tracking-[0.15em] text-white/30 font-manrope">
                  {section.section}
                </div>
              )}
              <div className="space-y-0.5">
                {visibleItems.map((item) => (
                  <NavItemComponent key={item.label} item={item} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 px-3 py-3 shrink-0">
        <div className={cn('flex items-center gap-2', collapsed && 'justify-center')}>
          <div className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center shrink-0">
            <Users className="w-3.5 h-3.5 text-white/60" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-white text-xs font-manrope font-600 truncate">Admin User</div>
              <div className="text-white/40 text-[10px] font-manrope capitalize">{userRole.replace('_', ' ')}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block">{sidebar}</div>

      {/* Mobile: hamburger + drawer */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-brand-navy rounded-lg flex items-center justify-center text-white shadow-float"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="md:hidden fixed inset-y-0 left-0 z-50"
            >
              <div className="relative">
                {sidebar}
                <button
                  className="absolute top-4 right-2 text-white/60 hover:text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
