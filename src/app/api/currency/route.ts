import { NextResponse } from 'next/server'
import { getLiveRates, SUPPORTED_CURRENCIES, getCurrencyMeta } from '@/lib/currency'

export async function GET(): Promise<NextResponse> {
  const rates = await getLiveRates()

  const result = SUPPORTED_CURRENCIES.map((code) => ({
    code,
    rate: rates[code] ?? 1,
    ...getCurrencyMeta(code),
  }))

  return NextResponse.json({ rates: result }, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' },
  })
}
