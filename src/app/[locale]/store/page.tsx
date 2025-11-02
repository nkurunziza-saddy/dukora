import { ArrowRightIcon, StarIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";
import { getProductsForStore } from "@/server/actions/product-actions";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "store",
  });
}

export default async function StorePage() {
  const t = await getTranslations("store");

  // Get featured products
  const { data: productsData, error } = await getProductsForStore({
    page: 1,
    pageSize: 8,
  });

  if (error) {
    return (
      <div className="container py-8">
        <div className="text-center text-destructive">
          {t("errorLoadingProducts")}
        </div>
      </div>
    );
  }

  const featuredProducts = productsData?.products || [];

  return (
    <div className="container py-8">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          {t("welcomeToStore")}
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          {t("storeDescription")}
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/store/products">
              {t("shopNow")}
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/store/categories">{t("browseCategories")}</Link>
          </Button>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">{t("featuredProducts")}</h2>
          <Button asChild variant="outline">
            <Link href="/store/products">
              {t("viewAll")}
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>{t("noProductsAvailable")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card
                className="group hover:shadow-lg transition-shadow"
                key={product.id}
              >
                <div className="aspect-square bg-muted rounded-t-lg mb-4 relative overflow-hidden">
                  {product.imageUrl ? (
                    <Image
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      height={300}
                      src={product.imageUrl}
                      width={300}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      {t("noImage")}
                    </div>
                  )}
                  {product.costPrice &&
                    product.price &&
                    parseFloat(product.costPrice) >
                      parseFloat(product.price) && (
                      <Badge className="absolute top-2 left-2" variant="error">
                        Sale
                      </Badge>
                    )}
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-2">
                    {product.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardPanel className="pt-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold">
                        ${parseFloat(product.price || "0").toFixed(2)}
                      </span>
                      {product.costPrice &&
                        parseFloat(product.costPrice) >
                          parseFloat(product.price || "0") && (
                          <span className="text-sm text-muted-foreground line-through">
                            ${parseFloat(product.costPrice).toFixed(2)}
                          </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-muted-foreground">
                        {product.availableStock || 0} in stock
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button asChild className="w-full">
                      <Link href={`/store/products/${product.id}`}>
                        {t("viewProduct")}
                      </Link>
                    </Button>
                    <AddToCartButton
                      className="w-full"
                      product={product}
                      variant="outline"
                    />
                  </div>
                </CardPanel>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="py-12 bg-muted/50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-primary-foreground font-bold">🚚</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("freeShipping")}</h3>
            <p className="text-muted-foreground">
              {t("freeShippingDescription")}
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-primary-foreground font-bold">🔄</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("easyReturns")}</h3>
            <p className="text-muted-foreground">
              {t("easyReturnsDescription")}
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-primary-foreground font-bold">💳</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("securePayment")}</h3>
            <p className="text-muted-foreground">
              {t("securePaymentDescription")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
