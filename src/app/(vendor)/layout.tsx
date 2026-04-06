import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { isFeatureEnabled } from '@/lib/feature-flags'

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  // Check if multivendor is enabled
  const vendorEnabled = await isFeatureEnabled('vendor_marketplace')
  if (!vendorEnabled) {
    redirect('/')
  }

  const session = await auth()
  if (!session?.user || session.user.role !== 'vendor') {
    redirect('/auth/login?callbackUrl=/vendor/dashboard')
  }

  return (
    <div className="min-h-screen bg-brand-offwhite flex">
      <aside className="w-56 bg-brand-navy text-white min-h-screen shrink-0">
        <div className="px-4 py-4 border-b border-white/10">
          <div className="font-syne font-700 text-white text-sm">Vendor Dashboard</div>
          <div className="font-manrope text-white/50 text-xs mt-0.5">{session.user.name}</div>
        </div>
        <nav className="px-2 py-4 space-y-0.5">
          {[
            { label: 'Overview', href: '/vendor/dashboard' },
            { label: 'Products', href: '/vendor/products' },
            { label: 'Orders', href: '/vendor/orders' },
            { label: 'Customers', href: '/vendor/customers' },
            { label: 'Shipping', href: '/vendor/shipping' },
            { label: 'Advertising', href: '/vendor/ads' },
            { label: 'Payouts', href: '/vendor/payouts' },
            { label: 'Analytics', href: '/vendor/analytics' },
            { label: 'Shop Settings', href: '/vendor/shop-settings' },
          ].map((item) => (
            <a key={item.href} href={item.href}
              className="flex items-center px-3 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 text-sm font-manrope transition-colors">
              {item.label}
            </a>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
