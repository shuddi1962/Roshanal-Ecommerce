import { getApiKey } from "@/lib/api-vault";

const BASE_URL = "https://squadinc.com/server-api";

export interface SquadPaymentParams {
  amountKobo: number;
  email: string;
  reference: string;
  name: string;
  phone?: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}

interface SquadPaymentResponse {
  status: boolean;
  message: string;
  data?: {
    payment_reference: string;
    checkout_url: string;
  };
}

export async function initializePayment(
  params: SquadPaymentParams
): Promise<SquadPaymentResponse> {
  const secretKey = await getApiKey("squad", "secret_key");
  if (!secretKey) throw new Error('Squad secret key not configured')

  const response = await fetch(`${BASE_URL}/v1/payment`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amountKobo,
      email: params.email,
      reference: params.reference,
      name: params.name,
      phone: params.phone,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      status: false,
      message: data.message || "Payment initialization failed",
    };
  }

  return {
    status: true,
    message: data.message || "Payment initialized successfully",
    data: data.data
      ? {
          payment_reference: data.data.payment_reference,
          checkout_url: data.data.checkout_url,
        }
      : undefined,
  };
}

export async function verifyPayment(reference: string): Promise<unknown> {
  const secretKey = await getApiKey("squad", "secret_key");

  const response = await fetch(
    `${BASE_URL}/v1/payment/${reference}/verify`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Payment verification failed");
  }

  return data;
}
