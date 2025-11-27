"use server";
import { ERROR_CODE } from "@/server/constants/errors";
import { PERMISSION } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as stripeConnectRepo from "@/server/repos/payments/stripe-connect-repo";

export const createStripeConnectedAccount = createProtectedAction(
  PERMISSION.BUSINESS_UPDATE,
  async (user) => {
    if (!user.businessId) {
      return { data: null, error: ERROR_CODE.BUSINESS_NOT_FOUND };
    }
    const result = await stripeConnectRepo.create_connected_account(
      user.id,
      user.businessId
    );
    if (result.error) {
      return { data: null, error: result.error };
    }
    return { data: result.data, error: null };
  }
);

export const createStripeAccountLink = createProtectedAction(
  PERMISSION.BUSINESS_UPDATE,
  async (
    user,
    {
      stripeAccountId,
      refreshUrl,
      returnUrl,
    }: { stripeAccountId: string; refreshUrl: string; returnUrl: string }
  ) => {
    if (!user.businessId) {
      return { data: null, error: ERROR_CODE.BUSINESS_NOT_FOUND };
    }
    const result = await stripeConnectRepo.create_account_link(
      stripeAccountId,
      refreshUrl,
      returnUrl
    );
    if (result.error) {
      return { data: null, error: result.error };
    }
    return { data: result.data, error: null };
  }
);

export const getStripeAccount = createProtectedAction(
  PERMISSION.BUSINESS_VIEW,
  async (user, stripeAccountId: string) => {
    if (!user.businessId) {
      return { data: null, error: ERROR_CODE.BUSINESS_NOT_FOUND };
    }
    const result = await stripeConnectRepo.get_account(stripeAccountId);
    if (result.error) {
      return { data: null, error: result.error };
    }
    return { data: result.data, error: null };
  }
);
