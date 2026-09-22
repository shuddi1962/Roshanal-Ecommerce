/**
 * Paystack Payment Gateway
 * Key retrieved from API Vault — never hardcoded.
 * Customer-facing name: "Credit/Debit Card", "Bank Transfer", "USSD"
 */

import { getApiKey } from '@/lib/api-vault'

const PAYSTACK_BASE = 'https://api.paystack.co'

export interface PaystackInitResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

export interface PaystackVerifyResponse {
  status: boolean
  message: string
  data: {
    status: 'success' | 'failed' | 'abandoned'
    reference: string
    amount: number // kobo
    currency: string
    paid_at: string
    customer: { email: string; name: string }
  }
}

async function getSecretKey(): Promise<string> {
  const key = await getApiKey('paystack', 'secret_key')
  if (!key) throw new Error('Paystack secret key not configured')
  return key
}

/**
 * Initialize a Paystack payment transaction.
 * @param amountKobo - Amount in kobo (smallest NGN unit)
 * @param email - Customer email
 * @param reference - Unique order reference
 * @param callbackUrl - URL to redirect after payment
 * @param metadata - Extra data (order ID, etc.)
 */
export async function initializePayment(params: {
  amountKobo: number
  email: string
  reference: string
  callbackUrl: string
  metadata?: Record<string, unknown>
  channels?: string[]
}): Promise<PaystackInitResponse> {
  const secretKey = await getSecretKey()

  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo, // Paystack expects kobo
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata ?? {},
      channels: params.channels ?? ['card', 'bank', 'ussd', 'bank_transfer'],
    }),
  })

  return res.json() as Promise<PaystackInitResponse>
}

/**
 * Verify a Paystack transaction by reference.
 */
export async function verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
  const secretKey = await getSecretKey()

  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  })

  return res.json() as Promise<PaystackVerifyResponse>
}

/**
 * Validate Paystack webhook signature.
 */
export function validateWebhookSignature(payload: string, signature: string, secretKey: string): boolean {
  const { createHmac } = require('crypto') as { createHmac: (alg: string, key: string) => { update: (s: string) => { digest: (enc: string) => string } } }
  const hash = createHmac('sha512', secretKey).update(payload).digest('hex')
  return hash === signature
}
