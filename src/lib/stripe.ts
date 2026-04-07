import { getApiKey } from "@/lib/api-vault";
import crypto from "crypto";

const BASE_URL = "https://api.stripe.com/v1";

interface PaymentIntentParams {
  amountKobo: number;
  email: string;
  reference: string;
  metadata?: Record<string, string>;
}

interface PaymentIntent {
  id: string;
  client_secret: string;
  status: string;
}

async function stripeFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const secretKey = await getApiKey("stripe", "secret_key");
  if (!secretKey) throw new Error('Stripe secret key not configured')

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Stripe API error");
  }

  return data as T;
}

function encodeParams(params: Record<string, string | number | undefined>): string {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join("&");
}

export async function createPaymentIntent(
  params: PaymentIntentParams
): Promise<PaymentIntent> {
  const bodyParams: Record<string, string | number | undefined> = {
    amount: params.amountKobo,
    currency: "ngn",
    "automatic_payment_methods[enabled]": "true",
    "metadata[email]": params.email,
    "metadata[reference]": params.reference,
  };

  if (params.metadata) {
    Object.entries(params.metadata).forEach(([key, value]) => {
      bodyParams[`metadata[${key}]`] = value;
    });
  }

  const data = await stripeFetch<{
    id: string;
    client_secret: string;
    status: string;
  }>("/payment_intents", {
    method: "POST",
    body: encodeParams(bodyParams),
  });

  return {
    id: data.id,
    client_secret: data.client_secret,
    status: data.status,
  };
}

export async function retrievePaymentIntent(id: string): Promise<unknown> {
  return stripeFetch(`/payment_intents/${id}`);
}

export async function constructWebhookEvent(
  payload: string,
  signature: string,
  _endpointSecret: string
): Promise<unknown> {
  const webhookSecret = await getApiKey('stripe', 'webhook_secret')
  if (!webhookSecret) throw new Error('Stripe webhook secret not configured')

  const timestamp = signature.split(",")[0]?.split("=")[1]
  const signatures = signature
    .split(",")
    .filter((sig) => sig.startsWith("v1="))
    .map((sig) => sig.slice(3))

  const signedPayload = `${timestamp}.${payload}`
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(signedPayload)
    .digest("hex")

  const isValid = signatures.some((sig) => {
    try {
      return crypto.timingSafeEqual(
        Buffer.from(sig, "hex"),
        Buffer.from(expectedSignature, "hex")
      )
    } catch {
      return false
    }
  })

  if (!isValid) {
    throw new Error("Invalid webhook signature")
  }

  return JSON.parse(payload)
}
