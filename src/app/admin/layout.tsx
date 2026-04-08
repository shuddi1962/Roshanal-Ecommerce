import React from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminTopbar from '@/components/admin/AdminTopbar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  // Only allow admin-role users
  const adminRoles = [
    'super_admin', 'store_manager', 'accountant', 'marketing_manager',
    'technical_team', 'field_technical_team', 'customer_support',
    'content_editor', 'delivery_boy', 'warehouse_staff',
    'location_manager', 'sales_staff',
  ]

  if (!session?.user || !adminRoles.includes(session.user.role)) {
    redirect('/auth/login?callbackUrl=/admin/dashboard')
  }

  return (
    <div className="flex h-screen bg-brand-offwhite overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar userRole={session.user.role} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopbar user={session.user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
