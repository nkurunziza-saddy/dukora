"use server";

import { createProtectedAction } from "@/server/helpers/action-factory";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import * as interBusinessPaymentsRepo from "@/server/repos/inter-business-payments-repo";
import { get_by_id as getBusinessByIdRepo } from "@/server/repos/business-repo";
import { stripe } from "@/lib/stripe";

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
    }
  ) => {
    if (!user.businessId) {
      return { data: null, error: ErrorCode.BUSINESS_NOT_FOUND };
    }

    const payerBusiness = await getBusinessByIdRepo(user.businessId);
    if (payerBusiness.error || !payerBusiness.data?.stripeAccountId) {
      return { data: null, error: ErrorCode.STRIPE_ACCOUNT_NOT_CONNECTED };
    }

    const receiverBusiness = await getBusinessByIdRepo(receiverBusinessId);
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
        user.id
      );

      if (paymentRecord.error) {
        // Handle error, potentially cancel payment intent if it was created
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
  }
);

export const getInterBusinessPayments = createProtectedAction(
  Permission.INTER_BUSINESS_PAYMENT_VIEW,
  async (user) => {
    if (!user.businessId) {
      return { data: null, error: ErrorCode.BUSINESS_NOT_FOUND };
    }
    const payments = await interBusinessPaymentsRepo.get_all(user.businessId);
    if (payments.error) {
      return { data: null, error: payments.error };
    }
    return { data: payments.data, error: null };
  }
);
