import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ProductView } from "@/components/store/product/product-view";
import { Button } from "@/components/ui/button";
import { getProductByIdForStore } from "@/server/actions/product-actions";

interface ProductDetailsProps {
  productId: string;
}

export default async function ProductDetails({ productId }: ProductDetailsProps) {
  const t = await getTranslations("store");
  const { data: product, error } = await getProductByIdForStore(productId);

  if (error || !product) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t("productNotFound")}</h1>
          <p className="text-muted-foreground mb-6">
            {t("productNotFoundDescription")}
          </p>
          <Button render={<Link href="/store/products" />}>
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            {t("backToProducts")}
          </Button>
        </div>
      </div>
    );
  }

  return <ProductView product={product} />;
}
