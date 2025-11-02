"use client";

import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getCustomerOrderByOrderNumber } from "@/server/actions/customer-order-actions";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  customerEmail: string;
  customerName: string;
  totalAmount: string;
  createdAt: string;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    unitPrice: string;
  }>;
}

export default function TrackOrderPage() {
  const t = useTranslations("store.orders.track");
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(
    searchParams.get("order") || ""
  );
  const [customerEmail, setCustomerEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderNumber || !customerEmail) {
      toast.error(t("fillAllFields"));
      return;
    }

    setIsLoading(true);
    try {
      const result = await getCustomerOrderByOrderNumber(orderNumber);
      if (result.error || !result.data) {
        toast.error(t("orderNotFound"));
        return;
      }

      // Verify email matches
      if (
        result.data.customerEmail.toLowerCase() !== customerEmail.toLowerCase()
      ) {
        toast.error(t("emailMismatch"));
        return;
      }

      setOrder(result.data as Order);
    } catch (error) {
      console.error("Track order error:", error);
      toast.error(t("trackingError"));
    } finally {
      setIsLoading(false);
    }
  };

  if (order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>{t("orderDetails")}</CardTitle>
            </CardHeader>
            <CardPanel className="space-y-6">
              {/* Order Info */}
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
                <h3 className="font-medium">{t("status")}</h3>
                <p className="text-sm text-muted-foreground">{order.status}</p>
              </div>

              <div>
                <h3 className="font-medium">{t("totalAmount")}</h3>
                <p className="text-lg font-semibold">
                  ${parseFloat(order.totalAmount).toFixed(2)}
                </p>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="mb-3 font-medium">{t("orderItems")}</h3>
                <div className="space-y-2">
                  {order.items?.map((item) => (
                    <div
                      className="flex items-center justify-between rounded-md border p-3"
                      key={item.id}
                    >
                      <div>
                        <p className="font-medium">{item.productId}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("quantity")}: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        $
                        {(parseFloat(item.unitPrice) * item.quantity).toFixed(
                          2
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    setOrder(null);
                    setOrderNumber("");
                    setCustomerEmail("");
                  }}
                  variant="outline"
                >
                  {t("trackAnotherOrder")}
                </Button>
                <Button render={<Link href={`/store/orders/${order.id}`} />}>
                  {t("viewFullDetails")}
                </Button>
              </div>
            </CardPanel>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>{t("trackOrder")}</CardTitle>
            <p className="text-muted-foreground">
              {t("trackOrderDescription")}
            </p>
          </CardHeader>
          <CardPanel>
            <form className="space-y-4" onSubmit={handleTrackOrder}>
              <Field>
                <FieldLabel>{t("orderNumber")}</FieldLabel>
                <Input
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder={t("enterOrderNumber")}
                  value={orderNumber}
                />
              </Field>

              <Field>
                <FieldLabel>{t("customerEmail")}</FieldLabel>
                <Input
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder={t("enterEmail")}
                  type="email"
                  value={customerEmail}
                />
              </Field>

              <Button className="w-full" disabled={isLoading} type="submit">
                <SearchIcon className="mr-2 h-4 w-4" />
                {isLoading ? t("searching") : t("trackOrder")}
              </Button>
            </form>
          </CardPanel>
        </Card>
      </div>
    </div>
  );
}
