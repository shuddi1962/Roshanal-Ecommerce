"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Megaphone,
  Ticket,
  Wallet,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Target,
  Headphones,
  Truck,
  Star,
  Zap,
  Shield,
  Globe,
  Palette,
  FileText,
  Bug,
  Building,
  Eye,
  Gift,
  ClipboardList,
  UserCog,
  Hammer,
} from "lucide-react";

const adminNavItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Inventory", href: "/admin/inventory", icon: ClipboardList },
  { label: "Coupons", href: "/admin/coupons", icon: Ticket },
  { label: "Marketing", href: "/admin/marketing", icon: Megaphone },
  { label: "Finance", href: "/admin/finance", icon: Wallet },
  { label: "Vendors", href: "/admin/vendors", icon: Building },
  { label: "Field Team", href: "/admin/field-team", icon: Truck },
  { label: "CRM", href: "/admin/crm", icon: Headphones },
  { label: "Leads", href: "/admin/leads", icon: Target },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "POS", href: "/admin/pos", icon: Zap },
  { label: "Site Doctor", href: "/admin/site-doctor", icon: Bug },
  { label: "AI Tools", href: "/admin/ai", icon: Zap },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0C1A36] text-white flex flex-col">
        <div className="p-4 border-b border-blue-800">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-lg">RS</span>
            <span className="font-semibold">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
                  isActive
                    ? "bg-[#1641C4] text-white"
                    : "text-blue-200 hover:bg-blue-800 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-blue-800">
          <Link href="/" className="flex items-center gap-2 text-sm text-blue-200 hover:text-white">
            <Globe className="w-4 h-4" />
            Back to Store
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                A
              </div>
              <span className="text-sm font-medium">Admin</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
