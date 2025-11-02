import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { DataTable } from "@/components/table/data-table";
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { getCustomerOrdersByBusiness } from "@/server/actions/customer-order-actions";
import { OrderActions } from "./_components/order-actions";
import { OrderStatusBadge } from "./_components/order-status-badge";

interface OrdersPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const t = await getTranslations("orders");
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || "1");
  const pageSize = 10;

  const ordersResult = await getCustomerOrdersByBusiness({
    page,
    pageSize,
    search: resolvedSearchParams.search,
    status: resolvedSearchParams.status,
  });

  if (ordersResult.error || !ordersResult.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardPanel className="text-center py-8">
            <p className="text-muted-foreground">{t("errorLoadingOrders")}</p>
          </CardPanel>
        </Card>
      </div>
    );
  }

  const { orders, totalCount, totalPages } = ordersResult.data;

  const columns = [
    {
      accessorKey: "orderNumber",
      header: t("orderNumber"),
    },
    {
      accessorKey: "customerName",
      header: t("customer"),
    },
    {
      accessorKey: "customerEmail",
      header: t("email"),
    },
    {
      accessorKey: "totalAmount",
      header: t("total"),
      cell: ({ row }: { row: { getValue: (key: string) => string } }) => (
        <span>${parseFloat(row.getValue("totalAmount")).toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "status",
      header: t("status"),
      cell: ({ row }: { row: { getValue: (key: string) => string } }) => (
        <OrderStatusBadge status={row.getValue("status")} />
      ),
    },
    {
      accessorKey: "createdAt",
      header: t("orderDate"),
      cell: ({ row }: { row: { getValue: (key: string) => string } }) => (
        <span>{new Date(row.getValue("createdAt")).toLocaleDateString()}</span>
      ),
    },
    {
      id: "actions",
      cell: ({
        row,
      }: {
        row: { original: { id: string; orderNumber: string; status: string } };
      }) => <OrderActions order={row.original} />,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("customerOrders")}</h1>
        <p className="text-muted-foreground">{t("manageCustomerOrders")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("ordersList")}</CardTitle>
        </CardHeader>
        <CardPanel>
          <Suspense fallback={<div>Loading...</div>}>
            <DataTable
              columns={columns}
              data={orders}
              filters={[
                {
                  key: "status",
                  label: t("status"),
                  options: [
                    { label: t("allStatuses"), value: "" },
                    { label: t("draft"), value: "DRAFT" },
                    { label: t("confirmed"), value: "CONFIRMED" },
                    { label: t("processing"), value: "PROCESSING" },
                    { label: t("shipped"), value: "SHIPPED" },
                    { label: t("delivered"), value: "DELIVERED" },
                    { label: t("cancelled"), value: "CANCELLED" },
                  ],
                },
              ]}
              pagination={{
                page,
                pageSize,
                totalCount,
                totalPages,
              }}
              search={{
                placeholder: t("searchOrders"),
                paramName: "search",
              }}
            />
          </Suspense>
        </CardPanel>
      </Card>
    </div>
  );
}
