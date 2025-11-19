import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { getProductsForStore } from "@/server/actions/product-actions";
import ProductCard from "./product-card";

export async function FeaturedProducts() {
  const t = await getTranslations("store");

  const { data: productsData, error } = await getProductsForStore({
    page: 1,
    pageSize: 9,
  });

  if (error) {
    return (
      <div className="pt-10 pb-24 md:pb-32 md:pt-16 lg:pb-40 min-h-[calc(100vh-3rem)]">
        <div className="pgtx">
          <div className="text-center text-destructive">
            {t("errorLoadingProducts")}
          </div>
        </div>
      </div>
    );
  }

  const featuredProducts = productsData?.products || [];
  return (
    <section
      className="pt-10 pb-24 md:pb-32 md:pt-16 lg:pb-40 min-h-[calc(100vh-3rem)]"
      id="featured-products"
    >
      <div className="pgtx">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-xl font-medium text-foreground mb-4 text-balance">
            {t("featuredProducts")}
          </h2>
          <Button
            render={(buttonProps) => (
              <Link href="/store/products" {...buttonProps}>
                {t("viewAll")}
              </Link>
            )}
            size={"xs"}
            variant="ghost"
          />
        </div>

        {featuredProducts.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>{t("noProductsAvailable")}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border/2">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
