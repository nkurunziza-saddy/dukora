"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCustomerOrders } from "@/server/actions/customer-order-actions";

export default function TrackOrderPage() {
  const t = useTranslations("store.orders.track");

  const {
    data: orders,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["customer-orders"],
    queryFn: async () => {
      const result = await getCustomerOrders({});
      if (result.error || !result.data) {
        toast.error(t("ordersNotFound"));
        throw new Error(result.error || "Failed to fetch orders");
      }
      return result.data;
    },
  });

  if (isError) {
    //TODO; Add a cleaner error
  }

  return (
    <div className="pt-10 pb-24 md:pb-32 md:pt-16 lg:pb-40 min-h-[calc(100vh-3rem)]">
      <div className="pgtx ">
        <div className="mb-8">
          <h1 className="text-xl font-medium text-foreground mb-2 text-balance">
            {t("myOrders")}
          </h1>
          <p className="text-sm text-text-secondary text-pretty">
            {t("myOrdersDescription")}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : !orders || orders.length === 0 ? (
          <Empty>
            <EmptyTitle>{t("noOrdersFound")}</EmptyTitle>
            <EmptyDescription>{t("noOrdersFoundDescription")}</EmptyDescription>
            <Button render={<Link href="/store/products" />}>
              {t("continueShopping")}
            </Button>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("orderNumber")}</TableHead>
                <TableHead>{t("orderDate")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead className="text-right">{t("total")}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    ${parseFloat(order.totalAmount).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      render={<Link href={`/store/orders/${order.id}`} />}
                      size="sm"
                      variant="outline"
                    >
                      {t("viewOrder")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
