"use client";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { SelectPurchaseOrder } from "@/lib/schema/schema.types";

export function CreateOrderDialog() {
  const t = useTranslations("orders");
  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" />}>
        {t("createOrder")}
      </DialogTrigger>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>{t("createOrder")}</DialogTitle>
          <DialogDescription>{t("createOrderDescription")}</DialogDescription>
        </DialogHeader>
        <OrderForm />
      </DialogPopup>
    </Dialog>
  );
}
export default function OrderForm({ order }: { order?: SelectPurchaseOrder }) {
  return <div>Order Form Placeholder</div>;
}
