import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as { code: string; subtotal: number }
  const { code, subtotal } = body

  const { data: coupon } = await db
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (!coupon) {
    return NextResponse.json({ error: 'Invalid or expired coupon code' }, { status: 400 })
  }

  const now = new Date()
  if (coupon.expires_at && new Date(coupon.expires_at as string) < now) {
    return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 })
  }

  if (coupon.max_uses && (coupon.uses_count as number) >= (coupon.max_uses as number)) {
    return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 400 })
  }

  if (subtotal < (coupon.min_order_kobo as number)) {
    const min = (coupon.min_order_kobo as number) / 100
    return NextResponse.json({ error: `Minimum order of ₦${min.toLocaleString()} required` }, { status: 400 })
  }

  let discount = 0
  if (coupon.type === 'percentage') {
    discount = Math.round(subtotal * ((coupon.value as number) / 100))
  } else {
    discount = Math.round((coupon.value as number) * 100) // value is in naira
  }

  return NextResponse.json({ ok: true, discount, couponId: coupon.id })
}
