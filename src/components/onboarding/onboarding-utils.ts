import {
  Building2Icon,
  MapPinIcon,
  PackageIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import z from "zod";
import { USER_ROLES } from "@/lib/schema/models/enums";
import { CURRENCIES } from "@/lib/utils/currency-utils";

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
  defaultVatRate: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true;
        const num = parseFloat(val);
        return !Number.isNaN(num) && num >= 0 && num <= 100;
      },
      { message: "VAT rate must be between 0 and 100" },
    ),
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

export const getSteps = (t: (key: string) => string) => [
  {
    step: 1,
    title: t("steps.businessProfile"),
    description: t("steps.businessProfileDescription"),
    icon: Building2Icon,
  },
  {
    step: 2,
    title: t("steps.taxSettings"),
    description: t("steps.taxSettingsDescription"),
    icon: SettingsIcon,
  },
  {
    step: 3,
    title: t("steps.teamSetup"),
    description: t("steps.teamSetupDescription"),
    icon: UsersIcon,
  },
  {
    step: 4,
    title: t("steps.categories"),
    description: t("steps.categoriesDescription"),
    icon: PackageIcon,
  },
  {
    step: 5,
    title: t("steps.warehousesBranches"),
    description: t("steps.warehousesBranchesDescription"),
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
export const getCurrencies = () => {
  return CURRENCIES.map((currency) => ({
    value: currency.code,
    label: currency.label,
  }));
};

export const getCountries = (t: (key: string) => string) => [
  { value: "RW", label: t("countryRW"), timezone: "Africa/Kigali" },
  { value: "US", label: t("countryUS"), timezone: "America/New_York" },
  { value: "GB", label: t("countryGB"), timezone: "Europe/London" },
  { value: "DE", label: t("countryDE"), timezone: "Europe/Berlin" },
];

export const getMonths = (t: (key: string) => string) => [
  { value: "1", label: t("months.january") },
  { value: "2", label: t("months.february") },
  { value: "3", label: t("months.march") },
  { value: "4", label: t("months.april") },
  { value: "5", label: t("months.may") },
  { value: "6", label: t("months.june") },
  { value: "7", label: t("months.july") },
  { value: "8", label: t("months.august") },
  { value: "9", label: t("months.september") },
  { value: "10", label: t("months.october") },
  { value: "11", label: t("months.november") },
  { value: "12", label: t("months.december") },
];
