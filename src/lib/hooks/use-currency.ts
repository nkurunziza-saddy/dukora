import { useCallback } from "react";
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils";
import { useBusinessSettings } from "./use-queries";

export const useCurrency = () => {
  const { data: settings } = useBusinessSettings();

  const currency =
    (settings?.find((s) => s.key === "currency")?.value as string) || "USD";

  const formatCurrency = useCallback(
    (value: number | string | null | undefined) => {
      return formatCurrencyUtil(value, currency);
    },
    [currency],
  );

  return {
    currency,
    formatCurrency,
  };
};
