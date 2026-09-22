'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ShoppingBag, Heart, Wallet, Trophy, MessageSquare, BarChart2,
  MapPin, RotateCcw, Bell, Settings, Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccountSidebarProps {
  user: { name: string; email: string; role: string; avatar: string | null }
}

const NAV = [
  { label: 'Overview', href: '/account/dashboard', icon: LayoutDashboard },
  { label: 'My Orders', href: '/account/orders', icon: ShoppingBag },
  { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
  { label: 'Wallet', href: '/account/wallet', icon: Wallet },
  { label: 'Loyalty Points', href: '/account/loyalty', icon: Trophy },
  { label: 'Shopping Assistant', href: '/account/dashboard#chat', icon: MessageSquare },
  { label: 'Compare', href: '/account/compare', icon: BarChart2 },
  { label: 'Addresses', href: '/account/addresses', icon: MapPin },
  { label: 'Returns & RMA', href: '/account/returns', icon: RotateCcw },
  { label: 'Notifications', href: '/account/notifications', icon: Bell },
  { label: 'Affiliate Program', href: '/account/affiliate', icon: Users },
  { label: 'Settings', href: '/account/settings', icon: Settings },
]

export default function AccountSidebar({ user }: AccountSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:block w-56 shrink-0">
      {/* User profile card */}
      <div className="bg-white rounded-xl border border-brand-border p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-brand-blue rounded-full flex items-center justify-center">
            <span className="font-syne font-700 text-white">
              {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <div className="font-syne font-700 text-text-1 text-sm truncate">{user.name}</div>
            <div className="font-manrope text-text-4 text-xs truncate">{user.email}</div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 rounded-lg px-3 py-1.5 text-xs font-manrope text-amber-700 flex items-center gap-1.5">
          <Trophy className="w-3 h-3" />
          <span className="capitalize">{user.role.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Nav */}
      <div className="bg-white rounded-xl border border-brand-border p-2">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm',
              pathname === item.href || pathname.startsWith(item.href + '/')
                ? 'bg-blue-50 text-brand-blue font-manrope font-600'
                : 'text-text-2 font-manrope hover:bg-brand-offwhite'
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </Link>
        ))}
      </div>
    </aside>
  )
}
