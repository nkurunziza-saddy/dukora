import { getSupplierById } from "@/server/actions/supplier-actions";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SupplierSummaryCard from "./_components/supplier-summary-card";
import SupplierProducts from "./_components/supplier-products";
import { db } from "@/lib/db";

export async function generateStaticParams() {
  const res = await db.query.suppliersTable.findMany();
  if (!res) return Array.from({ length: 2 }).map((i) => ({ id: i }));
  return res.map((supplier) => ({
    id: supplier.id,
  }));
}

export default async function SupplierDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: supplier, error } = await getSupplierById((await params).id);

  if (error || !supplier) {
    notFound();
  }

  const t = await getTranslations("supplier");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{supplier.name}</h1>
      <SupplierSummaryCard supplier={supplier} />
      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">{t("products")}</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <SupplierProducts productSupplier={supplier.productSuppliers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
