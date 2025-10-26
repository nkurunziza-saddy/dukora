import { constructMetadata } from "@/lib/config/metadata";
import type { Metadata } from "next";
import { LayersIcon, WarehouseIcon } from "lucide-react";
import StatCard from "@/components/shared/stat-card";
import { getProducts } from "@/server/actions/product-actions";
import { getWarehouses } from "@/server/actions/warehouse-actions";
import { getWarehouseItemsByBusiness } from "@/server/actions/warehouse-item-actions";
import WarehouseTableClient from "./warehouse-clients";

export const metadata: Metadata = constructMetadata({
  title: "Inventory",
});

export default async function WarehousePage() {
  const [warehousesRes, warehouseItemsRes, productsRes] = await Promise.all([
    getWarehouses({}),
    getWarehouseItemsByBusiness({}),
    getProducts({}),
  ]);
  const warehouses = warehousesRes.data || [];
  const warehouseItems = warehouseItemsRes.data || [];
  const products = productsRes.data || [];

  const stats = [
    {
      title: "Warehouses",
      value: warehouses.length,
      subText: "Total number of warehouses",
      icon: WarehouseIcon,
    },
    {
      title: "Warehouse Items",
      value: warehouseItems.length,
      subText: "Total items across all warehouses",
      icon: WarehouseIcon,
    },
    {
      title: "Products",
      value: products.length,
      subText: "Total number of products in warehouses",
      icon: LayersIcon,
    },
  ];

  return (
    <div className="space-y-10">
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => (
          <StatCard
            key={`${item.title}-${item.subText}`}
            icon={item.icon}
            subText={item.subText}
            title={item.title}
            value={item.value}
          />
        ))}
      </div>
      <WarehouseTableClient
        warehouses={warehouses}
        warehouseItems={warehouseItems}
        products={products}
      />
    </div>
  );
}