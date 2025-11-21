"use server";

import { stripe } from "@/lib/stripe";
import { ErrorCode } from "@/server/constants/errors";
import { Permission } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import { get_by_id as get_business_by_id } from "@/server/repos/business-repo";
import * as interBusinessPaymentsRepo from "@/server/repos/inter-business-payments-repo";


export const initiateInterBusinessPayment = createProtectedAction(
  Permission.INTER_BUSINESS_PAYMENT_INITIATE,
  async (
    user,
    {
      receiverBusinessId,
      amount,
      currency,
      applicationFeeAmount,
    }: {
      receiverBusinessId: string;
      amount: number;
      currency: string;
      applicationFeeAmount?: number;
    },
  ) => {
    if (!user.businessId) {
      return { data: null, error: ErrorCode.BUSINESS_NOT_FOUND };
    }

    const payerBusiness = await get_business_by_id(user.businessId);
    if (payerBusiness.error || !payerBusiness.data?.stripeAccountId) {
      return { data: null, error: ErrorCode.STRIPE_ACCOUNT_NOT_CONNECTED };
    }

    const receiverBusiness = await get_business_by_id(receiverBusinessId);
    if (receiverBusiness.error || !receiverBusiness.data?.stripeAccountId) {
      return {
        data: null,
        error: ErrorCode.RECEIVER_STRIPE_ACCOUNT_NOT_CONNECTED,
      };
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency,
        application_fee_amount: applicationFeeAmount
          ? Math.round(applicationFeeAmount * 100)
          : undefined,
        transfer_data: {
          destination: receiverBusiness.data.stripeAccountId,
        },
      });

      const paymentRecord = await interBusinessPaymentsRepo.create(
        {
          payerBusinessId: user.businessId,
          receiverBusinessId: receiverBusinessId,
          amount: String(amount),
          currency: currency,
          stripePaymentIntentId: paymentIntent.id,
          status: paymentIntent.status, // 'requires_payment_method', 'requires_confirmation', ...
          applicationFeeAmount: String(applicationFeeAmount),
          initiatedByUserId: user.id,
        },
        user.id,
      );

      if (paymentRecord.error) {
        return { data: null, error: paymentRecord.error };
      }



      return { data: paymentIntent, error: null };
    } catch (error) {
      console.error("Failed to initiate inter-business payment:", error);
      return {
        data: null,
        error: ErrorCode.FAILED_REQUEST,
      };
    }
  },
);

export const getInterBusinessPayments = createProtectedAction(
  Permission.INTER_BUSINESS_PAYMENT_VIEW,
  async (user, { page, pageSize }: { page: number; pageSize: number }) => {
    if (!user.businessId) {
      return { data: null, error: ErrorCode.BUSINESS_NOT_FOUND };
    }
    const payments = await interBusinessPaymentsRepo.get_all_paginated(
      user.businessId,
      page,
      pageSize,
    );
    if (payments.error) {
      return { data: null, error: payments.error };
    }
    return { data: payments.data, error: null };
  },
);

export const createCustomerPaymentLink = createProtectedAction(
  Permission.INTER_BUSINESS_PAYMENT_INITIATE,
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
      return { data: null, error: ErrorCode.BUSINESS_NOT_FOUND };
    }

    const business = await get_business_by_id(user.businessId);
    if (business.error || !business.data?.stripeAccountId) {
      return { data: null, error: ErrorCode.STRIPE_ACCOUNT_NOT_CONNECTED };
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
        error: ErrorCode.FAILED_REQUEST,
      };
    }
  },
);

export const getCustomerPayments = createProtectedAction(
  Permission.INTER_BUSINESS_PAYMENT_VIEW,
  async (user, { page, pageSize }: { page: number; pageSize: number }) => {
    if (!user.businessId) {
      return { data: null, error: ErrorCode.BUSINESS_NOT_FOUND };
    }

    try {
      const business = await get_business_by_id(user.businessId);
      if (business.error || !business.data?.stripeAccountId) {
        return { data: null, error: ErrorCode.STRIPE_ACCOUNT_NOT_CONNECTED };
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
      return { data: null, error: ErrorCode.FAILED_REQUEST };
    }
  },
);
