import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'
import { getApiKey } from '@/lib/api-vault'

// Called every 1 hour by Vercel Cron
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Security: verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = await getApiKey('open_exchange_rates', 'api_key')
  if (!apiKey) {
    return NextResponse.json({ error: 'Open Exchange Rates API key not configured' }, { status: 500 })
  }

  try {
    // Fetch USD-based rates
    const res = await fetch(`https://openexchangerates.org/api/latest.json?app_id=${apiKey}&base=USD`)
    const data = (await res.json()) as { rates?: Record<string, number>; error?: boolean }

    if (data.error || !data.rates) {
      return NextResponse.json({ error: 'Failed to fetch rates' }, { status: 500 })
    }

    // Convert to NGN base
    const ngnUsdRate = data.rates['NGN'] ?? 1600
    const ngnBasedRates: Record<string, number> = {}

    for (const [code, usdRate] of Object.entries(data.rates)) {
      ngnBasedRates[code] = usdRate / ngnUsdRate
    }

    await adminDb.from('currency_rates').upsert({
      base_currency: 'NGN',
      rates: ngnBasedRates,
      updated_at: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true, updatedAt: new Date().toISOString(), currencyCount: Object.keys(ngnBasedRates).length })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
