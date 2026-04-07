import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    let query = adminDb
      .from('banners')
      .select('*', { count: 'exact' })
      .order('sort_order', { ascending: true })
      .range((page - 1) * limit, page * limit - 1)

    if (position) {
      query = query.eq('position', position)
    }

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      banners: data ?? [],
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    })
  } catch (error) {
    console.error('Failed to fetch banners:', error)
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      image_url,
      link_url,
      position,
      sizes,
      sort_order,
      is_active,
      starts_at,
      ends_at,
      popup_trigger,
    } = body

    if (!title || !image_url || !link_url || !position) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await adminDb
      .from('banners')
      .insert({
        title,
        image_url,
        link_url,
        position,
        sizes: sizes || '{}',
        sort_order: sort_order || 0,
        is_active: is_active ?? true,
        starts_at: starts_at || null,
        ends_at: ends_at || null,
        popup_trigger: popup_trigger || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(
      { id: data.id, banner: data, message: 'Banner created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to create banner:', error)
    return NextResponse.json(
      { error: 'Failed to create banner' },
      { status: 500 }
    )
  }
}