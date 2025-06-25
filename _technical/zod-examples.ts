/* eslint-disable @typescript-eslint/no-unused-vars */

import * as z from "zod";

// 1. String cleaning and normalization
const cleanString = z
  .string()
  .transform((val) => val.trim()) // Remove whitespace
  .transform((val) => val.replace(/\s+/g, " ")) // Normalize multiple spaces
  .refine((val) => val.length > 0, "Cannot be empty");

// 2. Phone number cleaning
const phoneSchema = z
  .string()
  .transform((val) => val.replace(/\D/g, "")) // Remove non-digits
  .refine((val) => val.length >= 10, "Phone must be at least 10 digits")
  .transform((val) => {
    // Format as (XXX) XXX-XXXX
    return `(${val.slice(0, 3)}) ${val.slice(3, 6)}-${val.slice(6, 10)}`;
  });

// 3. Email cleaning
const emailSchema = z
  .string()
  .transform((val) => val.trim().toLowerCase()) // Clean and normalize
  .email("Invalid email format");

// 4. Currency cleaning
const currencySchema = z
  .string()
  .transform((val) => val.replace(/[$,\s]/g, "")) // Remove $, commas, spaces
  .refine((val) => !isNaN(Number(val)), "Must be a valid number")
  .transform((val) => Number.parseFloat(val))
  .refine((val) => val >= 0, "Must be positive");

// 5. Array cleaning (remove empty items)
const tagsSchema = z
  .array(z.string())
  .transform((arr) => arr.map((item) => item.trim())) // Clean each item
  .transform((arr) => arr.filter((item) => item.length > 0)) // Remove empty
  .transform((arr) => [...new Set(arr)]); // Remove duplicates

// 6. Conditional cleaning
const conditionalSchema = z.object({
  type: z.enum(["physical", "digital"]),
  weight: z
    .string()
    .optional()
    .transform((val) => val?.trim() || undefined)
    .refine((val, ctx) => {
      // Only require weight for physical products
      if (ctx.parent.type === "physical" && !val) {
        return false;
      }
      return true;
    }, "Weight is required for physical products")
    .transform((val) => (val ? Number.parseFloat(val) : undefined)),
});

// 7. Date cleaning
const dateSchema = z
  .string()
  .transform((val) => val.trim())
  .refine((val) => !isNaN(Date.parse(val)), "Invalid date")
  .transform((val) => new Date(val));

// 8. URL cleaning
const urlSchema = z
  .string()
  .transform((val) => val.trim())
  .transform((val) => {
    // Add https:// if no protocol
    if (val && !val.startsWith("http")) {
      return `https://${val}`;
    }
    return val;
  })
  .refine((val) => {
    if (!val) return true;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, "Invalid URL");
