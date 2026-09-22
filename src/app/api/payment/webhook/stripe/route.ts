import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      return NextResponse.json(
        { error: "STRIPE_WEBHOOK_SECRET not configured" },
        { status: 500 }
      );
    }

    const event = await constructWebhookEvent(payload, signature, endpointSecret);

    const typedEvent = event as {
      type: string;
      data: {
        object: {
          id: string;
          metadata?: { reference?: string };
          status?: string;
        };
      };
    };

    switch (typedEvent.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = typedEvent.data.object;
        const reference = paymentIntent.metadata?.reference;

        if (reference) {
          // TODO: Update order payment_status to 'paid'
          // await updateOrderPaymentStatus(reference, 'paid');
          console.log(`Payment succeeded for reference: ${reference}`);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = typedEvent.data.object;
        const reference = paymentIntent.metadata?.reference;

        if (reference) {
          // TODO: Update order payment_status to 'failed'
          // await updateOrderPaymentStatus(reference, 'failed');
          console.log(`Payment failed for reference: ${reference}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${typedEvent.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
