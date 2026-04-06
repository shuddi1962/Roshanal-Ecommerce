/**
 * Currency Service
 * - Live rates from Open Exchange Rates API (stored in Insforge, refreshed every 1hr)
 * - Display only — all payments processed in NGN (kobo)
 * - Admin markup buffer % for rate fluctuation protection
 */

import { adminDb } from '@/lib/db'

export const SUPPORTED_CURRENCIES = [
  'NGN', 'USD', 'GBP', 'EUR', 'GHS', 'AED', 'CAD', 'AUD', 'ZAR', 'KES', 'JPY', 'CNY',
] as const

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]

export interface CurrencyRate {
  code: CurrencyCode
  rate: number // rate relative to NGN base
  symbol: string
  name: string
}

const CURRENCY_META: Record<CurrencyCode, { symbol: string; name: string }> = {
  NGN: { symbol: '₦', name: 'Nigerian Naira' },
  USD: { symbol: '$', name: 'US Dollar' },
  GBP: { symbol: '£', name: 'British Pound' },
  EUR: { symbol: '€', name: 'Euro' },
  GHS: { symbol: 'GH₵', name: 'Ghanaian Cedi' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham' },
  CAD: { symbol: 'CA$', name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', name: 'Australian Dollar' },
  ZAR: { symbol: 'R', name: 'South African Rand' },
  KES: { symbol: 'KSh', name: 'Kenyan Shilling' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
  CNY: { symbol: '¥', name: 'Chinese Yuan' },
}

// In-memory cache
let ratesCache: Record<string, number> | null = null
let ratesCachedAt = 0
const RATES_CACHE_TTL = 60 * 60 * 1000 // 1hr

/**
 * Get live rates (NGN as base, returns rates for all supported currencies)
 */
export async function getLiveRates(): Promise<Record<string, number>> {
  if (ratesCache && Date.now() - ratesCachedAt < RATES_CACHE_TTL) {
    return ratesCache
  }

  const { data } = await adminDb
    .from('currency_rates')
    .select('rates')
    .eq('base_currency', 'NGN')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  if (data?.rates) {
    ratesCache = data.rates as Record<string, number>
    ratesCachedAt = Date.now()
    return ratesCache
  }

  // Fallback approximate rates if DB empty
  return {
    NGN: 1, USD: 0.00063, GBP: 0.00050, EUR: 0.00058,
    GHS: 0.0096, AED: 0.0023, CAD: 0.00086, AUD: 0.00097,
    ZAR: 0.012, KES: 0.082, JPY: 0.094, CNY: 0.0046,
  }
}

/**
 * Convert kobo (NGN) amount to display amount in target currency.
 * Applies admin markup buffer (default 2%).
 */
export function convertFromKobo(
  amountKobo: number,
  targetCurrency: CurrencyCode,
  rates: Record<string, number>,
  markupPercent = 2
): number {
  const naira = amountKobo / 100
  if (targetCurrency === 'NGN') return naira

  const rate = rates[targetCurrency] ?? 1
  const markup = 1 + markupPercent / 100
  return naira * rate * markup
}

/**
 * Format a display amount with currency symbol.
 */
export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const { symbol } = CURRENCY_META[currency]
  const locale = currency === 'NGN' ? 'en-NG' : 'en-US'

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: currency === 'JPY' ? 0 : 2,
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
  }).format(amount)

  return `${symbol}${formatted}`
}

/**
 * Format kobo value directly to NGN string.
 */
export function formatNaira(amountKobo: number): string {
  return formatCurrency(amountKobo / 100, 'NGN')
}

/**
 * Full display: "₦125,000" with NGN equivalent below if foreign currency
 */
export function getPriceDisplay(
  amountKobo: number,
  displayCurrency: CurrencyCode,
  rates: Record<string, number>
): { primary: string; secondary: string | null } {
  const primary = formatCurrency(convertFromKobo(amountKobo, displayCurrency, rates), displayCurrency)
  const secondary = displayCurrency !== 'NGN' ? formatNaira(amountKobo) : null
  return { primary, secondary }
}

export function getCurrencyMeta(code: CurrencyCode): { symbol: string; name: string } {
  return CURRENCY_META[code]
}
