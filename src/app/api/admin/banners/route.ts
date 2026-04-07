import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'

interface Banner {
  id: string
  title: string
  image_url: string
  link_url: string
  position: 'homepage_hero' | 'shop_banner' | 'popup' | 'sidebar'
  sizes: string
  sort_order: number
  is_active: boolean
  starts_at?: string
  ends_at?: string
  popup_trigger?: 'exit_intent' | 'after_5s' | 'after_30s_scroll' | 'once_per_session'
  created_at: string
  updated_at: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = (page - 1) * limit

    let query = 'SELECT * FROM banners'
    const params: (string | number)[] = []

    if (position) {
      query += ' WHERE position = ?'
      params.push(position)
    }

    query += ' ORDER BY sort_order ASC, created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const banners = await adminDb.query<Banner>(query, params)

    const countQuery = position
      ? 'SELECT COUNT(*) as total FROM banners WHERE position = ?'
      : 'SELECT COUNT(*) as total FROM banners'
    const countParams = position ? [position] : []
    const countResult = await adminDb.query<{ total: number }>(countQuery, countParams)
    const total = countResult[0]?.total || 0

    return NextResponse.json({
      banners,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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

    const result = await adminDb.query<{ id: string }>(
      `INSERT INTO banners 
       (title, image_url, link_url, position, sizes, sort_order, is_active, starts_at, ends_at, popup_trigger, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
       RETURNING id`,
      [
        title,
        image_url,
        link_url,
        position,
        sizes || '{}',
        sort_order || 0,
        is_active ? 1 : 0,
        starts_at || null,
        ends_at || null,
        popup_trigger || null,
      ]
    )

    return NextResponse.json(
      { id: result[0]?.id, message: 'Banner created successfully' },
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
