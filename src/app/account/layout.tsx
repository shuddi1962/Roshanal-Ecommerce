"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Heart,
  Wallet,
  Trophy,
  MapPin,
  RotateCcw,
  Settings,
  Bell,
  Users,
  GitCompare,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Menu,
  X,
  User,
} from "lucide-react";

const sidebarLinks = [
  { label: "Overview", href: "/account/dashboard", icon: LayoutDashboard },
  { label: "My Orders", href: "/account/orders", icon: Package },
  { label: "Wishlist", href: "/account/wishlist", icon: Heart },
  { label: "Compare", href: "/account/compare", icon: GitCompare },
  { label: "Wallet", href: "/account/wallet", icon: Wallet },
  { label: "Loyalty & Rewards", href: "/account/loyalty", icon: Trophy },
  { label: "Addresses", href: "/account/addresses", icon: MapPin },
  { label: "Returns & RMA", href: "/account/returns", icon: RotateCcw },
  { label: "Notifications", href: "/account/notifications", icon: Bell },
  { label: "Affiliate Dashboard", href: "/account/affiliate", icon: Users },
  { label: "Settings", href: "/account/settings", icon: Settings },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-white font-bold text-lg tracking-tight">RS</div>
              <div className="text-blue-100 text-xs">Customer Portal</div>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-blue-200 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="p-4 border-b border-slate-200">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                TC
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-900">Test Customer</h3>
                <p className="text-xs text-slate-500">customer@test.com</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-white/50 rounded-lg backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Premium Member</span>
              <span className="text-xs text-slate-500 ml-auto">1,250 pts</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm"
                }`}
              >
                <Icon className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'
                }`} />
                {link.label}
                {isActive && <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-all duration-200">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-72">
        {/* Top Navigation */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="hidden lg:block">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-slate-900 font-medium">My Account</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                  TC
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-semibold text-slate-900">Test Customer</div>
                  <div className="text-xs text-slate-500">customer@test.com</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-[calc(100vh-80px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
