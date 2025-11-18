"use client";

import { ArrowLeftIcon, MinusIcon, PlusIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AddToCartButton } from "@/components/store/cart/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { StoreProduct } from "@/lib/types";

export function ProductView({ product }: { product: StoreProduct }) {
  const t = useTranslations("store");

  const isOnSale =
    product.costPrice &&
    parseFloat(product.costPrice) > parseFloat(product.price || "0");
  const finalPrice = parseFloat(product.price || "0");

  return (
    <div className="container py-8">
      {/* Back Button */}
      <Button
        className="mb-6"
        render={<Link href="/store/products" />}
        variant="ghost"
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        {t("backToProducts")}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
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
          {/* Thumbnail images would go here */}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-muted-foreground text-lg">
              {product.description}
            </p>
          </div>

          {/* Stock Status */}
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

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold">
                ${finalPrice.toFixed(2)}
              </span>
              {isOnSale && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ${parseFloat(product.costPrice || "0").toFixed(2)}
                  </span>
                  <Badge className="text-sm" variant="error">
                    Sale
                  </Badge>
                </>
              )}
            </div>
            {isOnSale && (
              <p className="text-sm text-green-600 font-medium">
                {t("youSave")} $
                {(parseFloat(product.costPrice || "0") - finalPrice).toFixed(2)}
              </p>
            )}
          </div>

          {/* Stock Status */}
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">{t("availability")}:</span>{" "}
              <span
                className={
                  product.availableStock && product.availableStock > 0
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {product.availableStock && product.availableStock > 0
                  ? `${t("inStock")} (${product.availableStock} ${t("available")})`
                  : t("outOfStock")}
              </span>
            </p>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="quantity">
              {t("quantity")}
            </label>
            <div className="flex items-center space-x-3">
              <Button className="h-10 w-10" size="icon" variant="outline">
                <MinusIcon className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium" id="quantity">
                1
              </span>
              <Button className="h-10 w-10" size="icon" variant="outline">
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <AddToCartButton className="w-full" product={product} size="lg" />
            <Button className="w-full" size="lg" variant="outline">
              {t("buyNow")}
            </Button>
          </div>

          {/* Product Info */}
          <Separator />
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

      {/* Product Description */}
      <div className="mt-16">
        <Card>
          <CardHeader>
            <CardTitle>{t("description")}</CardTitle>
          </CardHeader>
          <CardPanel>
            <p className="text-muted-foreground leading-relaxed">
              {product.description || t("noDescriptionAvailable")}
            </p>
          </CardPanel>
        </Card>
      </div>

      {/* Related Products */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">{t("relatedProducts")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Related products would be loaded here */}
          <div className="text-center text-muted-foreground py-8">
            {t("noRelatedProducts")}
          </div>
        </div>
      </div>
    </div>
  );
}
