import { NextRequest, NextResponse } from 'next/server'
import { getApiKey } from '@/lib/api-vault'
import { adminDb } from '@/lib/db'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.text()
  const signature = request.headers.get('x-paystack-signature') ?? ''

  const secretKey = await getApiKey('paystack', 'secret_key')
  if (!secretKey) return NextResponse.json({ error: 'Gateway not configured' }, { status: 500 })

  const { createHmac } = require('crypto') as { createHmac: (alg: string, key: string) => { update: (s: string) => { digest: (enc: string) => string } } }
  const hash = createHmac('sha512', secretKey).update(body).digest('hex')
  if (hash !== signature) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })

  const payload = JSON.parse(body) as {
    event: string
    data: {
      reference: string; status: string; amount: number
      customer: { email: string; name: string }
    }
  }

  if (payload.event === 'charge.success') {
    const { reference, amount, customer } = payload.data

    const { data: order } = await adminDb
      .from('orders')
      .update({ payment_status: 'paid', payment_reference: reference, status: 'confirmed' })
      .eq('order_number', reference)
      .select('id, order_number, total_kobo, shipping_address')
      .single()

    if (order) {
      await adminDb.from('transactions').insert({
        order_id: order.id, type: 'payment', amount_kobo: amount,
        reference, gateway: 'paystack', status: 'success',
        metadata: { customer },
      })
    }
  }

  return NextResponse.json({ ok: true })
}
