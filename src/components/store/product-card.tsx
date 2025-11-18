import Link from "next/link";
import { AddToCartButton } from "@/components/store/cart/add-to-cart-button";
import type { CartItem } from "@/lib/types";

const ProductCard = ({ product }: { product: CartItem }) => {
  return (
    <div className="bg-background p-8 md:p-10 hover:bg-surface transition-colors group">
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-foreground">
          <Link href={`/store/products/${product.id}`}>{product.name}</Link>
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
            ${parseFloat(product.price || "0").toFixed(2)}
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
