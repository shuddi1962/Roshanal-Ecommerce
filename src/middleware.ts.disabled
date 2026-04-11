import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const ADMIN_PATHS = ['/admin', '/pos']
const ACCOUNT_PATHS = ['/account']
const AUTH_PATHS = ['/auth/login', '/auth/register']

const ADMIN_ROLES = ['super_admin', 'admin', 'manager', 'inventory_manager', 'pos_cashier', 'support_agent']
const VENDOR_ROLES = ['super_admin', 'admin', 'manager', 'vendor']
const CUSTOMER_ROLES = ['customer', 'vendor', 'super_admin', 'admin', 'manager']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const token = request.cookies.get('rg_session')?.value

  let session = null
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? 'fallback')
      const { payload } = await jwtVerify(token, secret)
      session = payload
    } catch {
      session = null
    }
  }

  // Auth pages — redirect if already logged in
  if (AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    if (session) {
      const role = (session.role as string) ?? ''
      if (ADMIN_ROLES.includes(role)) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      if (VENDOR_ROLES.includes(role)) {
        return NextResponse.redirect(new URL('/vendor', request.url))
      }
      return NextResponse.redirect(new URL('/account', request.url))
    }
    return NextResponse.next()
  }

  // Admin routes — require admin role
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    const role = (session.role as string) ?? ''
    if (!ADMIN_ROLES.includes(role)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Account routes — require customer or above
  if (ACCOUNT_PATHS.some((p) => pathname.startsWith(p))) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    const role = (session.role as string) ?? ''
    if (!CUSTOMER_ROLES.includes(role)) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    return NextResponse.next()
  }

  // Vendor routes
  if (pathname.startsWith('/vendor')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    const role = (session.role as string) ?? ''
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
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const role = (session.role as string) ?? ''
      if (!ADMIN_ROLES.includes(role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    if (pathname.startsWith('/api/account')) {
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*', '/auth/:path*', '/vendor/:path*', '/api/:path*'],
}
