import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLogsTable, businessesTable } from "@/lib/schema";
import type { InsertAuditLog } from "@/lib/schema/schema-types";
import { stripe } from "@/lib/stripe";
import { ErrorCode } from "@/server/constants/errors";

export async function create_connected_account(
  userId: string,
  businessId: string,
) {
  if (!userId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: "test@example.com",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    const [updatedBusiness] = await db
      .update(businessesTable)
      .set({ stripeAccountId: account.id, updatedAt: new Date() })
      .where(eq(businessesTable.id, businessId))
      .returning();

    if (!updatedBusiness) {
      return { data: null, error: ErrorCode.BUSINESS_NOT_FOUND };
    }

    const auditData: InsertAuditLog = {
      businessId,
      model: "business",
      recordId: businessId,
      action: "create-stripe-connected-account",
      changes: JSON.stringify({ stripeAccountId: account.id }),
      performedBy: userId,
      performedAt: new Date(),
    };

    await db.insert(auditLogsTable).values(auditData);

    return { data: account, error: null };
  } catch (error) {
    console.error("Failed to create Stripe connected account:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function create_account_link(
  stripeAccountId: string,
  refreshUrl: string,
  returnUrl: string,
) {
  if (!stripeAccountId || !refreshUrl || !returnUrl) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });
    return { data: accountLink, error: null };
  } catch (error) {
    console.error("Failed to create Stripe account link:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function get_account(stripeAccountId: string) {
  if (!stripeAccountId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const account = await stripe.accounts.retrieve(stripeAccountId);
    return { data: account, error: null };
  } catch (error) {
    console.error("Failed to retrieve Stripe account:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
