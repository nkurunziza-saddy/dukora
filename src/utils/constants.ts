import { TransactionType, UserRole } from "@/lib/schema/schema-types";

export const userRolesObject = [
  { value: UserRole.ADMIN, label: "Admin" },
  { value: UserRole.OWNER, label: "Owner" },
  { value: UserRole.MEMBER, label: "Member" },
  { value: UserRole.VIEW_ONLY, label: "View only" },
];
export const transactionTypesObject = [
  { value: TransactionType.DAMAGE, label: "Damage" },
  { value: TransactionType.PURCHASE, label: "Purchase" },
  { value: TransactionType.SALE, label: "Sale" },
  { value: TransactionType.RETURN_PURCHASE, label: "Return Purchase" },
  { value: TransactionType.RETURN_SALE, label: "Return Sale" },
];

export const businessTypes = [
  { value: "retail", label: "businessTypeRetail" },
  { value: "wholesale", label: "businessTypeWholesale" },
  { value: "restaurant", label: "businessTypeRestaurant" },
  { value: "manufacturing", label: "businessTypeManufacturing" },
  { value: "service", label: "businessTypeService" },
  { value: "other", label: "businessTypeOther" },
];

export const defaultCategories = [
  { value: "electronics", name: "categoryElectronics" },
  { value: "clothing", name: "categoryClothing" },
  { value: "food", name: "categoryFood" },
  { value: "health", name: "categoryHealth" },
  { value: "home", name: "categoryHome" },
  { value: "sports", name: "categorySports" },
  { value: "books", name: "categoryBooks" },
  { value: "office", name: "categoryOffice" },
];

export const currencies = [
  { value: "RWF", label: "currencyRWF" },
  { value: "USD", label: "currencyUSD" },
  { value: "EUR", label: "currencyEUR" },
  { value: "GBP", label: "currencyGBP" },
];

export const countries = [
  { value: "RW", label: "countryRW", timezone: "Africa/Kigali" },
  { value: "US", label: "countryUS", timezone: "America/New_York" },
  { value: "GB", label: "countryGB", timezone: "Europe/London" },
  { value: "DE", label: "countryDE", timezone: "Europe/Berlin" },
];

export const months = [
  { value: "1", label: "monthJanuary" },
  { value: "2", label: "monthFebruary" },
  { value: "3", label: "monthMarch" },
  { value: "4", label: "monthApril" },
  { value: "5", label: "monthMay" },
  { value: "6", label: "monthJune" },
  { value: "7", label: "monthJuly" },
  { value: "8", label: "monthAugust" },
  { value: "9", label: "monthSeptember" },
  { value: "10", label: "monthOctober" },
  { value: "11", label: "monthNovember" },
  { value: "12", label: "monthDecember" },
];
