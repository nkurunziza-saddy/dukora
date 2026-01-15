import type { VariantProps } from "class-variance-authority";
import { Badge, type badgeVariants } from "@/components/ui/badge";

interface OrderStatusBadgeProps {
  status: string;
}

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const statusConfig: Record<
    string,
    {
      label: string;
      variant: BadgeVariant;
    }
  > = {
    DRAFT: { label: "Draft", variant: "outline" },
    PENDING: { label: "Pending", variant: "warning" },
    PROCESSING: { label: "Processing", variant: "warning" },
    CONFIRMED: { label: "Confirmed", variant: "success" },
    SHIPPED: { label: "Shipped", variant: "success" },
    DELIVERED: { label: "Delivered", variant: "success" },
    CANCELLED: { label: "Cancelled", variant: "error" },
    REFUNDED: { label: "Refunded", variant: "error" },
  };

  const config = statusConfig[status] || { label: status, variant: "outline" };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
