import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'
import { generateOrderNumber } from '@/lib/utils'

interface SaleItem {
  productId: string
  variantId?: string
  quantity: number
  unitPriceKobo: number
}

interface SaleRequest {
  items: SaleItem[]
  customerId?: string
  branchId: string
  paymentMethod: string
  amountPaidKobo?: number
  notes?: string
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as SaleRequest
    const { items, customerId, branchId, paymentMethod, amountPaidKobo, notes } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }
    if (!branchId) {
      return NextResponse.json({ error: 'Branch ID is required' }, { status: 400 })
    }
    if (!paymentMethod) {
      return NextResponse.json({ error: 'Payment method is required' }, { status: 400 })
    }

    const orderNumber = generateOrderNumber()
    const subtotalKobo = items.reduce((sum, item) => sum + (item.unitPriceKobo * item.quantity), 0)
    const vatKobo = Math.round(subtotalKobo * 0.075)
    const totalKobo = subtotalKobo + vatKobo

    if (paymentMethod === 'wallet' && customerId) {
      const { data: customer } = await adminDb
        .from('users')
        .select('wallet_balance_kobo')
        .eq('id', customerId)
        .single()

      if (!customer || customer.wallet_balance_kobo < totalKobo) {
        return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 })
      }

      const { error: walletError } = await adminDb
        .from('users')
        .update({ wallet_balance_kobo: customer.wallet_balance_kobo - totalKobo })
        .eq('id', customerId)

      if (walletError) {
        return NextResponse.json({ error: 'Failed to deduct wallet balance' }, { status: 500 })
      }
    }

    const { data: order, error: orderError } = await adminDb
      .from('orders')
      .insert({
        user_id: customerId || null,
        order_number: orderNumber,
        status: 'confirmed',
        payment_status: paymentMethod === 'paystack' ? 'pending' : 'paid',
        payment_method: paymentMethod,
        subtotal_kobo: subtotalKobo,
        discount_kobo: 0,
        shipping_kobo: 0,
        vat_kobo: vatKobo,
        total_kobo: totalKobo,
        currency_code: 'NGN',
        currency_rate: 1,
        shipping_address: {},
        billing_address: null,
        fulfillment_branch_id: branchId,
        notes: notes || null,
      })
      .select()
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: orderError?.message || 'Failed to create order' }, { status: 500 })
    }

    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      variant_id: item.variantId || null,
      vendor_id: null,
      quantity: item.quantity,
      unit_price_kobo: item.unitPriceKobo,
      total_price_kobo: item.unitPriceKobo * item.quantity,
      product_snapshot: {},
    }))

    const { error: itemsError } = await adminDb.from('order_items').insert(orderItems)
    if (itemsError) {
      return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 })
    }

    for (const item of items) {
      const { data: inventory } = await adminDb
        .from('inventory')
        .select('id, quantity')
        .eq('product_id', item.productId)
        .eq('branch_id', branchId)
        .maybeSingle()

      if (inventory) {
        const newQty = Math.max(0, inventory.quantity - item.quantity)
        await adminDb
          .from('inventory')
          .update({ quantity: newQty })
          .eq('id', inventory.id)
      }
    }

    const changeKobo = paymentMethod === 'cash' && amountPaidKobo && amountPaidKobo > totalKobo
      ? amountPaidKobo - totalKobo
      : 0

    await adminDb.from('activity_logs').insert({
      user_id: customerId || null,
      staff_id: null,
      action: 'pos_sale_completed',
      resource_type: 'order',
      resource_id: order.id,
      metadata: {
        order_number: orderNumber,
        total_kobo: totalKobo,
        payment_method: paymentMethod,
        item_count: items.length,
      },
    })

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      orderNumber,
      changeKobo,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
