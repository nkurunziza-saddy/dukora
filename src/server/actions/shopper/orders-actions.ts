"use server";

import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { generateRandomCode } from "@/lib/utils/generate-random-code";
import { calculateAllOrderAmounts } from "@/server/business-logic/orders";
import { ERROR_CODE } from "@/server/constants/errors";
import { PERMISSION } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import { get_by_id as get_business_by_id } from "@/server/repos/business/business-repo";
import { get_all as get_business_settings } from "@/server/repos/business/business-settings-repo/business-settings-query-repo";
import * as shopperOrderRepo from "@/server/repos/shopper/shopper-order-repo";

export const getCustomerOrders = createProtectedAction(
  PERMISSION.USER_VIEW,
  async (user) => {
    const result = await shopperOrderRepo.get_by_user_id(user.id);
    if (result.error) {
      return { data: null, error: result.error };
    }
    return { data: result.data, error: null };
  },
);

const createCustomerOrderSchema = z.object({
  customerEmail: z.email(),
  customerName: z.string().min(1),
  customerPhone: z.string().optional(),
  shippingAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
  }),
  billingAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
  }),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
      unitPrice: z.string(),
      discount: z.string().optional(),
    }),
  ),
  guestCheckout: z.boolean(),
  userId: z.string().optional(),
  notes: z.string().optional(),
});

