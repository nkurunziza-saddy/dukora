"use server";

import { stripe } from "@/lib/stripe";
import { ERROR_CODE } from "@/server/constants/errors";

export async function get_account(stripeAccountId: string) {
  if (!stripeAccountId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const account = await stripe.accounts.retrieve(stripeAccountId);
    return { data: account, error: null };
  } catch (error) {
    console.error("Failed to retrieve Stripe account:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
}
