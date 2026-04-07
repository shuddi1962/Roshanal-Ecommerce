/**
 * Flutterwave Payment Gateway
 * Key retrieved from API Vault — never hardcoded.
 * Customer-facing name: "Credit/Debit Card", "Bank Transfer", "USSD", "QR", "Mobile Money"
 */

import { getApiKey } from '@/lib/api-vault'

const FLUTTERWAVE_BASE = 'https://api.flutterwave.com/v3'

export interface FlutterwaveInitParams {
  amountKobo: number
  email: string
  reference: string
  name: string
  phone?: string
  callbackUrl: string
  metadata?: Record<string, unknown>
}

export interface FlutterwaveInitResponse {
  status: string
  message: string
  data: {
    link: string
    tx_ref: string
  }
}

async function getSecretKey(): Promise<string> {
  const key = await getApiKey('flutterwave', 'secret_key')
  if (!key) throw new Error('Flutterwave secret key not configured')
  return key
}

/**
 * Initialize a Flutterwave payment transaction.
 * @param params - Initialization parameters
 */
export async function initializePayment(params: FlutterwaveInitParams): Promise<FlutterwaveInitResponse> {
  const secretKey = await getSecretKey()

  const res = await fetch(`${FLUTTERWAVE_BASE}/payments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: params.amountKobo / 100, // Convert kobo to NGN
      currency: 'NGN',
      tx_ref: params.reference,
      redirect_url: params.callbackUrl,
      customer: {
        email: params.email,
        name: params.name,
        phonenumber: params.phone ?? '',
      },
      payment_options: 'card,account,ussd,qr,mobile_money',
      meta: params.metadata ?? {},
    }),
  })

  return res.json() as Promise<FlutterwaveInitResponse>
}

/**
 * Verify a Flutterwave transaction by transaction ID.
 * @param transactionId - Flutterwave transaction ID
 */
export async function verifyPayment(transactionId: string): Promise<unknown> {
  const secretKey = await getSecretKey()

  const res = await fetch(`${FLUTTERWAVE_BASE}/transactions/${transactionId}/verify`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  })

  return res.json()
}

/**
 * Validate Flutterwave webhook signature.
 * @param payload - Raw request body
 * @param signature - Signature from verif-hash header
 * @param secretKey - Webhook secret key
 */
export function validateFlutterwaveWebhook(payload: string, signature: string, secretKey: string): boolean {
  const { createHmac } = require('crypto') as { createHmac: (alg: string, key: string) => { update: (s: string) => { digest: (enc: string) => string } } }
  const hash = createHmac('sha256', secretKey).update(payload).digest('hex')
  return hash === signature
}
