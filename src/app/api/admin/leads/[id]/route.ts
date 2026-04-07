import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await context.params

    const { data, error } = await adminDb
      .from('leads')
      .select('*, assigned_staff:assigned_to(name)')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json({ lead: data })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await context.params
    const body = await request.json()

    const updates: Record<string, unknown> = {}
    if (body.score !== undefined) updates.score = body.score
    if (body.status !== undefined) updates.status = body.status
    if (body.assigned_to !== undefined) updates.assigned_to = body.assigned_to
    if (body.next_follow_up !== undefined) updates.next_follow_up = body.next_follow_up
    if (body.notes !== undefined) updates.notes = body.notes
    if (body.name !== undefined) updates.name = body.name
    if (body.email !== undefined) updates.email = body.email
    if (body.phone !== undefined) updates.phone = body.phone
    if (body.company !== undefined) updates.company = body.company

    const { data, error } = await adminDb
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await adminDb.from('activity_logs').insert({
      action: 'lead_updated',
      resource_type: 'lead',
      resource_id: id,
      metadata: updates,
    })

    return NextResponse.json({ lead: data })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await context.params

    const { error } = await adminDb
      .from('leads')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await adminDb.from('activity_logs').insert({
      action: 'lead_deleted',
      resource_type: 'lead',
      resource_id: id,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
