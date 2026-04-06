/**
 * Google + Bing Auto-Indexing
 * - Every published URL → Google Indexing API within seconds
 * - Every published URL → Bing URL Submission API
 * - Logs status in indexing_log table
 */

import { adminDb } from '@/lib/db'
import { getApiKey } from '@/lib/api-vault'

/**
 * Submit a URL to Google Indexing API (requires service account JSON from vault).
 */
export async function submitToGoogle(url: string): Promise<{ success: boolean; status: string }> {
  try {
    const serviceAccountJson = await getApiKey('google_indexing', 'service_account_json')
    if (!serviceAccountJson) {
      return { success: false, status: 'Google Indexing not configured in API Vault' }
    }

    const serviceAccount = JSON.parse(serviceAccountJson) as {
      client_email: string; private_key: string; token_uri: string
    }

    const accessToken = await getGoogleAccessToken(serviceAccount)

    const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ url, type: 'URL_UPDATED' }),
    })

    const status = res.ok ? 'submitted' : `error_${res.status}`

    await logIndexingSubmission(url, 'google', status)
    return { success: res.ok, status }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown_error'
    await logIndexingSubmission(url, 'google', msg)
    return { success: false, status: msg }
  }
}

/**
 * Submit a URL to Bing URL Submission API.
 */
export async function submitToBing(url: string): Promise<{ success: boolean; status: string }> {
  try {
    const apiKey = await getApiKey('bing_indexing', 'api_key')
    const siteUrl = await getApiKey('bing_indexing', 'site_url')

    if (!apiKey || !siteUrl) {
      return { success: false, status: 'Bing indexing not configured in API Vault' }
    }

    const res = await fetch(
      `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ siteUrl, urlList: [url] }),
      }
    )

    const status = res.ok ? 'submitted' : `error_${res.status}`
    await logIndexingSubmission(url, 'bing', status)
    return { success: res.ok, status }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown_error'
    await logIndexingSubmission(url, 'bing', msg)
    return { success: false, status: msg }
  }
}

/**
 * Submit a URL to both Google and Bing simultaneously.
 * Called on every page/product publish event.
 */
export async function submitToAllIndexers(url: string): Promise<void> {
  await Promise.allSettled([submitToGoogle(url), submitToBing(url)])
}

/**
 * Batch-submit all sitemap URLs to both indexers.
 */
export async function batchSubmitSitemap(urls: string[]): Promise<void> {
  for (const url of urls) {
    await submitToAllIndexers(url)
    // Throttle: 1 request per 100ms to avoid rate limits
    await new Promise((r) => setTimeout(r, 100))
  }
}

async function logIndexingSubmission(
  url: string,
  engine: 'google' | 'bing',
  status: string
): Promise<void> {
  await adminDb.from('indexing_log').upsert(
    {
      url,
      submitted_at: new Date().toISOString(),
      [`${engine}_status`]: status,
    },
    { onConflict: 'url' }
  )
}

async function getGoogleAccessToken(serviceAccount: {
  client_email: string
  private_key: string
  token_uri: string
}): Promise<string> {
  const scope = 'https://www.googleapis.com/auth/indexing'
  const now = Math.floor(Date.now() / 1000)

  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope,
      aud: serviceAccount.token_uri,
      exp: now + 3600,
      iat: now,
    })
  ).toString('base64url')

  // Sign using Node crypto (RS256)
  const { createSign } = await import('crypto')
  const sign = createSign('RSA-SHA256')
  sign.update(`${header}.${payload}`)
  const signature = sign.sign(serviceAccount.private_key, 'base64url')
  const jwt = `${header}.${payload}.${signature}`

  const res = await fetch(serviceAccount.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  const data = (await res.json()) as { access_token?: string }
  if (!data.access_token) throw new Error('Failed to get Google access token')
  return data.access_token
}
