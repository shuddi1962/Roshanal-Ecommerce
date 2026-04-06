/**
 * Geolocation Service
 * - ipapi.co for country, city, currency, timezone detection
 * - Cookie consent (GDPR/NDPR) required before reading location
 * - Mapbox for address autocomplete and reverse geocoding
 * - Result: currency auto-set, nearest branch highlighted
 */

import type { CurrencyCode } from '@/lib/currency'

export interface GeoSession {
  countryCode: string
  countryName: string
  city: string
  currencyCode: CurrencyCode
  timezone: string
  lat: number | null
  lng: number | null
  isDefault: boolean // true if using fallback (no consent or detection failed)
}

const DEFAULT_GEO: GeoSession = {
  countryCode: 'NG',
  countryName: 'Nigeria',
  city: 'Port Harcourt',
  currencyCode: 'NGN',
  timezone: 'Africa/Lagos',
  lat: 4.8242,
  lng: 7.0336,
  isDefault: true,
}

/**
 * Detect visitor location using ipapi.co.
 * Called server-side in middleware or in /api/geo route.
 * NEVER called client-side directly (privacy + CORS).
 */
export async function detectGeoFromIP(ip: string): Promise<GeoSession> {
  if (!ip || ip === '127.0.0.1' || ip === '::1') {
    return DEFAULT_GEO
  }

  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { 'User-Agent': 'Roshanal-Commerce-OS/1.0' },
      next: { revalidate: 3600 }, // Cache for 1hr
    })

    if (!res.ok) return DEFAULT_GEO

    const data = (await res.json()) as {
      country_code?: string
      country_name?: string
      city?: string
      currency?: string
      timezone?: string
      latitude?: number
      longitude?: number
      error?: boolean
    }

    if (data.error) return DEFAULT_GEO

    return {
      countryCode: data.country_code ?? 'NG',
      countryName: data.country_name ?? 'Nigeria',
      city: data.city ?? 'Unknown',
      currencyCode: isSupportedCurrency(data.currency) ? (data.currency as CurrencyCode) : 'NGN',
      timezone: data.timezone ?? 'Africa/Lagos',
      lat: data.latitude ?? null,
      lng: data.longitude ?? null,
      isDefault: false,
    }
  } catch {
    return DEFAULT_GEO
  }
}

function isSupportedCurrency(code: string | undefined): boolean {
  const supported = ['NGN', 'USD', 'GBP', 'EUR', 'GHS', 'AED', 'CAD', 'AUD', 'ZAR', 'KES', 'JPY', 'CNY']
  return supported.includes(code ?? '')
}

/**
 * Get Mapbox autocomplete suggestions for an address query.
 * Requires Mapbox token from API Vault.
 */
export async function getAddressSuggestions(
  query: string,
  mapboxToken: string,
  countryCode?: string
): Promise<MapboxFeature[]> {
  if (!query || query.length < 3) return []

  const country = countryCode ? `&country=${countryCode.toLowerCase()}` : ''
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&types=address,place,locality${country}&limit=5`

  try {
    const res = await fetch(url)
    if (!res.ok) return []
    const data = (await res.json()) as { features: MapboxFeature[] }
    return data.features ?? []
  } catch {
    return []
  }
}

/**
 * Reverse geocode coordinates to address.
 */
export async function reverseGeocode(
  lat: number,
  lng: number,
  mapboxToken: string
): Promise<string | null> {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&types=address&limit=1`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = (await res.json()) as { features: MapboxFeature[] }
    return data.features[0]?.place_name ?? null
  } catch {
    return null
  }
}

export interface MapboxFeature {
  id: string
  place_name: string
  center: [number, number]
  geometry: { type: string; coordinates: [number, number] }
  context?: Array<{ id: string; text: string }>
}
