"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useCartActions } from "@/contexts/cart-context";
import type { CartItem } from "@/lib/types";

interface AddToCartButtonProps {
  product: CartItem;
  className?: string;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export function AddToCartButton({
  product,
  className,
  variant = "default",
  size = "default",
}: AddToCartButtonProps) {
  const t = useTranslations("store");
  const { addItem } = useCartActions();

  const handleAddToCart = () => {
    if (!product.costPrice) {
      return;
    }

    addItem(product);
  };

  const isOutOfStock =
    !product.availableStock || Number(product.availableStock) <= 0;

  return (
    <Button
      className={className}
      disabled={isOutOfStock}
      onClick={handleAddToCart}
      size={size}
      variant={variant}
    >
      {isOutOfStock ? t("outOfStock") : t("addToCart")}
    </Button>
  );
}