export const createCustomerOrder = createProtectedAction(
  PERMISSION.INTER_BUSINESS_PAYMENT_INITIATE,
  async (user, input: z.infer<typeof createCustomerOrderSchema>) => {
    if (!user.businessId) {
      return { data: null, error: ERROR_CODE.BUSINESS_NOT_FOUND };
    }

    const business = await get_business_by_id(user.businessId);
    if (business.error || !business.data?.stripeAccountId) {
      return { data: null, error: ERROR_CODE.STRIPE_ACCOUNT_NOT_CONNECTED };
    }

    try {
      const orderNumber = `ORD-${generateRandomCode()}-${Math.random().toString(36).substr(2, 9)}`;

      const settingsResult = await get_business_settings(user.businessId);
      let taxRate = 0;
      let pricesIncludeTax = false;
      let currency = "RWF";

      if (settingsResult.data) {
        const taxRateSetting = settingsResult.data.find(
          (s) => s.key === "defaultVatRate",
        );
        if (taxRateSetting) {
          taxRate = Number(taxRateSetting.value) || 0;
        }

        const pricesIncludeTaxSetting = settingsResult.data.find(
          (s) => s.key === "pricesIncludeTax",
        );

        currency = settingsResult.data?.find((s) => s.key === "currency")
          ?.value as string;
        if (pricesIncludeTaxSetting) {
          pricesIncludeTax = Boolean(pricesIncludeTaxSetting.value);
        }
      }

      const calculations = calculateAllOrderAmounts(
        input.items,
        taxRate,
        0, // TODO: calculate shipping rate
        pricesIncludeTax,
      );

      if (calculations.error) {
        return { data: null, error: calculations.error };
      }

      const orderResult = await shopperOrderRepo.create_customer_order({
        orderNumber,
        businessId: user.businessId,
        customerEmail: input.customerEmail,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        shippingAddress: input.shippingAddress,
        billingAddress: input.billingAddress,
        totalAmount: calculations.total.toString(),
        discountAmount: calculations.discounts.toString(),
        taxAmount: calculations.tax.toString(),
        shippingAmount: calculations.shipping.toString(),
        guestCheckout: input.guestCheckout,
        userId: input.userId,
        notes: input.notes,
        items: input.items,
      });

      if (orderResult.error) {
        return { data: null, error: orderResult.error };
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(calculations.total * 100),
        currency: currency,
        metadata: {
          orderId: orderResult.data.id,
          businessId: user.businessId,
          customerEmail: input.customerEmail,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      await shopperOrderRepo.update_customer_order_payment(
        orderResult.data.id,
        paymentIntent.id,
        paymentIntent.status,
      );

      return {
        data: {
          orderId: orderResult.data.id,
          orderNumber: orderResult.data.orderNumber,
          clientSecret: paymentIntent.client_secret,
        },
        error: null,
      };
    } catch (error) {
      console.error("Failed to create customer order:", error);
      return { data: null, error: ERROR_CODE.FAILED_REQUEST };
    }
  },
);

export const confirmCustomerOrder = async (paymentIntentId: string) => {
  if (!paymentIntentId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    // Get order by payment intent
    const orderResult =
      await shopperOrderRepo.get_by_stripe_payment_intent(paymentIntentId);
    if (orderResult.error || !orderResult.data) {
      return { data: null, error: ERROR_CODE.NOT_FOUND };
    }

    // Update order status to confirmed
    const updateResult = await shopperOrderRepo.update_customer_order_status(
      orderResult.data.id,
      "CONFIRMED",
      "succeeded",
    );

    if (updateResult.error) {
      return { data: null, error: updateResult.error };
    }

    return {
      data: {
        orderId: orderResult.data.id,
        orderNumber: orderResult.data.orderNumber,
      },
      error: null,
    };
  } catch (error) {
    console.error("Failed to confirm customer order:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

export const getCustomerOrderById = async (orderId: string) => {
  if (!orderId) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const orderResult = await shopperOrderRepo.get_by_id(orderId);
    if (orderResult.error) {
      return { data: null, error: orderResult.error };
    }

    const itemsResult = await shopperOrderRepo.get_items_by_order_id(orderId);
    if (itemsResult.error) {
      return { data: null, error: itemsResult.error };
    }

    return {
      data: {
        ...orderResult.data,
        items: itemsResult.data,
      },
      error: null,
    };
  } catch (error) {
    console.error("Failed to get customer order by id:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

export const getCustomerOrderByOrderNumber = async (orderNumber: string) => {
  if (!orderNumber) {
    return { data: null, error: ERROR_CODE.MISSING_INPUT };
  }

  try {
    const orderResult = await shopperOrderRepo.get_by_order_number(orderNumber);
    if (orderResult.error) {
      return { data: null, error: orderResult.error };
    }

    const itemsResult = await shopperOrderRepo.get_items_by_order_id(
      orderResult.data.id,
    );
    if (itemsResult.error) {
      return { data: null, error: itemsResult.error };
    }

    return {
      data: {
        ...orderResult.data,
        items: itemsResult.data,
      },
      error: null,
    };
  } catch (error) {
    console.error("Failed to get customer order by order number:", error);
    return { data: null, error: ERROR_CODE.FAILED_REQUEST };
  }
};

export const getCustomerOrdersByBusiness = createProtectedAction(
  PERMISSION.INTER_BUSINESS_PAYMENT_VIEW,
  async (
    user,
    {
      page,
      pageSize,
      search,
      status,
    }: {
      page: number;
      pageSize: number;
      search?: string;
      status?: string;
    },
  ) => {
    if (!user.businessId) {
      return { data: null, error: ERROR_CODE.BUSINESS_NOT_FOUND };
    }

    try {
      const result = await shopperOrderRepo.get_all_paginated(
        user.businessId,
        page,
        pageSize,
        search,
        status,
      );

      return result;
    } catch (error) {
      console.error("Failed to get customer orders by business:", error);
      return { data: null, error: ERROR_CODE.FAILED_REQUEST };
    }
  },
);

export const updateOrderStatus = createProtectedAction(
  PERMISSION.INTER_BUSINESS_PAYMENT_INITIATE,
  async (
    user,
    {
      orderId,
      status,
    }: {
      orderId: string;
      status: string;
    },
  ) => {
    if (!user.businessId) {
      return { data: null, error: ERROR_CODE.BUSINESS_NOT_FOUND };
    }

    try {
      const orderResult = await shopperOrderRepo.get_by_id(orderId);
      if (orderResult.error || !orderResult.data) {
        return { data: null, error: ERROR_CODE.NOT_FOUND };
      }

      if (orderResult.data.businessId !== user.businessId) {
        return { data: null, error: ERROR_CODE.UNAUTHORIZED };
      }

      const result = await shopperOrderRepo.update_customer_order_status(
        orderId,
        status,
      );

      return result;
    } catch (error) {
      console.error("Failed to update order status:", error);
      return { data: null, error: ERROR_CODE.FAILED_REQUEST };
    }
  },
);

export const getUserOrders = createProtectedAction(
  PERMISSION.USER_VIEW,
  async (
    user,
    {
      page = 1,
      pageSize = 10,
      status,
    }: {
      page?: number;
      pageSize?: number;
      status?: string;
    } = {},
  ) => {
    try {
      const result = await shopperOrderRepo.get_user_orders({
        userId: user.id,
        page,
        pageSize,
        status,
      });

      return result;
    } catch (error) {
      console.error("Failed to get user orders:", error);
      return { data: null, error: ERROR_CODE.FAILED_REQUEST };
    }
  },
);

export const getOrderWithItems = createProtectedAction(
  PERMISSION.USER_VIEW,
  async (user, { orderId }: { orderId: string }) => {
    if (!orderId) {
      return { data: null, error: ERROR_CODE.MISSING_INPUT };
    }

    try {
      const result = await shopperOrderRepo.get_order_with_items(
        orderId,
        user.id,
      );
      return result;
    } catch (error) {
      console.error("Failed to get order with items:", error);
      return { data: null, error: ERROR_CODE.FAILED_REQUEST };
    }
  },
);

export const getOrderStats = createProtectedAction(
  PERMISSION.USER_VIEW,
  async (user) => {
    try {
      const result = await shopperOrderRepo.get_order_stats(user.id);
      return result;
    } catch (error) {
      console.error("Failed to get order stats:", error);
      return { data: null, error: ERROR_CODE.FAILED_REQUEST };
    }
  },
);
