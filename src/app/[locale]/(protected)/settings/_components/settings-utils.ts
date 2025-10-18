"use client";
import { z } from "zod";

export const LIMITS = {
  VAT_RATE_MIN: 0,
  VAT_RATE_MAX: 100,
  DESCRIPTION_MAX: 500,
  NAME_MIN: 2,
  NAME_MAX: 100,
  DOMAIN_MAX: 253,
  LOGO_URL_MAX: 500,
  REGISTRATION_NUMBER_MAX: 50,
  CATEGORY_LIMIT: 10,
  WAREHOUSE_LIMIT: 10,
};

export const settingsSchema = z.object({
  currency: z.string().min(1, "Currency is required"),
  country: z.string().min(1, "Country is required"),
  timezone: z.string().min(1, "Timezone is required"),
  fiscalStartMonth: z.string().min(1, "Fiscal start month is required"),
  pricesIncludeTax: z.boolean(),
  defaultVatRate: z
    .number()
    .min(
      LIMITS.VAT_RATE_MIN,
      `VAT rate must be at least ${LIMITS.VAT_RATE_MIN}%`
    )
    .max(LIMITS.VAT_RATE_MAX, `VAT rate cannot exceed ${LIMITS.VAT_RATE_MAX}%`),
  businessDescription: z
    .string()
    .max(
      LIMITS.DESCRIPTION_MAX,
      `Description cannot exceed ${LIMITS.DESCRIPTION_MAX} characters`
    )
    .optional(),
  invoicePrefix: z
    .string()
    .max(10, "Invoice prefix cannot exceed 10 characters"),
  invoiceNumberStart: z.number().min(1, "Invoice number must start from 1"),
});

export const stripeConnectSchema = z.object({
  stripeAccountId: z.string(),
  isConnected: z.boolean(),
});

export const businessDetailsSchema = z.object({
  name: z
    .string()
    .min(LIMITS.NAME_MIN, `Name must be at least ${LIMITS.NAME_MIN} characters`)
    .max(LIMITS.NAME_MAX, `Name cannot exceed ${LIMITS.NAME_MAX} characters`),
  domain: z
    .string()
    .max(
      LIMITS.DOMAIN_MAX,
      `Domain cannot exceed ${LIMITS.DOMAIN_MAX} characters`
    ),
  // TODO: Enble regex checking
  // .regex(
  //   /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/,
  //   "Please enter a valid domain"
  // )
  businessType: z.string(),
  description: z.string(),
  logoUrl: z
    // TODO: Add url validation in form
    .string("Please enter a valid URL")
    .max(
      LIMITS.LOGO_URL_MAX,
      `Logo URL cannot exceed ${LIMITS.LOGO_URL_MAX} characters`
    ),
  registrationNumber: z.string().optional(),
  isActive: z.boolean(),
});

export const categoriesSchema = z.object({
  categories: z
    .array(z.string())
    .max(
      LIMITS.CATEGORY_LIMIT,
      `You can select up to ${LIMITS.CATEGORY_LIMIT} categories`
    ),
});

export const warehousesSchema = z
  .object({
    warehouses: z
      .array(
        z.object({
          name: z
            .string()
            .min(1, "Warehouse name is required")
            .max(
              LIMITS.NAME_MAX,
              `Name cannot exceed ${LIMITS.NAME_MAX} characters`
            ),
          isDefault: z.boolean(),
        })
      )
      .min(1, "At least one warehouse is required")
      .max(
        LIMITS.WAREHOUSE_LIMIT,
        `You can have up to ${LIMITS.WAREHOUSE_LIMIT} warehouses`
      ),
  })
  .refine((data) => data.warehouses.filter((w) => w.isDefault).length === 1, {
    message: "Exactly one warehouse must be set as default",
    path: ["warehouses"],
  });
