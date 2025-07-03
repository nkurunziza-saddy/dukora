import { createProtectedAction } from "@/server/helpers/action-factory";
import { Permission } from "@/server/constants/permissions";
import { ErrorCode } from "@/server/constants/errors";
import * as stripeConnectRepo from "@/server/repos/stripe-connect-repo";

export const createStripeConnectedAccount = createProtectedAction(
  Permission.BUSINESS_UPDATE,
  async (user) => {
    if (!user.businessId) {
      return { data: null, error: ErrorCode.BUSINESS_NOT_FOUND };
    }
    const result = await stripeConnectRepo.createConnectedAccount(
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
  Permission.BUSINESS_UPDATE,
  async (
    user,
    {
      stripeAccountId,
      refreshUrl,
      returnUrl,
    }: { stripeAccountId: string; refreshUrl: string; returnUrl: string }
  ) => {
    if (!user.businessId) {
      return { data: null, error: ErrorCode.BUSINESS_NOT_FOUND };
    }
    const result = await stripeConnectRepo.createAccountLink(
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
  Permission.BUSINESS_VIEW,
  async (user, stripeAccountId: string) => {
    if (!user.businessId) {
      return { data: null, error: ErrorCode.BUSINESS_NOT_FOUND };
    }
    const result = await stripeConnectRepo.getAccount(stripeAccountId);
    if (result.error) {
      return { data: null, error: result.error };
    }
    return { data: result.data, error: null };
  }
);
