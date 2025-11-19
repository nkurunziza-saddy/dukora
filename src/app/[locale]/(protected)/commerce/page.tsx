import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import ColumnWrapper from "@/components/providers/column-wrapper";
import StatCard from "@/components/shared/stat-card";
import { TableSkeleton } from "@/components/skeletons";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";
import { getProductsPaginated } from "@/server/actions/product-actions";
import { CommerceColumn } from "@/utils/columns/commerce-column";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "commerce",
  });
}

const stats = [
  {
    icon: DollarSign,
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1% from last month",
  },
  {
    icon: Users,
    title: "Subscriptions",
    value: "+2350",
    change: "+180.1% from last month",
  },
  {
    icon: ShoppingCart,
    title: "Sales",
    value: "+12,234",
    change: "+19% from last month",
  },
  {
    icon: Package,
    title: "Active Products",
    value: "+573",
    change: "+201 since last hour",
  },
];

export function Stats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard
          icon={stat.icon}
          key={`${stat.title}-`}
          subText={stat.change}
          title={stat.title}
          value={stat.value}
        />
      ))}
    </div>
  );
}

async function CommerceTable({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) {
  const products = await getProductsPaginated({ page, pageSize });

  if (!products.data) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No products found
      </div>
    );
  }

  return (
    <ColumnWrapper
      column={CommerceColumn}
      data={products.data.products}
      page={page}
      pageSize={pageSize}
      tag="commerce"
      totalCount={products.data.totalCount}
    />
  );
}

export default async function CommercePage(
  props: PageProps<"/[locale]/commerce">,
) {
  const query = await props.searchParams;
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;

  return (
    <div className="space-y-6">
      <Stats />
      <Suspense fallback={<TableSkeleton />}>
        <CommerceTable page={page} pageSize={pageSize} />
      </Suspense>
    </div>
  );
}
