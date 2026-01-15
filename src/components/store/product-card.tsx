"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import type { CartItem } from "@/lib/types";
import { formatCurrencyWithCode } from "@/lib/utils/currency-utils";

interface ProductCardProps {
  product: CartItem;
  view?: "grid" | "list";
}

const ProductCard = ({ product, view = "grid" }: ProductCardProps) => {
  const params = useParams();
  const businessId = params.businessId as string;
  if (view === "list") {
    return (
      <div className="bg-background p-6 md:p-8 hover:bg-surface transition-colors group">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-base font-semibold text-foreground mb-2">
                <Link href={`/store/${businessId}/products/${product.id}`}>
                  {product.name}
                </Link>
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                {product.description}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-muted-foreground">
                {product.availableStock || 0} in stock
              </span>
              <span className="border py-0.5 px-1.5 text-muted-foreground">
                {product.categoryValue}
              </span>
            </div>
          </div>
          <div className="flex md:flex-col items-start md:items-end justify-between md:justify-start gap-3 md:min-w-[140px]">
            <span className="text-base text-secondary-foreground font-medium">
              {formatCurrencyWithCode(
                parseFloat(product.price || "0"),
                product.currency || "RWF",
              )}
            </span>
            <AddToCartButton product={product} size="sm" variant="outline" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background p-8 md:p-10 hover:bg-surface transition-colors group">
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-foreground">
          <Link href={`/store/${businessId}/products/${product.id}`}>
            {product.name}
          </Link>
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          {product.description}
        </p>
      </div>
      <div className="mt-2">
        <span className="text-sm text-muted-foreground">
          {product.availableStock || 0} in stock
        </span>
      </div>
      <div className="mt-1">
        <div className="flex justify-between items-center">
          <span className="text-sm text-secondary-foreground font-medium">
            {formatCurrencyWithCode(
              parseFloat(product.price || "0"),
              product.currency || "RWF",
            )}
          </span>
          <span className="text-xs border py-0.5 px-1 text-muted-foreground">
            {product.categoryValue}
          </span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <AddToCartButton product={product} size="sm" variant="outline" />
      </div>
    </div>
  );
};

export default ProductCard;
