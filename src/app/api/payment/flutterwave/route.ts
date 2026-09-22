import { NextRequest, NextResponse } from 'next/server'
import { initializePayment } from '@/lib/flutterwave'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as {
      amountKobo: number
      email: string
      reference: string
      name: string
      phone?: string
      callbackUrl?: string
      metadata?: Record<string, unknown>
    }

    const { amountKobo, email, reference, name, phone, callbackUrl, metadata } = body

    if (!amountKobo || !email || !reference || !name) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields: amountKobo, email, reference, name' },
        { status: 400 }
      )
    }

    const data = await initializePayment({
      amountKobo,
      email,
      reference,
      name,
      phone,
      callbackUrl: callbackUrl ?? '',
      metadata,
    })

    if (data.status !== 'success') {
      return NextResponse.json(
        { ok: false, error: data.message || 'Payment initialization failed' },
        { status: 400 }
      )
    }

    return NextResponse.json({ ok: true, paymentUrl: data.data.link })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Payment initialization failed'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
