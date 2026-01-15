"use server";

import { stripe } from "@/lib/stripe";
import { ERROR_CODE } from "@/server/constants/errors";
import { PERMISSION } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import { get_by_id as get_business_by_id } from "@/server/repos/business/business-repo";

export const createCustomerPaymentLink = createProtectedAction(
  PERMISSION.INTER_BUSINESS_PAYMENT_INITIATE,
  async (
    user,
    {
      amount,
      currency,
      description,
      customerEmail,
    }: {
      amount: number;
      currency: string;
      description: string;
      customerEmail?: string;
    },
  ) => {
    if (!user.businessId) {
      return { data: null, error: ERROR_CODE.BUSINESS_NOT_FOUND };
    }

    const business = await get_business_by_id(user.businessId);
    if (business.error || !business.data?.stripeAccountId) {
      return { data: null, error: ERROR_CODE.STRIPE_ACCOUNT_NOT_CONNECTED };
    }

    try {
      const paymentLink = await stripe.paymentLinks.create({
        line_items: [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: description,
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        after_completion: {
          type: "redirect",
          redirect: {
            url: `${process.env.NEXT_PUBLIC_APP_URL}/payments/success`,
          },
        },
        metadata: {
          businessId: user.businessId,
          createdBy: user.id,
          customerEmail: customerEmail || "",
        },
      });

      return { data: paymentLink, error: null };
    } catch (error) {
      console.error("Failed to create customer payment link:", error);
      return {
        data: null,
        error: ERROR_CODE.FAILED_REQUEST,
      };
    }
  },
);

export const getCustomerPayments = createProtectedAction(
  PERMISSION.INTER_BUSINESS_PAYMENT_VIEW,
  async (user, { page, pageSize }: { page: number; pageSize: number }) => {
    if (!user.businessId) {
      return { data: null, error: ERROR_CODE.BUSINESS_NOT_FOUND };
    }

    try {
      const business = await get_business_by_id(user.businessId);
      if (business.error || !business.data?.stripeAccountId) {
        return { data: null, error: ERROR_CODE.STRIPE_ACCOUNT_NOT_CONNECTED };
      }

      // Get payment intents for this business
      const paymentIntents = await stripe.paymentIntents.list({
        limit: pageSize,
        starting_after: page > 1 ? undefined : undefined, // TODO: Implement pagination
      });

      // Filter payment intents that belong to this business
      const businessPayments = paymentIntents.data.filter(
        (pi) => pi.metadata?.businessId === user.businessId,
      );

      return {
        data: {
          payments: businessPayments,
          totalCount: businessPayments.length,
          page,
          pageSize,
        },
        error: null,
      };
    } catch (error) {
      console.error("Failed to get customer payments:", error);
      return { data: null, error: ERROR_CODE.FAILED_REQUEST };
    }
  },
);
