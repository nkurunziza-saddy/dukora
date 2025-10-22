import { USER_ROLES } from "@/lib/schema/models/enums";
import z from "zod";
import {
  Building2Icon,
  MapPinIcon,
  PackageIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";

export const CATEGORY_LIMIT = 10;
export const INVITATIONS_LIMIT = 5;
export const WAREHOUSES_LIMIT = 5;

export const onboardingSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  businessType: z.string().min(1, "Business type is required"),
  currency: z.string().min(1, "Currency is required"),
  country: z.string().min(1, "Country is required"),
  timezone: z.string().min(1, "Timezone is required"),
  fiscalStartMonth: z.string().min(1, "Fiscal start month is required"),
  pricesIncludeTax: z.boolean(),
  defaultVatRate: z.string(),
  teamMembers: z
    .array(
      z.object({
        email: z.string().email("Invalid email address"),
        role: z.enum([...USER_ROLES]),
      }),
    )
    .max(INVITATIONS_LIMIT, `Maximum invitations is ${INVITATIONS_LIMIT}`),
  categories: z
    .array(z.string())
    .max(CATEGORY_LIMIT, `You can select up to ${CATEGORY_LIMIT} categories`),
  warehouses: z
    .array(
      z.object({
        name: z.string().min(1, "Warehouse name is required"),
        isDefault: z.boolean(),
      }),
    )
    .min(1, "At least one warehouse is required")
    .max(WAREHOUSES_LIMIT, `Allowed warehouses up to ${WAREHOUSES_LIMIT}`),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

export const steps = [
  {
    step: 1,
    title: "Business Profile",
    description: "Set up your business identity",
    icon: Building2Icon,
  },
  {
    step: 2,
    title: "Tax SettingsIcon",
    description: "Configure pricing and taxes",
    icon: SettingsIcon,
  },
  {
    step: 3,
    title: "Team Setup",
    description: "Invite your team members",
    icon: UsersIcon,
  },
  {
    step: 4,
    title: "Categories",
    description: "Choose product categories",
    icon: PackageIcon,
  },
  {
    step: 5,
    title: "Warehouses/Branches",
    description: "Set up your business branches and warehouses management",
    icon: MapPinIcon,
  },
];

export const getBusinessTypes = (t: (key: string) => string) => [
  { value: "retail", label: t("businessTypeRetail") },
  { value: "wholesale", label: t("businessTypeWholesale") },
  { value: "restaurant", label: t("businessTypeRestaurant") },
  { value: "manufacturing", label: t("businessTypeManufacturing") },
  { value: "service", label: t("businessTypeService") },
  { value: "other", label: t("businessTypeOther") },
];
export const getCurrencies = (t: (key: string) => string) => [
  { value: "RWF", label: t("currencyRWF") },
  { value: "USD", label: t("currencyUSD") },
  { value: "EUR", label: t("currencyEUR") },
  { value: "GBP", label: t("currencyGBP") },
];

export const getCountries = (t: (key: string) => string) => [
  { value: "RW", label: t("countryRW"), timezone: "Africa/Kigali" },
  { value: "US", label: t("countryUS"), timezone: "America/New_York" },
  { value: "GB", label: t("countryGB"), timezone: "Europe/London" },
  { value: "DE", label: t("countryDE"), timezone: "Europe/Berlin" },
];

export const getMonths = (t: (key: string) => string) => [
  { value: "1", label: t("monthJanuary") },
  { value: "2", label: t("monthFebruary") },
  { value: "3", label: t("monthMarch") },
  { value: "4", label: t("monthApril") },
  { value: "5", label: t("monthMay") },
  { value: "6", label: t("monthJune") },
  { value: "7", label: t("monthJuly") },
  { value: "8", label: t("monthAugust") },
  { value: "9", label: t("monthSeptember") },
  { value: "10", label: t("monthOctober") },
  { value: "11", label: t("monthNovember") },
  { value: "12", label: t("monthDecember") },
];
