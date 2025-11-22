"use server";

import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { generateRandomCode } from "@/lib/utils/generate-random-code";
import { calculateAllOrderAmounts } from "@/server/business-logic/orders";
import { ErrorCode } from "@/server/constants/errors";
import { Permission } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import { get_by_id as get_business_by_id } from "@/server/repos/business-repo";
import { get_all as get_business_settings } from "@/server/repos/business-settings-repo/business-settings-query-repo";
import {
  create_customer_order,
  get_all_paginated,
  get_by_id,
  get_by_order_number,
  get_by_stripe_payment_intent,
  get_by_user_id,
  get_items_by_order_id,
  update_customer_order_payment,
  update_customer_order_status,
} from "@/server/repos/customer-order-repo";

export const getCustomerOrders = createProtectedAction(
  Permission.USER_VIEW,
  async (user) => {
    const result = await get_by_user_id(user.id);
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
  Permission.INTER_BUSINESS_PAYMENT_INITIATE,
  async (user, input: z.infer<typeof createCustomerOrderSchema>) => {
    if (!user.businessId) {
      return { data: null, error: ErrorCode.BUSINESS_NOT_FOUND };
    }

    const business = await get_business_by_id(user.businessId);
    if (business.error || !business.data?.stripeAccountId) {
      return { data: null, error: ErrorCode.STRIPE_ACCOUNT_NOT_CONNECTED };
    }

    try {
      const orderNumber = `ORD-${generateRandomCode()}-${Math.random().toString(36).substr(2, 9)}`;

      const settingsResult = await get_business_settings(user.businessId);
      let taxRate = 0;
      let pricesIncludeTax = false;

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

      const orderResult = await create_customer_order({
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
        currency: "usd", // TODO: Make configurable
        metadata: {
          orderId: orderResult.data.id,
          businessId: user.businessId,
          customerEmail: input.customerEmail,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      await update_customer_order_payment(
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
      return { data: null, error: ErrorCode.FAILED_REQUEST };
    }
  },
);

export const confirmCustomerOrder = async (paymentIntentId: string) => {
  if (!paymentIntentId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    // Get order by payment intent
    const orderResult = await get_by_stripe_payment_intent(paymentIntentId);
    if (orderResult.error || !orderResult.data) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    // Update order status to confirmed
    const updateResult = await update_customer_order_status(
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
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export const getCustomerOrderById = async (orderId: string) => {
  if (!orderId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const orderResult = await get_by_id(orderId);
    if (orderResult.error) {
      return { data: null, error: orderResult.error };
    }

    const itemsResult = await get_items_by_order_id(orderId);
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
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export const getCustomerOrderByOrderNumber = async (orderNumber: string) => {
  if (!orderNumber) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const orderResult = await get_by_order_number(orderNumber);
    if (orderResult.error) {
      return { data: null, error: orderResult.error };
    }

    const itemsResult = await get_items_by_order_id(orderResult.data.id);
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
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export const getCustomerOrdersByBusiness = createProtectedAction(
  Permission.INTER_BUSINESS_PAYMENT_VIEW,
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
      return { data: null, error: ErrorCode.BUSINESS_NOT_FOUND };
    }

    try {
      const result = await get_all_paginated(
        user.businessId,
        page,
        pageSize,
        search,
        status,
      );

      return result;
    } catch (error) {
      console.error("Failed to get customer orders by business:", error);
      return { data: null, error: ErrorCode.FAILED_REQUEST };
    }
  },
);

export const updateOrderStatus = createProtectedAction(
  Permission.INTER_BUSINESS_PAYMENT_INITIATE,
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
      return { data: null, error: ErrorCode.BUSINESS_NOT_FOUND };
    }

    try {
      const orderResult = await get_by_id(orderId);
      if (orderResult.error || !orderResult.data) {
        return { data: null, error: ErrorCode.NOT_FOUND };
      }

      if (orderResult.data.businessId !== user.businessId) {
        return { data: null, error: ErrorCode.UNAUTHORIZED };
      }

      const result = await update_customer_order_status(orderId, status);

      return result;
    } catch (error) {
      console.error("Failed to update order status:", error);
      return { data: null, error: ErrorCode.FAILED_REQUEST };
    }
  },
);
