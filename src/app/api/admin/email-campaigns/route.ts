import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    let query = adminDb
      .from('email_campaigns')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      campaigns: data ?? [],
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    })
  } catch (error) {
    console.error('Failed to fetch email campaigns:', error)
    return NextResponse.json({ error: 'Failed to fetch email campaigns' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      subject,
      preview_text,
      from_name,
      from_email,
      template,
      audience,
      scheduled_at,
      content_html,
      status = 'draft',
    } = body

    if (!name || !subject || !from_name || !from_email || !template || !audience) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await adminDb
      .from('email_campaigns')
      .insert({
        name,
        subject,
        preview_text: preview_text || null,
        from_name,
        from_email,
        template,
        audience,
        scheduled_at: scheduled_at || null,
        content_html: content_html || null,
        status,
        recipients_count: 0,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ id: data.id, campaign: data, message: 'Campaign created successfully' }, { status: 201 })
  } catch (error) {
    console.error('Failed to create email campaign:', error)
    return NextResponse.json({ error: 'Failed to create email campaign' }, { status: 500 })
  }
}