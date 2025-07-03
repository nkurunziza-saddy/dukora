import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { businessesTable, interBusinessPaymentsTable } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const buf = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig!, webhookSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err}` },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      console.log(`Stripe Account Updated: ${account.id}`);
      await db
        .update(businessesTable)
        .set({ stripeAccountId: account.id, updatedAt: new Date() })
        .where(eq(businessesTable.stripeAccountId, account.id));
      break;
    }
    case "charge.captured": {
      const charge = event.data.object as Stripe.Charge;
      console.log(`Charge Captured: ${charge.id}`);
      // later
      break;
    }
    case "charge.expired": {
      const charge = event.data.object as Stripe.Charge;
      console.log(`Charge Expired: ${charge.id}`);
      // later
      break;
    }
    case "charge.failed": {
      const charge = event.data.object as Stripe.Charge;
      console.log(`Charge Failed: ${charge.id}`);
      await db
        .update(interBusinessPaymentsTable)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(interBusinessPaymentsTable.stripePaymentIntentId, charge.id));
      break;
    }
    case "charge.pending": {
      const charge = event.data.object as Stripe.Charge;
      console.log(`Charge Pending: ${charge.id}`);
      // later
      break;
    }
    case "charge.succeeded": {
      const charge = event.data.object as Stripe.Charge;
      console.log(`Charge Succeeded: ${charge.id}`);
      await db
        .update(interBusinessPaymentsTable)
        .set({ status: "succeeded", updatedAt: new Date() })
        .where(eq(interBusinessPaymentsTable.stripePaymentIntentId, charge.id));
      break;
    }
    case "payment_intent.canceled": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`Payment Intent Canceled: ${paymentIntent.id}`);
      // later
      break;
    }
    case "payment_intent.created": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`Payment Intent Created: ${paymentIntent.id}`);
      // later
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`Payment Intent Payment Failed: ${paymentIntent.id}`);
      await db
        .update(interBusinessPaymentsTable)
        .set({ status: "failed", updatedAt: new Date() })
        .where(
          eq(interBusinessPaymentsTable.stripePaymentIntentId, paymentIntent.id)
        );
      break;
    }
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`Payment Intent Succeeded: ${paymentIntent.id}`);
      await db
        .update(interBusinessPaymentsTable)
        .set({ status: "succeeded", updatedAt: new Date() })
        .where(
          eq(interBusinessPaymentsTable.stripePaymentIntentId, paymentIntent.id)
        );
      break;
    }
    default: {
      console.log(`Unhandled event type: ${event.type}`);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
