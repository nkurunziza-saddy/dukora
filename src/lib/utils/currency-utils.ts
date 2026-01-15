export interface Currency {
  code: string;
  label: string;
  symbol: string;
  region: string;
}

export const CURRENCIES: Currency[] = [
  {
    code: "RWF",
    label: "Rwandan Franc (RWF)",
    symbol: "FRw",
    region: "Africa",
  },
  {
    code: "KES",
    label: "Kenyan Shilling (KES)",
    symbol: "KSh",
    region: "Africa",
  },
  {
    code: "UGX",
    label: "Ugandan Shilling (UGX)",
    symbol: "USh",
    region: "Africa",
  },
  {
    code: "TZS",
    label: "Tanzanian Shilling (TZS)",
    symbol: "TSh",
    region: "Africa",
  },
  {
    code: "ZAR",
    label: "South African Rand (ZAR)",
    symbol: "R",
    region: "Africa",
  },
  { code: "NGN", label: "Nigerian Naira (NGN)", symbol: "₦", region: "Africa" },
  {
    code: "GHS",
    label: "Ghanaian Cedi (GHS)",
    symbol: "GH₵",
    region: "Africa",
  },
  {
    code: "EGP",
    label: "Egyptian Pound (EGP)",
    symbol: "E£",
    region: "Africa",
  },
  {
    code: "MAD",
    label: "Moroccan Dirham (MAD)",
    symbol: "DH",
    region: "Africa",
  },

  { code: "USD", label: "US Dollar (USD)", symbol: "$", region: "Americas" },
  { code: "EUR", label: "Euro (EUR)", symbol: "€", region: "Europe" },
  { code: "GBP", label: "British Pound (GBP)", symbol: "£", region: "Europe" },
  { code: "JPY", label: "Japanese Yen (JPY)", symbol: "¥", region: "Asia" },
  { code: "CNY", label: "Chinese Yuan (CNY)", symbol: "¥", region: "Asia" },
  { code: "INR", label: "Indian Rupee (INR)", symbol: "₹", region: "Asia" },
  {
    code: "CAD",
    label: "Canadian Dollar (CAD)",
    symbol: "CA$",
    region: "Americas",
  },
  {
    code: "AUD",
    label: "Australian Dollar (AUD)",
    symbol: "A$",
    region: "Oceania",
  },
  { code: "CHF", label: "Swiss Franc (CHF)", symbol: "CHF", region: "Europe" },
  { code: "SEK", label: "Swedish Krona (SEK)", symbol: "kr", region: "Europe" },
];

export function getCurrencyByCode(code: string): Currency | undefined {
  return CURRENCIES.find((c) => c.code === code);
}

export function getCurrencySymbol(code: string): string {
  const currency = getCurrencyByCode(code);
  return currency?.symbol || code;
}

export function isValidCurrencyCode(code: string): boolean {
  return CURRENCIES.some((c) => c.code === code);
}

export function getCurrenciesByRegion(region: string): Currency[] {
  return CURRENCIES.filter((c) => c.region === region);
}

export function formatCurrencyWithCode(
  value: number | string | null | undefined,
  currencyCode: string = "RWF",
): string {
  if (!value) {
    return `${currencyCode} 0`;
  }

  const numberValue = typeof value === "string" ? parseFloat(value) : value;

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numberValue);

  const numberPart = formatted.replace(/[^0-9.,\s-]/g, "").trim();
  return `${currencyCode} ${numberPart}`;
}
