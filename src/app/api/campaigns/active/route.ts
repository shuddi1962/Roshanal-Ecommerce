import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') ?? 'boat_building'

  const { data, error } = await adminDb
    .from('seasonal_campaigns')
    .select('*')
    .eq('is_active', true)
    .lte('start_date', new Date().toISOString())
    .gte('end_date', new Date().toISOString())
    .single()

  if (error || !data) {
    return NextResponse.json({ active: false })
  }

  return NextResponse.json({
    active: true,
    name: data.name,
    noticeText: data.notice_bar_text,
    eventKey: data.event_key,
    bannerUrls: data.banner_urls,
  })
}
