"use client";

import { ArrowLeftIcon, MinusIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { StoreProduct } from "@/lib/types";
import { formatCurrencyWithCode } from "@/lib/utils/currency-utils";

export function ProductView({ product }: { product: StoreProduct }) {
  const t = useTranslations("store");
  const router = useRouter();

  const isOnSale =
    product.costPrice &&
    parseFloat(product.costPrice) > parseFloat(product.price || "0");
  const finalPrice = parseFloat(product.price || "0");

  return (
    <div className="pt-10 pb-24 md:pb-32 md:pt-16 lg:pb-40 min-h-[calc(100vh-3rem)]">
      <div className="pgtx">
        <Button className="mb-6" onClick={() => router.back()} variant="ghost">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          {t("backToProducts")}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              {product.imageUrl ? (
                <Image
                  alt={product.name}
                  className="w-full h-full object-cover"
                  height={600}
                  src={product.imageUrl}
                  width={600}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-lg">
                  {t("noImage")}
                </div>
              )}
            </div>
          </div> */}

          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold mb-2">{product.name}</h1>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium">
                  {product.availableStock || 0} in stock
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                SKU: {product.sku}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-lg font-semibold">
                  {formatCurrencyWithCode(
                    finalPrice,
                    product.currency || "RWF"
                  )}
                </span>
                {isOnSale && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      {formatCurrencyWithCode(
                        parseFloat(product.costPrice || "0"),
                        product.currency || "RWF"
                      )}
                    </span>
                    <Badge className="text-sm" variant="error">
                      Sale
                    </Badge>
                  </>
                )}
              </div>
              {isOnSale && (
                <p className="text-sm text-success-foreground font-medium">
                  {t("youSave")}{" "}
                  {formatCurrencyWithCode(
                    parseFloat(product.costPrice || "0") - finalPrice,
                    product.currency || "RWF"
                  )}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">{t("availability")}:</span>{" "}
                <span
                  className={
                    product.availableStock && product.availableStock > 0
                      ? "text-success-foreground"
                      : "text-destructive-foreground"
                  }
                >
                  {product.availableStock && product.availableStock > 0
                    ? `${t("inStock")} (${product.availableStock} ${t("available")})`
                    : t("outOfStock")}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="quantity">
                {t("quantity")}
              </label>
              <div className="flex items-center space-x-3 mt-2">
                <Button size="icon-sm" variant="outline">
                  <MinusIcon className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center font-medium" id="quantity">
                  1
                </span>
                <Button size="icon-sm" variant="outline">
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <AddToCartButton className="w-full" product={product} size="lg" />
              <Button className="w-full" size="lg" variant="outline">
                {t("buyNow")}
              </Button>
            </div>

            <Separator className={"my-4"} />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t("productDetails")}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">{t("sku")}:</span> {product.sku}
                </div>
                <div>
                  <span className="font-medium">{t("category")}:</span>{" "}
                  {product.categoryValue || t("uncategorized")}
                </div>

                <div>
                  <span className="font-medium">{t("weight")}:</span>{" "}
                  {product.weight || t("notSpecified")}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">{t("description")}</h2>
            <p className="text-muted-foreground">
              {product.description || t("noDescriptionAvailable")}
            </p>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-xl font-semibold mb-6">{t("relatedProducts")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-muted-foreground py-2">
              {t("noRelatedProducts")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
