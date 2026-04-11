import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

const ADMIN_PATHS = ['/admin', '/pos']
const ACCOUNT_PATHS = ['/account']
const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/callback']

const ADMIN_ROLES = ['super_admin', 'store_manager', 'accountant', 'marketing_manager', 'technical_team', 'field_technical_team', 'location_manager', 'sales_staff', 'customer_support', 'content_editor', 'warehouse_staff', 'delivery_boy']
const VENDOR_ROLES = ['super_admin', 'store_manager', 'vendor']
const CUSTOMER_ROLES = ['customer', 'b2b_customer', 'vendor', 'super_admin', 'store_manager']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get session using NextAuth
  const session = await auth()

  // Auth pages — redirect if already logged in
  if (AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    if (session?.user) {
      const role = session.user.role
      if (ADMIN_ROLES.includes(role)) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
      if (VENDOR_ROLES.includes(role)) {
        return NextResponse.redirect(new URL('/vendor/dashboard', request.url))
      }
      return NextResponse.redirect(new URL('/account/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Admin routes — require admin role
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    const role = session.user.role
    if (!ADMIN_ROLES.includes(role)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Account routes — require customer or above
  if (ACCOUNT_PATHS.some((p) => pathname.startsWith(p))) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    const role = session.user.role
    if (!CUSTOMER_ROLES.includes(role)) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    return NextResponse.next()
  }

  // Vendor routes
  if (pathname.startsWith('/vendor')) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    const role = session.user.role
    if (!VENDOR_ROLES.includes(role)) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // API auth routes — validate session token
  if (pathname.startsWith('/api/')) {
    if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/public') || pathname.startsWith('/api/geo') || pathname.startsWith('/api/currency') || pathname.startsWith('/api/health')) {
      return NextResponse.next()
    }

    if (pathname.startsWith('/api/admin')) {
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const role = session.user.role
      if (!ADMIN_ROLES.includes(role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    if (pathname.startsWith('/api/account')) {
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*', '/vendor/:path*', '/api/:path*'],
}
