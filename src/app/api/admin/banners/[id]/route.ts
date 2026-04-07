import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'

interface Banner {
  id: string
  title: string
  image_url: string
  link_url: string
  position: string
  sizes: string
  sort_order: number
  is_active: boolean
  starts_at?: string
  ends_at?: string
  popup_trigger?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const banners = await adminDb.query<Banner>(
      'SELECT * FROM banners WHERE id = ?',
      [id]
    )

    if (!banners.length) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ banner: banners[0] })
  } catch (error) {
    console.error('Failed to fetch banner:', error)
    return NextResponse.json(
      { error: 'Failed to fetch banner' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const banners = await adminDb.query<Banner>(
      'SELECT * FROM banners WHERE id = ?',
      [id]
    )

    if (!banners.length) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      )
    }

    const updates: string[] = []
    const values: (string | number | null)[] = []

    if (title !== undefined) {
      updates.push('title = ?')
      values.push(title)
    }
    if (image_url !== undefined) {
      updates.push('image_url = ?')
      values.push(image_url)
    }
    if (link_url !== undefined) {
      updates.push('link_url = ?')
      values.push(link_url)
    }
    if (position !== undefined) {
      updates.push('position = ?')
      values.push(position)
    }
    if (sizes !== undefined) {
      updates.push('sizes = ?')
      values.push(typeof sizes === 'string' ? sizes : JSON.stringify(sizes))
    }
    if (sort_order !== undefined) {
      updates.push('sort_order = ?')
      values.push(sort_order)
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?')
      values.push(is_active ? 1 : 0)
    }
    if (starts_at !== undefined) {
      updates.push('starts_at = ?')
      values.push(starts_at)
    }
    if (ends_at !== undefined) {
      updates.push('ends_at = ?')
      values.push(ends_at)
    }
    if (popup_trigger !== undefined) {
      updates.push('popup_trigger = ?')
      values.push(popup_trigger)
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    updates.push("updated_at = datetime('now')")
    values.push(id)

    await adminDb.query(
      `UPDATE banners SET ${updates.join(', ')} WHERE id = ?`,
      values
    )

    return NextResponse.json({ message: 'Banner updated successfully' })
  } catch (error) {
    console.error('Failed to update banner:', error)
    return NextResponse.json(
      { error: 'Failed to update banner' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const banners = await adminDb.query<Banner>(
      'SELECT * FROM banners WHERE id = ?',
      [id]
    )

    if (!banners.length) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      )
    }

    await adminDb.query('DELETE FROM banners WHERE id = ?', [id])

    return NextResponse.json({ message: 'Banner deleted successfully' })
  } catch (error) {
    console.error('Failed to delete banner:', error)
    return NextResponse.json(
      { error: 'Failed to delete banner' },
      { status: 500 }
    )
  }
}
