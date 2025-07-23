"use client";

import {
  ExtendableDataTable,
  RowExpansionConfig,
} from "@/components/table/extendable-data-table";
import { WarehouseColumn } from "@/utils/columns/warehouse-column";
import { WarehouseItemColumn } from "@/utils/columns/warehouse-item-column";
import { ProductColumn } from "@/utils/columns/product-column";
import type {
  SelectWarehouse,
  ExtendedWarehouseItemPayload,
  SelectProduct,
} from "@/lib/schema/schema-types";
import { useTranslations } from "next-intl";

function getWarehouseItemCount(
  warehouseId: string,
  warehouseItems: ExtendedWarehouseItemPayload[]
) {
  return warehouseItems.filter((item) => item.warehouseId === warehouseId)
    .length;
}

function getProductCount(warehouseItem: ExtendedWarehouseItemPayload) {
  return warehouseItem.product && warehouseItem.product.id ? 1 : 0;
}

type Props = {
  warehouses: SelectWarehouse[];
  warehouseItems: ExtendedWarehouseItemPayload[];
  products: SelectProduct[];
};

export default function WarehouseTableClient({
  warehouses,
  warehouseItems,
  products,
}: Props) {
  const t = useTranslations("common");
  const warehouseItemsWithProduct: ExtendedWarehouseItemPayload[] =
    warehouseItems.map((item) => ({
      ...item,
      product:
        products.find((p) => p.id === item.productId) || ({} as SelectProduct),
    }));

  const warehousesWithCount: (SelectWarehouse & {
    warehouseItemCount: number;
  })[] = warehouses.map((warehouse) => ({
    ...warehouse,
    warehouseItemCount: getWarehouseItemCount(
      warehouse.id,
      warehouseItemsWithProduct
    ),
  }));

  const warehouseItemsWithProductCount: (ExtendedWarehouseItemPayload & {
    productCount: number;
  })[] = warehouseItemsWithProduct.map((item) => ({
    ...item,
    productCount: getProductCount(item),
  }));

  const warehouseItemExpansion: RowExpansionConfig<
    ExtendedWarehouseItemPayload & { productCount: number }
  > = {
    enabled: true,
    canExpand: (warehouseItem) => {
      return !!warehouseItem.product && !!warehouseItem.product.id;
    },
    renderContent: (warehouseItem) => {
      const product = warehouseItem.product;
      if (!product) return null;
      return (
        <div className="p-2">
          <ExtendableDataTable
            columns={ProductColumn(t)}
            data={[product]}
            expansion={{ enabled: false }}
          />
        </div>
      );
    },
  };

  const warehouseExpansion: RowExpansionConfig<
    SelectWarehouse & { warehouseItemCount: number }
  > = {
    enabled: true,
    canExpand: (warehouse) => {
      return warehouse.warehouseItemCount > 0;
    },
    renderContent: (warehouse) => {
      const items = warehouseItemsWithProductCount.filter(
        (item) => item.warehouseId === warehouse.id
      );
      if (!items.length) return null;
      return (
        <div className="p-2">
          <ExtendableDataTable<
            ExtendedWarehouseItemPayload & { productCount: number },
            unknown
          >
            columns={WarehouseItemColumn(t)}
            data={items}
            expansion={warehouseItemExpansion}
          />
        </div>
      );
    },
  };

  return (
    <ExtendableDataTable<
      SelectWarehouse & { warehouseItemCount: number },
      unknown
    >
      columns={WarehouseColumn(t)}
      data={warehousesWithCount}
      expansion={warehouseExpansion}
    />
  );
}
