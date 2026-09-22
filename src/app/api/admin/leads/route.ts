import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const source = searchParams.get('source')
    const assignedTo = searchParams.get('assigned_to')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = (page - 1) * limit

    let query = adminDb
      .from('leads')
      .select('*, assigned_staff:assigned_to(name)', { count: 'exact' })

    if (status) query = query.eq('status', status)
    if (source) query = query.eq('source', source)
    if (assignedTo) query = query.eq('assigned_to', assignedTo)

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ leads: data ?? [], total: count ?? 0, page })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { name, email, phone, company, source, score = 50 } = body

    if (!name || !source) {
      return NextResponse.json({ error: 'Name and source are required' }, { status: 400 })
    }

    const { data, error } = await adminDb
      .from('leads')
      .insert({
        name,
        email: email || null,
        phone: phone || null,
        company: company || null,
        source,
        score,
        status: 'new',
        assigned_to: null,
        next_follow_up: null,
        notes: null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await adminDb.from('activity_logs').insert({
      action: 'lead_created',
      resource_type: 'lead',
      resource_id: data.id,
      metadata: { name, source, score },
    })

    return NextResponse.json({ lead: data }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
