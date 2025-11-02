import {
  FilterIcon,
  GridIcon,
  ListIcon,
  SearchIcon,
  StarIcon,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";
import { getProductsForStore } from "@/server/actions/product-actions";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "store.products",
  });
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const t = await getTranslations("store");
  const resolvedSearchParams = await searchParams;

  const page = Number(resolvedSearchParams.page) || 1;
  const search = resolvedSearchParams.search as string;
  const category = resolvedSearchParams.category as string;
  const sortBy = (resolvedSearchParams.sortBy as string) || "name";
  const sortOrder = (resolvedSearchParams.sortOrder as string) || "asc";

  // Get products with filters
  const { data: productsData, error } = await getProductsForStore({
    page,
    pageSize: 12,
    search,
    category,
    sortBy: sortBy as "name" | "price" | "createdAt",
    sortOrder: sortOrder as "asc" | "desc",
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

  const products = productsData?.products || [];
  const totalPages = productsData?.totalPages || 1;

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("allProducts")}</h1>
        <p className="text-muted-foreground">
          {t("browseAllProducts")} ({productsData?.totalCount || 0}{" "}
          {t("products")})
        </p>
      </div>

      {/* Filters and Search */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10"
                defaultValue={search}
                placeholder={t("searchProducts")}
              />
            </div>
          </div>

          {/* Sort */}
          <Select defaultValue={sortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder={t("sortBy")} />
            </SelectTrigger>
            <SelectPopup>
              <SelectItem value="name">{t("sortByName")}</SelectItem>
              <SelectItem value="price">{t("sortByPrice")}</SelectItem>
              <SelectItem value="createdAt">{t("sortByNewest")}</SelectItem>
            </SelectPopup>
          </Select>

          {/* View Toggle */}
          <div className="flex border rounded-lg">
            <Button className="rounded-r-none" size="sm" variant="ghost">
              <GridIcon className="h-4 w-4" />
            </Button>
            <Button className="rounded-l-none" size="sm" variant="ghost">
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline">
            <FilterIcon className="mr-2 h-4 w-4" />
            {t("allCategories")}
          </Button>
          <Button size="sm" variant="outline">
            {t("electronics")}
          </Button>
          <Button size="sm" variant="outline">
            {t("clothing")}
          </Button>
          <Button size="sm" variant="outline">
            {t("home")}
          </Button>
          <Button size="sm" variant="outline">
            {t("books")}
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {t("noProductsFound")}
          </p>
          <p className="text-muted-foreground">{t("tryDifferentFilters")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
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
                  parseFloat(product.costPrice) > parseFloat(product.price) && (
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <div className="flex items-center space-x-2">
            <Button disabled={page === 1} variant="outline">
              {t("previous")}
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    size="sm"
                    variant={page === pageNum ? "default" : "outline"}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button disabled={page === totalPages} variant="outline">
              {t("next")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
