"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import type { Product } from "@/lib/schema/schema-types";

interface OrderSummaryProps {
  cartProducts: Array<Product & { quantity: number }>;
}

export function OrderSummary({ cartProducts }: OrderSummaryProps) {
  const t = useTranslations("store.checkout");

  const subtotal = cartProducts.reduce(
    (sum, product) => sum + (product.sellingPrice || 0) * product.quantity,
    0
  );

  const discount = 0; // TODO: Calculate discounts
  const tax = 0; // TODO: Calculate tax
  const shipping = 0; // TODO: Calculate shipping
  const total = subtotal - discount + tax + shipping;

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle>{t("orderSummary")}</CardTitle>
      </CardHeader>
      <CardPanel className="space-y-4">
        {/* Cart Items */}
        <div className="space-y-3">
          {cartProducts.map((product) => (
            <div className="flex items-center space-x-3" key={product.id}>
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                {product.imageUrl ? (
                  <Image
                    alt={product.name}
                    className="h-full w-full object-cover"
                    height={48}
                    src={product.imageUrl}
                    width={48}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                    {t("noImage")}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate">{product.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {t("quantity")}: {product.quantity}
                </p>
                {product.stockQuantity && product.stockQuantity < 10 && (
                  <Badge className="text-xs" variant="warning">
                    {t("lowStock")}
                  </Badge>
                )}
              </div>

              <div className="text-sm font-medium">
                ${((product.sellingPrice || 0) * product.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t("subtotal")}</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>{t("discount")}</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span>{t("tax")}</span>
            <span>${tax.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>{t("shipping")}</span>
            <span>
              {shipping === 0 ? t("free") : `$${shipping.toFixed(2)}`}
            </span>
          </div>

          <div className="border-t pt-2">
            <div className="flex justify-between text-base font-semibold">
              <span>{t("total")}</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
          <p>{t("securityNotice")}</p>
        </div>
      </CardPanel>
    </Card>
  );
}
