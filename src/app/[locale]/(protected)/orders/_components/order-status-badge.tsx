"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

interface OrderStatusBadgeProps {
  status: string;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const t = useTranslations("orders.status");

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "secondary";
      case "CONFIRMED":
        return "default";
      case "PROCESSING":
        return "default";
      case "SHIPPED":
        return "default";
      case "DELIVERED":
        return "success";
      case "CANCELLED":
        return "error";
      default:
        return "secondary";
    }
  };

  return (
    <Badge variant={getStatusVariant(status)}>{t(status.toLowerCase())}</Badge>
  );
}
