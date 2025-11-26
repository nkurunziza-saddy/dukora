import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { confirmCustomerOrder } from "@/server/actions/shopper/orders-actions";
import { syncInventoryAfterOrder } from "@/server/actions/inventory/sync-actions";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("Missing STRIPE_WEBHOOK_SECRET environment variable");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        console.log("Payment succeeded:", paymentIntent.id);

        // Confirm the customer order
        const orderResult = await confirmCustomerOrder(paymentIntent.id);
        if (orderResult.error || !orderResult.data) {
          console.error("Failed to confirm order:", orderResult.error);
          return NextResponse.json(
            { error: "Failed to confirm order" },
            { status: 500 },
          );
        }

        // Sync inventory
        const syncResult = await syncInventoryAfterOrder(
          orderResult.data.orderId,
        );
        if (syncResult.error) {
          console.error("Failed to sync inventory:", syncResult.error);
          // Don't fail the webhook, just log the error
        }

        console.log(
          "Order confirmed and inventory synced:",
          orderResult.data.orderNumber,
        );
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.log("Payment failed:", paymentIntent.id);
        // TODO: Handle payment failure (maybe send notification)
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}
