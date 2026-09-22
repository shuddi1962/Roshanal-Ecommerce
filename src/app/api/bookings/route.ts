import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'
import { generateQuoteNumber } from '@/lib/utils'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100)
  const offset = (page - 1) * limit

  let query = adminDb.from('bookings').select('*, users:user_id(name, email)', { count: 'exact' })

  if (status) query = query.eq('status', status)

  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ bookings: data ?? [], total: count ?? 0, page })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()

    const {
      userId, serviceTypeId, date, timeSlot, address,
      depositPaidKobo, balanceDueKobo, totalKobo, notes,
    } = body

    if (!userId || !serviceTypeId || !date || !timeSlot || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await adminDb
      .from('bookings')
      .insert({
        user_id: userId,
        service_type_id: serviceTypeId,
        staff_id: body.staffId || null,
        date,
        time_slot: timeSlot,
        status: depositPaidKobo > 0 ? 'deposit_paid' : 'pending',
        deposit_paid_kobo: depositPaidKobo ?? 0,
        balance_due_kobo: balanceDueKobo ?? 0,
        total_kobo: totalKobo ?? 0,
        address,
        notes: notes || null,
        customer_uploaded_files: [],
        completion_photos: [],
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ booking: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
