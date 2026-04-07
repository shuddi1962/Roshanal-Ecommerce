import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params

    const { data, error } = await adminDb
      .from('coupons')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    return NextResponse.json({ coupon: { ...data, code: data.code.toUpperCase() } })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch coupon' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
    const body = await request.json()

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (body.code) updates.code = body.code.toUpperCase()
    if (body.type) updates.type = body.type
    if (typeof body.value === 'number') updates.value = body.value
    if (typeof body.min_order_kobo === 'number') updates.min_order_kobo = body.min_order_kobo
    if ('max_uses' in body) updates.max_uses = body.max_uses || null
    if ('product_ids' in body) updates.product_ids = body.product_ids?.length ? body.product_ids : null
    if ('category_ids' in body) updates.category_ids = body.category_ids?.length ? body.category_ids : null
    if ('user_id' in body) updates.user_id = body.user_id || null
    if ('expires_at' in body) updates.expires_at = body.expires_at || null
    if (typeof body.is_active === 'boolean') updates.is_active = body.is_active

    const { data, error } = await adminDb
      .from('coupons')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ coupon: data })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params

    const { error } = await adminDb.from('coupons').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 })
  }
}
