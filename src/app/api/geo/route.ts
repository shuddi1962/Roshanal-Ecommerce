import { NextRequest, NextResponse } from 'next/server'
import { detectGeoFromIP } from '@/lib/geo'

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Get IP from various headers (Vercel sets x-forwarded-for)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const ip = (forwarded?.split(',')[0] ?? realIP ?? '').trim()

  const geo = await detectGeoFromIP(ip)

  return NextResponse.json(
    {
      countryCode: geo.countryCode,
      countryName: geo.countryName,
      city: geo.city,
      currencyCode: geo.currencyCode,
      timezone: geo.timezone,
      lat: geo.lat,
      lng: geo.lng,
      isDefault: geo.isDefault,
    },
    {
      headers: {
        'Cache-Control': 'private, max-age=3600',
      },
    }
  )
}
