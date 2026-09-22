import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { adminDb } from '@/lib/db'
import { hasMinRole } from '@/lib/auth'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasMinRole(session.user.role, 'content_editor')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? 'all'

  let query = adminDb
    .from('product_reviews')
    .select(`
      id, rating, title, body, images, is_verified, staff_reply, helpful_count, created_at,
      products:product_id(name, slug),
      users:user_id(name, email)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (status !== 'all') query = query.eq('status', status)

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const reviews = (data ?? []).map((r) => ({
    id: r.id,
    product_name: (r.products as { name?: string; slug?: string })?.name ?? 'Unknown',
    product_slug: (r.products as { name?: string; slug?: string })?.slug ?? '',
    rating: r.rating,
    title: r.title ?? null,
    body: r.body,
    images: (r.images as string[]) ?? [],
    is_verified: r.is_verified ?? false,
    staff_reply: r.staff_reply ?? null,
    helpful_count: r.helpful_count ?? 0,
    user_name: (r.users as { name?: string })?.name ?? 'Guest',
    user_email: (r.users as { name?: string; email?: string })?.email ?? '',
    status: (r as { status?: string }).status ?? 'pending',
    created_at: r.created_at,
  }))

  return NextResponse.json({ reviews, total: count ?? 0 })
}
