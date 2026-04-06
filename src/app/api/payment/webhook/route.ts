import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'
import { getApiKey } from '@/lib/api-vault'
import { validateWebhookSignature } from '@/lib/paystack'
import { sendOrderConfirmation } from '@/lib/resend'
import { emit } from '@/lib/event-bus'

/**
 * Unified payment webhook handler.
 * All payment gateways send webhooks here.
 * Identifies the gateway by X-Gateway header or by payload structure.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const gateway = request.headers.get('x-gateway') ?? 'paystack'
  const body = await request.text()

  if (gateway === 'paystack') {
    return handlePaystackWebhook(request, body)
  }

  return NextResponse.json({ ok: true })
}

async function handlePaystackWebhook(request: NextRequest, body: string): Promise<NextResponse> {
  const signature = request.headers.get('x-paystack-signature') ?? ''
  const secretKey = await getApiKey('paystack', 'secret_key')

  if (!secretKey) {
    return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 })
  }

  // Validate webhook signature
  if (!validateWebhookSignature(body, signature, secretKey)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload = JSON.parse(body) as {
    event: string
    data: {
      reference: string
      status: string
      amount: number
      customer: { email: string; name: string }
    }
  }

  if (payload.event === 'charge.success') {
    const { reference, amount, customer } = payload.data

    // Update order
    const { data: order } = await adminDb
      .from('orders')
      .update({
        payment_status: 'paid',
        payment_reference: reference,
        status: 'confirmed',
      })
      .eq('order_number', reference)
      .select('id, order_number, total_kobo, shipping_address, order_items(product_snapshot, quantity, unit_price_kobo)')
      .single()

    if (order) {
      // Create transaction record
      await adminDb.from('transactions').insert({
        order_id: order.id,
        type: 'payment',
        amount_kobo: amount,
        reference,
        gateway: 'paystack',
        status: 'success',
        metadata: { customer },
      })

      // Emit order paid event (features listen via Event Bus)
      emit('order:paid', { orderId: order.id, reference, gateway: 'paystack' })

      // Send confirmation email
      const shippingAddr = order.shipping_address as { name: string; email: string; address: string; city: string; state: string }
      const items = (order.order_items as Array<{ product_snapshot: { name?: string }; quantity: number; unit_price_kobo: number }>) ?? []

      try {
        await sendOrderConfirmation({
          to: shippingAddr.email ?? customer.email,
          orderNumber: order.order_number,
          customerName: shippingAddr.name ?? customer.name,
          totalFormatted: `₦${(order.total_kobo / 100).toLocaleString('en-NG')}`,
          items: items.map((i) => ({
            name: i.product_snapshot?.name ?? 'Product',
            quantity: i.quantity,
            price: `₦${(i.unit_price_kobo / 100).toLocaleString()}`,
          })),
          deliveryAddress: `${shippingAddr.address}, ${shippingAddr.city}, ${shippingAddr.state}`,
        })
      } catch (emailErr) {
        console.error('[Webhook] Failed to send confirmation email:', emailErr)
      }
    }
  }

  return NextResponse.json({ ok: true })
}
