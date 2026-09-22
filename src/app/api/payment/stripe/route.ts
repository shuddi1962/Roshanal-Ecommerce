import { NextRequest, NextResponse } from "next/server";
import { createPaymentIntent } from "@/lib/stripe";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const {
      amountKobo,
      email,
      reference,
      metadata,
    }: {
      amountKobo: number;
      email: string;
      reference: string;
      metadata?: Record<string, string>;
    } = body;

    if (!amountKobo || !email || !reference) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: amountKobo, email, reference" },
        { status: 400 }
      );
    }

    const data = await createPaymentIntent({
      amountKobo,
      email,
      reference,
      metadata,
    });

    return NextResponse.json({
      ok: true,
      clientSecret: data.client_secret,
      paymentIntentId: data.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
