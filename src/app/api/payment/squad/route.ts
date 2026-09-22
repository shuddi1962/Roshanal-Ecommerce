import { NextRequest, NextResponse } from "next/server";
import { initializePayment } from "@/lib/squad";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const {
      amountKobo,
      email,
      reference,
      name,
      phone,
      callbackUrl,
    }: {
      amountKobo: number;
      email: string;
      reference: string;
      name: string;
      phone?: string;
      callbackUrl?: string;
    } = body;

    if (!amountKobo || !email || !reference || !name) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: amountKobo, email, reference, name" },
        { status: 400 }
      );
    }

    const defaultCallbackUrl =
      callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`;

    const result = await initializePayment({
      amountKobo,
      email,
      reference,
      name,
      phone,
      callbackUrl: defaultCallbackUrl,
      metadata: body.metadata,
    });

    if (!result.status || !result.data) {
      return NextResponse.json(
        { ok: false, error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      paymentUrl: result.data.checkout_url,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
