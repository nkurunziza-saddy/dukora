import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { db } from "@/lib/db";
import { getSupplierById } from "@/server/actions/supplier-actions";
import SupplierProducts from "./_components/supplier-products";
import SupplierSummaryCard from "./_components/supplier-summary-card";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateStaticParams() {
  const res = await db.query.suppliersTable.findMany();
  if (!res) return Array.from({ length: 2 }).map((i) => ({ id: i }));
  return res.map((supplier) => ({
    id: supplier.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { data: supplier, error } = await getSupplierById(id);
  if (error || !supplier) {
    return {
      title: "Supplier Not Found",
    };
  }
  return {
    title: supplier?.name ?? "Supplier",
  };
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
          <TabsTab value="products">{t("products")}</TabsTab>
        </TabsList>
        <TabsPanel value="products">
          <SupplierProducts productSupplier={supplier.productSuppliers} />
        </TabsPanel>
      </Tabs>
    </div>
  );
}
