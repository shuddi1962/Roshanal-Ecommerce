import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const search = searchParams.get('search') || ''

    let query = adminDb.from('coupons').select('*')

    if (type && type !== 'all') {
      query = query.eq('type', type)
    }

    if (status === 'active') {
      query = query.eq('is_active', true).gt('expires_at', new Date().toISOString())
    } else if (status === 'inactive') {
      query = query.eq('is_active', false)
    } else if (status === 'expired') {
      query = query.lt('expires_at', new Date().toISOString())
    }

    if (search) {
      query = query.ilike('code', `%${search}%`)
    }

    const { data: coupons, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculate stats
    const activeCoupons = coupons?.filter((c: { is_active: boolean; expires_at: string | null }) => {
      if (!c.is_active) return false
      if (!c.expires_at) return true
      return new Date(c.expires_at) > new Date()
    }).length ?? 0

    const totalUses = coupons?.reduce((sum: number, c: { used_count: number }) => sum + (c.used_count || 0), 0) ?? 0

    const totalDiscountGiven = coupons?.reduce((sum: number, c: { total_discount_given_kobo: number }) => 
      sum + (c.total_discount_given_kobo || 0), 0) ?? 0

    const expiresSoon = coupons?.filter((c: { expires_at: string | null; is_active: boolean }) => {
      if (!c.expires_at || !c.is_active) return false
      const daysUntilExpiry = Math.ceil((new Date(c.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0
    }).length ?? 0

    const formattedCoupons = coupons?.map((c: {
      id: string
      code: string
      type: 'percentage' | 'fixed'
      value: number
      min_order_kobo: number
      max_uses: number | null
      used_count: number
      expires_at: string | null
      is_active: boolean
      product_ids: string[] | null
      category_ids: string[] | null
      user_id: string | null
      created_at: string
    }) => ({
      ...c,
      remaining_uses: c.max_uses ? c.max_uses - (c.used_count || 0) : null,
      code: c.code.toUpperCase(),
    })) ?? []

    return NextResponse.json({
      coupons: formattedCoupons,
      stats: {
        activeCoupons,
        totalUses,
        totalDiscountGiven,
        expiresSoon,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const {
      code,
      type,
      value,
      min_order_kobo,
      max_uses,
      product_ids,
      category_ids,
      user_id,
      expires_at,
      is_active,
    } = body

    if (!code || !type || typeof value !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await adminDb
      .from('coupons')
      .insert({
        code: code.toUpperCase(),
        type,
        value,
        min_order_kobo: min_order_kobo ?? 0,
        max_uses: max_uses || null,
        product_ids: product_ids?.length ? product_ids : null,
        category_ids: category_ids?.length ? category_ids : null,
        user_id: user_id || null,
        expires_at: expires_at || null,
        is_active: is_active ?? true,
        used_count: 0,
        total_discount_given_kobo: 0,
      })
      .select()
      .single()

    if (error) {
      if (error.message?.includes('unique')) {
        return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ coupon: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
