"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { useOrderCalculations } from "@/lib/hooks/use-order-calculations";
import type { CartItem } from "@/lib/types";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";

interface OrderSummaryProps {
  cartProducts: Array<CartItem & { quantity: number }>;
}

export function OrderSummary({ cartProducts }: OrderSummaryProps) {
  const t = useTranslations("store.checkout");

  const {
    netSubtotal,
    grossSubtotal,
    tax,
    discounts,
    shipping,
    total,
    pricesIncludeTax,
    isLoading,
    isError,
  } = useOrderCalculations({ cartProducts });

  return (
    <div className="sticky top-18 px-4 border-t border-r border-b py-4">
      <div className="mb-6">
        <div className="text-base font-medium">{t("orderSummary")}</div>
      </div>
      <div className="space-y-4">
        <div className="space-y-3">
          {cartProducts.map((product) => (
            <div className="flex items-start space-x-3" key={product.id}>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm line-clamp-1 truncate">
                  {product.name}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {t("quantity")}: {product.quantity}
                </p>
                {product.availableStock && product.availableStock < 10 && (
                  <Badge className="text-xs" variant="warning">
                    {t("lowStock")}
                  </Badge>
                )}
              </div>

              <div className="text-sm">
                ${((Number(product.price) || 0) * product.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <Separator className={"border-t border-dashed my-4"} />

        <div className="space-y-2">
          {pricesIncludeTax ? (
            <>
              <div className="flex justify-between text-sm">
                <span>{t("subtotal")}</span>
                {isLoading ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  <span>${grossSubtotal.toFixed(2)}</span>
                )}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground pl-4">
                <span>{t("taxIncluded")}</span>
                {isLoading ? (
                  <Skeleton className="h-3 w-12" />
                ) : (
                  <span>${tax.toFixed(2)}</span>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between text-sm">
                <span>{t("subtotal")}</span>
                {isLoading ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  <span>${netSubtotal.toFixed(2)}</span>
                )}
              </div>
              <div className="flex justify-between text-sm">
                <span>{t("tax")}</span>
                {isLoading ? (
                  <Skeleton className="h-4 w-12" />
                ) : (
                  <span>${tax.toFixed(2)}</span>
                )}
              </div>
            </>
          )}

          {discounts > 0 && (
            <div className="flex justify-between text-sm text-success-foreground">
              <span>{t("discount")}</span>
              <span>-${discounts.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span>{t("shipping")}</span>
            <span>
              {shipping === 0 ? t("free") : `$${shipping.toFixed(2)}`}
            </span>
          </div>

          <Separator className={"border-t border-dashed my-4"} />

          <div className="flex justify-between text-sm font-medium">
            <span>{t("total")}</span>
            {isLoading ? (
              <Skeleton className="h-5 w-20" />
            ) : (
              <span>${total.toFixed(2)}</span>
            )}
          </div>

          {isError && (
            <div className="text-xs text-destructive">
              {t("calculationError")}
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
          <p>{t("securityNotice")}</p>
        </div>
      </div>
    </div>
  );
}
