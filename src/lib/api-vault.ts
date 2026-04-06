/**
 * API Vault — AES-256 Encrypted External API Key Storage
 *
 * All external API keys are stored encrypted in Insforge DB.
 * .env has ONLY: INSFORGE_URL, INSFORGE_ANON_KEY, NEXTAUTH_SECRET, ENCRYPTION_KEY
 *
 * Per-staff, per-service access toggles are admin-controlled.
 * NEVER log decrypted keys. NEVER expose in client-side code.
 */

import { adminDb } from '@/lib/db'
import { decrypt, encrypt } from '@/lib/encryption'

export type ApiService =
  | 'anthropic'
  | 'openai'
  | 'vapi'
  | 'paystack'
  | 'squad'
  | 'flutterwave'
  | 'stripe'
  | 'nowpayments'
  | 'resend'
  | 'termii'
  | 'onesignal'
  | 'mapbox'
  | 'ipapi'
  | 'open_exchange_rates'
  | 'apify'
  | 'kie_ai'
  | 'buffer'
  | 'meta_graph'
  | 'twitter_v2'
  | 'tiktok'
  | 'linkedin'
  | 'google_indexing'
  | 'bing_indexing'
  | 'google_analytics'
  | 'google_tag_manager'
  | 'google_ads'
  | 'meta_pixel'
  | 'tiktok_pixel'
  | 'hotjar'
  | 'microsoft_clarity'
  | 'google_search_console'
  | 'google_shopping'
  | 'quickbooks'
  | 'xero'
  | 'cj_dropshipping'
  | 'ffmpeg_cloud'

interface VaultEntry {
  id: string
  service: ApiService
  key_name: string
  encrypted_value: string
  allowed_staff_ids: string[]
  is_active: boolean
  last_tested: string | null
  updated_at: string
}

// In-memory cache (server-side only, invalidated on TTL)
const vaultCache = new Map<string, { value: string; expiresAt: number }>()
const VAULT_CACHE_TTL_MS = 5 * 60_000 // 5 minutes

/**
 * Retrieve a decrypted API key from the vault.
 * @param service - The service identifier
 * @param keyName - The specific key name (e.g., 'secret_key', 'public_key')
 * @param staffId - If provided, checks staff access before returning key
 */
export async function getApiKey(
  service: ApiService,
  keyName: string,
  staffId?: string
): Promise<string | null> {
  const cacheKey = `${service}:${keyName}`
  const cached = vaultCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value
  }

  const { data, error } = await adminDb
    .from('api_vault')
    .select('encrypted_value, allowed_staff_ids, is_active')
    .eq('service', service)
    .eq('key_name', keyName)
    .single()

  if (error || !data || !data.is_active) return null

  // Check per-staff access if staffId provided
  if (staffId) {
    const allowedIds = data.allowed_staff_ids as string[]
    if (allowedIds.length > 0 && !allowedIds.includes(staffId)) {
      return null
    }
  }

  const decrypted = decrypt(data.encrypted_value as string)
  vaultCache.set(cacheKey, { value: decrypted, expiresAt: Date.now() + VAULT_CACHE_TTL_MS })
  return decrypted
}

/**
 * Store or update an API key in the vault (admin only).
 */
export async function setApiKey(
  service: ApiService,
  keyName: string,
  plainValue: string,
  allowedStaffIds: string[] = []
): Promise<void> {
  const encryptedValue = encrypt(plainValue)

  await adminDb.from('api_vault').upsert({
    service,
    key_name: keyName,
    encrypted_value: encryptedValue,
    allowed_staff_ids: allowedStaffIds,
    is_active: true,
    updated_at: new Date().toISOString(),
  })

  // Invalidate cache
  vaultCache.delete(`${service}:${keyName}`)
}

/**
 * Toggle a staff member's access to a specific service's keys.
 */
export async function toggleStaffVaultAccess(
  service: ApiService,
  keyName: string,
  staffId: string,
  grant: boolean
): Promise<void> {
  const { data } = await adminDb
    .from('api_vault')
    .select('allowed_staff_ids')
    .eq('service', service)
    .eq('key_name', keyName)
    .single()

  if (!data) return

  const current = (data.allowed_staff_ids as string[]) ?? []
  const updated = grant
    ? [...new Set([...current, staffId])]
    : current.filter((id) => id !== staffId)

  await adminDb
    .from('api_vault')
    .update({ allowed_staff_ids: updated })
    .eq('service', service)
    .eq('key_name', keyName)

  vaultCache.delete(`${service}:${keyName}`)
}

/**
 * Test an API key (marks last_tested timestamp).
 */
export async function markApiKeyTested(
  service: ApiService,
  keyName: string
): Promise<void> {
  await adminDb
    .from('api_vault')
    .update({ last_tested: new Date().toISOString() })
    .eq('service', service)
    .eq('key_name', keyName)
}

/**
 * Get all vault entries for admin display (encrypted values NEVER returned).
 */
export async function listVaultEntries(): Promise<
  Array<Omit<VaultEntry, 'encrypted_value'>>
> {
  const { data } = await adminDb
    .from('api_vault')
    .select('id, service, key_name, allowed_staff_ids, is_active, last_tested, updated_at')
    .order('service', { ascending: true })

  return (data as Array<Omit<VaultEntry, 'encrypted_value'>>) ?? []
}
