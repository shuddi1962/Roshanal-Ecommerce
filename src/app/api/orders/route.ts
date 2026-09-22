import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'
import { initializePayment } from '@/lib/paystack'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { generateOrderNumber } from '@/lib/utils'
import type { OrderStatus, PaymentStatus } from '@/types/database'

const PAYMENT_GATEWAY_MAP: Record<string, string> = {
  card: 'paystack', bank_transfer: 'paystack', ussd: 'paystack',
  mobile_money: 'flutterwave', crypto: 'nowpayments',
  wallet: 'wallet', cod: 'cod', voice: 'voice',
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 50)
  const offset = (page - 1) * limit

  let query = adminDb
    .from('orders')
    .select('id, order_number, status, payment_status, total_kobo, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (userId && userId !== 'me') query = query.eq('user_id', userId)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ orders: data ?? [], total: count ?? 0, page })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as {
      orderNumber?: string; shippingAddress: {
        name: string; email: string; phone: string
        address: string; city: string; state: string; lga: string
      }
      paymentMethod: string; shippingMethod: string; branchId?: string
      totalKobo: number; shippingKobo: number
      couponCode?: string; discountKobo?: number
    }

    const { shippingAddress, paymentMethod, shippingMethod: _sm, branchId, totalKobo, shippingKobo, couponCode, discountKobo = 0 } = body

    if (!shippingAddress?.name || !shippingAddress?.email || !shippingAddress?.phone) {
      return NextResponse.json({ error: 'Missing required shipping details' }, { status: 400 })
    }

    const orderNumber = body.orderNumber ?? generateOrderNumber()
    const gateway = PAYMENT_GATEWAY_MAP[paymentMethod] ?? 'paystack'
    const subtotalKobo = totalKobo - shippingKobo
    const vatKobo = Math.round(subtotalKobo * 0.075)

    const { data: order, error: orderError } = await adminDb
      .from('orders')
      .insert({
        order_number: orderNumber,
        status: 'pending' as OrderStatus,
        payment_status: paymentMethod === 'cod' ? 'cod_pending' as PaymentStatus : 'pending' as PaymentStatus,
        payment_method: paymentMethod,
        gateway,
        subtotal_kobo: subtotalKobo,
        discount_kobo: discountKobo,
        shipping_kobo: shippingKobo,
        vat_kobo: vatKobo,
        total_kobo: totalKobo,
        currency_code: 'NGN',
        currency_rate: 1,
        shipping_address: shippingAddress,
        fulfillment_branch_id: branchId ?? null,
        notes: couponCode ? `Coupon: ${couponCode}` : null,
      })
      .select('id, order_number')
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    if (['card', 'bank_transfer', 'ussd'].includes(paymentMethod)) {
      const paystackEnabled = await isFeatureEnabled('paystack')
      if (paystackEnabled) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://roshanalglobal.com'
          const payment = await initializePayment({
            amountKobo: totalKobo,
            email: shippingAddress.email,
            reference: orderNumber,
            callbackUrl: `${baseUrl}/checkout/confirmation?ref=${orderNumber}`,
            metadata: { orderId: order.id, orderNumber: order.order_number, customerName: shippingAddress.name },
          })

          if (payment.status && payment.data.authorization_url) {
            return NextResponse.json({
              ok: true, orderNumber, paymentUrl: payment.data.authorization_url,
            })
          }
        } catch (err) {
          console.error('[Orders] Paystack initialization failed:', err)
        }
      }
    }

    return NextResponse.json({ ok: true, orderNumber })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
