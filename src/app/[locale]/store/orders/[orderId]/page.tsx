import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { OrderStatusBadge } from "@/components/store/order-status-badge";
import { OrderTimeline } from "@/components/store/order-timeline";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrencyWithCode } from "@/lib/utils/currency-utils";
import { getOrderWithItems } from "@/server/actions/shopper/orders-actions";

interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface OrderItem {
  id: string;
  productName?: string;
  productSku?: string;
  quantity: number;
  unitPrice: string | number;
}

export default async function OrderPage(
  props: PageProps<"/[locale]/store/orders/[orderId]">
) {
  const t = await getTranslations("store.orders");
  const orderId = (await props.params).orderId;
  const result = await getOrderWithItems({ orderId });

  if (result.error || !result.data) {
    notFound();
  }

  const order = result.data;
  const shippingAddress = order.shippingAddress as Address;
  const billingAddress = order.billingAddress as Address;

  return (
    <div className="min-h-screen bg-surface">
      <div className="pgtx py-6">
        <Button
          className="mb-6"
          render={<Link href={`/store/orders/track`} />}
          size="sm"
          variant="ghost"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          {t("backToOrders")}
        </Button>

        <div className="bg-background border border-border/2 p-8">
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-semibold">
                    {t("orderNumber")}: {order.orderNumber}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("placedOn")}:{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-base font-semibold mb-4">
                {t("orderStatus")}
              </h2>
              <OrderTimeline
                fulfillmentStatus={order.fulfillmentStatus}
                status={order.status}
              />
            </div>

            <Separator />

            <div>
              <h2 className="text-base font-semibold mb-4">
                {t("orderItems")}
              </h2>
              <div className="space-y-4">
                {order.items.map((item: OrderItem) => (
                  <div
                    className="flex items-center justify-between py-3 border-b last:border-0"
                    key={item.id}
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {item.productName || "Product"}
                      </p>
                      {item.productSku && (
                        <p className="text-xs text-muted-foreground">
                          SKU: {item.productSku}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        {item.quantity} ×{" "}
                        {formatCurrencyWithCode(
                          parseFloat(item.unitPrice),
                          order.currency || "RWF"
                        )}
                      </p>
                      <p className="text-sm font-semibold">
                        {formatCurrencyWithCode(
                          item.quantity * parseFloat(item.unitPrice),
                          order.currency || "RWF"
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-base font-semibold mb-4">
                {t("orderSummary")}
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("subtotal")}</span>
                  <span>
                    {formatCurrencyWithCode(
                      parseFloat(order.totalAmount) -
                        parseFloat(order.taxAmount) -
                        parseFloat(order.shippingAmount) +
                        parseFloat(order.discountAmount),
                      order.currency || "RWF"
                    )}
                  </span>
                </div>
                {parseFloat(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("discount")}
                    </span>
                    <span className="text-success-foreground">
                      -
                      {formatCurrencyWithCode(
                        parseFloat(order.discountAmount),
                        order.currency || "RWF"
                      )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("shipping")}</span>
                  <span>
                    {formatCurrencyWithCode(
                      parseFloat(order.shippingAmount),
                      order.currency || "RWF"
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("tax")}</span>
                  <span>
                    {formatCurrencyWithCode(
                      parseFloat(order.taxAmount),
                      order.currency || "RWF"
                    )}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-base font-semibold">
                  <span>{t("total")}</span>
                  <span>
                    {formatCurrencyWithCode(
                      parseFloat(order.totalAmount),
                      order.currency || "RWF"
                    )}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-base font-semibold mb-3">
                  {t("shippingAddress")}
                </h2>
                <div className="text-sm space-y-1">
                  <p>{order.customerName}</p>
                  <p>{shippingAddress.street}</p>
                  <p>
                    {shippingAddress.city}, {shippingAddress.state}{" "}
                    {shippingAddress.postalCode}
                  </p>
                  <p>{shippingAddress.country}</p>
                </div>
              </div>
              <div>
                <h2 className="text-base font-semibold mb-3">
                  {t("billingAddress")}
                </h2>
                <div className="text-sm space-y-1">
                  <p>{order.customerName}</p>
                  <p>{billingAddress.street}</p>
                  <p>
                    {billingAddress.city}, {billingAddress.state}{" "}
                    {billingAddress.postalCode}
                  </p>
                  <p>{billingAddress.country}</p>
                </div>
              </div>
            </div>

            {order.trackingNumber && (
              <>
                <Separator />
                <div>
                  <h2 className="text-base font-semibold mb-3">
                    {t("tracking")}
                  </h2>
                  <p className="text-sm">
                    {t("trackingNumber")}:{" "}
                    <span className="font-medium">{order.trackingNumber}</span>
                  </p>
                  {order.trackingUrl && (
                    <Button
                      className="mt-2"
                      render={<Link href={order.trackingUrl} target="_blank" />}
                      size="sm"
                      variant="outline"
                    >
                      {t("trackShipment")}
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
