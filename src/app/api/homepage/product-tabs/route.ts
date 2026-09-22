import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(): Promise<NextResponse> {
  const { data } = await db
    .from('homepage_config')
    .select('product_tabs')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  if (data?.product_tabs) {
    return NextResponse.json({ tabs: data.product_tabs })
  }

  // Return defaults if not configured
  return NextResponse.json({
    tabs: [
      { id: '1', label: 'Trending', source: 'tag', sourceValue: 'trending', count: 8, sortOrder: 'featured', isDefault: true, enabled: true },
      { id: '2', label: 'Best Sellers', source: 'tag', sourceValue: 'bestseller', count: 8, sortOrder: 'bestselling', isDefault: false, enabled: true },
      { id: '3', label: 'New Arrivals', source: 'tag', sourceValue: 'new-arrival', count: 8, sortOrder: 'newest', isDefault: false, enabled: true },
      { id: '4', label: 'On Sale', source: 'tag', sourceValue: 'sale', count: 8, sortOrder: 'sale', isDefault: false, enabled: true },
    ],
  }, { headers: { 'Cache-Control': 'public, s-maxage=300' } })
}
