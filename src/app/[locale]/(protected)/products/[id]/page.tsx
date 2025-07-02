import { getProductById } from "@/server/actions/product-actions";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductSummaryCard from "./_components/product-summary-card";
import ProductStockLevels from "./_components/product-stock-levels";
import ProductTransactions from "./_components/product-transactions";
import ProductSuppliers from "./_components/product-suppliers";

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string } >}) {
  const { data: product, error } = await getProductById((await params).id);

  if (error || !product) {
    notFound();
  }

  const t = await getTranslations("product");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{product.name}</h1>
      <ProductSummaryCard product={product} />
      <Tabs defaultValue="stock">
        <TabsList>
          <TabsTrigger value="stock">{t("stockLevels")}</TabsTrigger>
          <TabsTrigger value="transactions">{t("transactions")}</TabsTrigger>
          <TabsTrigger value="suppliers">{t("suppliers")}</TabsTrigger>
        </TabsList>
        <TabsContent value="stock">
          <ProductStockLevels warehouseItems={product.warehouseItems} />
        </TabsContent>
        <TabsContent value="transactions">
          <ProductTransactions transactions={product.transactions} />
        </TabsContent>
        <TabsContent value="suppliers">
          <ProductSuppliers productSupplier={product.productSuppliers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
