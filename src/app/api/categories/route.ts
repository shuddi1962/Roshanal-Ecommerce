import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { toSlug } from '@/lib/utils'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const parentSlug = searchParams.get('parent')

  let query = db
    .from('categories')
    .select('id, name, slug, description, image_url, emoji_icon, sort_order, is_active,
      parent:parent_id(name, slug), brands:brands(id, name, slug),
      products:products(id)')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (slug) {
    const { data } = await db.from('categories').select('id').eq('slug', slug).single()
    if (!data) return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    query = query.eq('id', data.id)
  }

  if (parentSlug) {
    const { data } = await db.from('categories').select('id').eq('slug', parentSlug).single()
    if (data) query = query.eq('parent_id', data.id)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const formatted = (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image_url,
    icon: c.emoji_icon,
    parent: (c.parent as { name?: string; slug?: string } | null)?.name ?? null,
    brands: ((c.brands as unknown[]) ?? []).map((b) => b as { id: string; name: string; slug: string }),
    productCount: ((c.products as unknown[]) ?? []).length,
  }))

  return NextResponse.json({ categories: formatted })
}
