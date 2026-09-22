import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'
import { validateFlutterwaveWebhook } from '@/lib/flutterwave'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.text()
    const signature = request.headers.get('verif-hash') ?? ''
    const secretKey = process.env.FLUTTERWAVE_WEBHOOK_SECRET ?? ''

    if (!secretKey) {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    if (!validateFlutterwaveWebhook(body, signature, secretKey)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(body) as {
      event: string
      data: {
        id: number
        tx_ref: string
        status: string
        amount: number
        currency: string
        customer: { email: string; name: string }
      }
    }

    const { event, data } = payload

    if (event === 'charge.completed' && data.status === 'successful') {
      const { tx_ref, amount, customer } = data

      const { data: order } = await adminDb
        .from('orders')
        .update({
          payment_status: 'paid',
          payment_reference: tx_ref,
          status: 'confirmed',
        })
        .eq('order_number', tx_ref)
        .select('id, order_number, total_kobo')
        .single()

      if (order) {
        await adminDb.from('transactions').insert({
          order_id: order.id,
          type: 'payment',
          amount_kobo: Math.round(amount * 100), // Convert NGN to kobo
          reference: tx_ref,
          gateway: 'flutterwave',
          status: 'success',
          metadata: { customer, transaction_id: data.id },
        })
      }
    }

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook processing failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
