import { useMemo } from "react";
import type { CartItem } from "@/lib/types";
import { calculateAllOrderAmounts } from "@/server/business-logic/orders";
import { useBusinessSettings } from "./use-queries";

export interface UseOrderCalculationsParams {
  cartProducts: Array<CartItem & { quantity: number }>;
  enabled?: boolean;
}

export function useOrderCalculations({
  cartProducts,
  enabled = true,
}: UseOrderCalculationsParams) {
  const {
    data: settings,
    isLoading: isLoadingSettings,
    isError,
  } = useBusinessSettings();

  const orderItems = useMemo(
    () =>
      cartProducts.map((product) => ({
        productId: product.id,
        quantity: product.quantity,
        unitPrice: (product.price || 0).toString(),
        discount: "0",
      })),
    [cartProducts],
  );

  const calculations = useMemo(() => {
    if (!settings || !enabled) {
      return null;
    }

    const taxRateSetting = settings.find((s) => s.key === "defaultVatRate");
    const pricesIncludeTaxSetting = settings.find(
      (s) => s.key === "pricesIncludeTax",
    );

    const taxRate = taxRateSetting ? Number(taxRateSetting.value) || 0 : 0;
    const pricesIncludeTax = pricesIncludeTaxSetting
      ? Boolean(pricesIncludeTaxSetting.value)
      : false;

    return calculateAllOrderAmounts(
      orderItems,
      taxRate,
      0, // shipping - TODO: calculate from shipping settings
      pricesIncludeTax,
    );
  }, [settings, orderItems, enabled]);

  return {
    calculations,
    isLoading: isLoadingSettings,
    isError,

    subtotal: calculations?.subtotal ?? 0,
    netSubtotal: calculations?.netSubtotal ?? 0,
    grossSubtotal: calculations?.grossSubtotal ?? 0,
    tax: calculations?.tax ?? 0,
    discounts: calculations?.discounts ?? 0,
    shipping: calculations?.shipping ?? 0,
    total: calculations?.total ?? 0,
    pricesIncludeTax: calculations?.pricesIncludeTax ?? false,
    hasError: calculations?.error !== null && calculations?.error !== undefined,
  };
}
