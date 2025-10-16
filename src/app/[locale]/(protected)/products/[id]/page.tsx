import { getProductById } from "@/server/actions/product-actions";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Tabs, TabsPanel, TabsList, TabsTab } from "@/components/ui/tabs";
import ProductSummaryCard from "./_components/product-summary-card";
import ProductStockLevels from "./_components/product-stock-levels";
import ProductTransactions from "./_components/product-transactions";
import ProductSuppliers from "./_components/product-suppliers";
import { db } from "@/lib/db";

export async function generateStaticParams() {
  const res = await db.query.productsTable.findMany();
  if (!res) return Array.from({ length: 2 }).map((i) => ({ id: i }));
  return res.map((unit) => ({
    id: unit.id,
  }));
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
          <TabsTab value="stock">{t("stockLevels")}</TabsTab>
          <TabsTab value="transactions">{t("transactions")}</TabsTab>
          <TabsTab value="suppliers">{t("suppliers")}</TabsTab>
        </TabsList>
        <TabsPanel value="stock">
          <ProductStockLevels warehouseItems={product.warehouseItems} />
        </TabsPanel>
        <TabsPanel value="transactions">
          <ProductTransactions transactions={product.transactions} />
        </TabsPanel>
        <TabsPanel value="suppliers">
          <ProductSuppliers productSupplier={product.productSuppliers} />
        </TabsPanel>
      </Tabs>
    </div>
  );
}
