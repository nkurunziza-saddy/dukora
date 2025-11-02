"use client";

import { ShoppingCartIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useCartActions } from "@/contexts/cart-context";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    sellingPrice?: number;
    imageUrl?: string;
    stockQuantity?: number;
  };
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
    if (!product.sellingPrice) {
      return;
    }

    addItem({
      id: `cart-${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.sellingPrice,
      imageUrl: product.imageUrl,
      maxQuantity: product.stockQuantity || 0,
    });
  };

  const isOutOfStock = !product.stockQuantity || product.stockQuantity <= 0;

  return (
    <Button
      className={className}
      disabled={isOutOfStock}
      onClick={handleAddToCart}
      size={size}
      variant={variant}
    >
      <ShoppingCartIcon className="mr-2 h-4 w-4" />
      {isOutOfStock ? t("outOfStock") : t("addToCart")}
    </Button>
  );
}
