import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'
import { initializePayment } from '@/lib/paystack'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { generateOrderNumber } from '@/lib/utils'

interface OrderRequest {
  orderNumber?: string
  shippingAddress: {
    name: string; email: string; phone: string
    address: string; city: string; state: string; lga: string
  }
  paymentMethod: string
  shippingMethod: string
  branchId?: string
  totalKobo: number
  shippingKobo: number
  couponCode?: string
  discountKobo?: number
}

/**
 * Payment method → Gateway mapping (hidden from customer)
 * Customers see friendly names; we map internally to gateways.
 */
const PAYMENT_GATEWAY_MAP: Record<string, string> = {
  card: 'paystack',
  bank_transfer: 'paystack',
  ussd: 'paystack',
  mobile_money: 'flutterwave',
  crypto: 'nowpayments',
  wallet: 'wallet',
  cod: 'cod',
  voice: 'voice',
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as OrderRequest

  const {
    shippingAddress, paymentMethod, shippingMethod, branchId,
    totalKobo, shippingKobo, couponCode, discountKobo = 0,
  } = body

  if (!shippingAddress.name || !shippingAddress.email || !shippingAddress.phone) {
    return NextResponse.json({ error: 'Missing required shipping details' }, { status: 400 })
  }

  const orderNumber = generateOrderNumber()
  const gateway = PAYMENT_GATEWAY_MAP[paymentMethod] ?? 'paystack'
  const subtotalKobo = totalKobo - shippingKobo
  const vatKobo = Math.round(subtotalKobo * 0.075) // 7.5% VAT

  // Create order in pending state
  const { data: order, error: orderError } = await adminDb
    .from('orders')
    .insert({
      order_number: orderNumber,
      status: 'pending',
      payment_status: paymentMethod === 'cod' ? 'cod_pending' : 'pending',
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
    })
    .select('id, order_number')
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }

  // For online payment methods, initialize payment
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
          metadata: {
            orderId: order.id,
            orderNumber: order.order_number,
            customerName: shippingAddress.name,
          },
        })

        if (payment.status && payment.data.authorization_url) {
          return NextResponse.json({
            ok: true,
            orderNumber,
            paymentUrl: payment.data.authorization_url,
          })
        }
      } catch (err) {
        // Log but don't fail — order is created, can retry payment
        console.error('[Orders] Paystack initialization failed:', err)
      }
    }
  }

  return NextResponse.json({ ok: true, orderNumber })
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const orderId = request.nextUrl.searchParams.get('id')
  const orderNumber = request.nextUrl.searchParams.get('number')

  let query = adminDb.from('orders').select(`
    id, order_number, status, payment_status, total_kobo, currency_code,
    shipping_address, created_at,
    order_items(id, product_id, quantity, unit_price_kobo, total_price_kobo, product_snapshot)
  `)

  if (orderId) query = query.eq('id', orderId)
  if (orderNumber) query = query.eq('order_number', orderNumber)

  const { data, error } = await query.single()

  if (error || !data) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  return NextResponse.json({ order: data })
}
