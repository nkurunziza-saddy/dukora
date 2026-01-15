import { CheckCircleIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SelectCustomerOrder } from "@/lib/schema/schema.types";
import { formatCurrencyWithCode } from "@/lib/utils/currency-utils";
import { getCustomerOrderByOrderNumber } from "@/server/actions/shopper/orders-actions";

function CheckoutSuccessLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-8 w-1/2 mx-auto mb-2" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </CardHeader>
          <CardPanel className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Skeleton className="h-5 w-1/4 mb-1" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div>
                  <Skeleton className="h-5 w-1/4 mb-1" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <div>
                <Skeleton className="h-5 w-1/4 mb-1" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div>
                <Skeleton className="h-6 w-1/4 mb-1" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            </div>

            <div>
              <Skeleton className="h-5 w-1/4 mb-3" />
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>

            <div className="rounded-md bg-muted p-4">
              <Skeleton className="h-5 w-1/4 mb-2" />
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>
                  <Skeleton className="h-4 w-full" />
                </li>
                <li>
                  <Skeleton className="h-4 w-full" />
                </li>
                <li>
                  <Skeleton className="h-4 w-full" />
                </li>
              </ul>
            </div>

            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>
          </CardPanel>
        </Card>
      </div>
    </div>
  );
}

async function CheckoutSuccessContent({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const t = await getTranslations("store.checkout.success");
  const orderResult = await getCustomerOrderByOrderNumber(
    searchParams.order as string,
  );
  if (!searchParams.order) {
    redirect("/store");
  }

  if (orderResult.error || !orderResult.data) {
    redirect("/store");
  }

  const orderData = orderResult.data;

  const normalizedItems = (orderData.items || []).map((it) => {
    const co = it.customerOrderItem || {};
    return {
      id: co.id ?? "",
      notes: co.notes ?? null,
      customerOrderId: co.customerOrderId ?? "",
      quantity: co.quantity ?? 0,
      warehouseItemId: co.warehouseItemId ?? "",
      unitPrice: co.unitPrice ?? "0",
      discount: co.discount ?? "0",
      productName: it.productName ?? null,
      productId: it.productId ?? null,
    };
  });

  const order = {
    ...orderData,
    items: normalizedItems,
  } as SelectCustomerOrder & {
    items: {
      id: string;
      notes: string | null;
      customerOrderId: string;
      quantity: number;
      warehouseItemId: string;
      unitPrice: string;
      discount: string;
      productName: string | null;
      productId: string | null;
    }[];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success">
              <CheckCircleIcon className="h-8 w-8 text-success-foreground" />
            </div>
            <CardTitle className="text-2xl">{t("orderConfirmed")}</CardTitle>
            <p className="text-muted-foreground">
              {t("orderConfirmedDescription")}
            </p>
          </CardHeader>
          <CardPanel className="space-y-6">
            {/* Order Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">{t("orderNumber")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {order.orderNumber}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">{t("orderDate")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-medium">{t("customerEmail")}</h3>
                <p className="text-sm text-muted-foreground">
                  {order.customerEmail}
                </p>
              </div>

              <div>
                <h3 className="font-medium">{t("totalAmount")}</h3>
                <p className="text-2xl font-bold">
                  {formatCurrencyWithCode(
                    parseFloat(order.totalAmount),
                    order.currency || "RWF",
                  )}
                </p>
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-medium">{t("orderItems")}</h3>
              <div className="space-y-2">
                {order.items?.map((item) => (
                  <div
                    className="flex items-center justify-between rounded-md border p-3"
                    key={item.id}
                  >
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("quantity")}: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm">
                      {formatCurrencyWithCode(
                        parseFloat(item.unitPrice) * item.quantity,
                        order.currency || "RWF",
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-md bg-muted p-4">
              <h3 className="mb-2 font-medium">{t("nextSteps")}</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• {t("confirmationEmail")}</li>
                <li>• {t("orderProcessing")}</li>
                <li>• {t("shippingNotification")}</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <Button
                className="flex-1"
                render={
                  <Link
                    href={`/store/orders/track?order=${order.orderNumber}`}
                  />
                }
              >
                {t("trackOrder")}
              </Button>
              <Button
                className="flex-1"
                render={<Link href="/store" />}
                variant="outline"
              >
                {t("continueShopping")}
              </Button>
            </div>
          </CardPanel>
        </Card>
      </div>
    </div>
  );
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <Suspense fallback={<CheckoutSuccessLoading />}>
      <CheckoutSuccessContent searchParams={await searchParams} />
    </Suspense>
  );
}
