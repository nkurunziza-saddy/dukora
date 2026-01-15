import { useCallback } from "react";
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils";
import { CURRENCIES, formatCurrencyWithCode } from "@/lib/utils/currency-utils";
import { useBusinessSettings } from "./use-queries";

export const useCurrency = () => {
  const { data: settings } = useBusinessSettings();

  const currency =
    (settings?.find((s) => s.key === "currency")?.value as string) || "RWF";

  const formatCurrency = useCallback(
    (value: number | string | null | undefined) => {
      return formatCurrencyUtil(value, currency);
    },
    [currency],
  );

  const formatWithCode = useCallback(
    (value: number | string | null | undefined, currencyCode?: string) => {
      return formatCurrencyWithCode(value, currencyCode || currency);
    },
    [currency],
  );

  return {
    currency,
    formatCurrency,
    formatWithCode,
    currencies: CURRENCIES,
  };
};
