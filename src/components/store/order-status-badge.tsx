import { Badge } from "@/components/ui/badge";

interface OrderStatusBadgeProps {
  status: string;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const statusConfig: Record<
    string,
    {
      label: string;
      variant: any;
    }
  > = {
    DRAFT: { label: "Draft", variant: "outline" },
    PENDING: { label: "Pending", variant: "warning" },
    PROCESSING: { label: "Processing", variant: "warning" },
    CONFIRMED: { label: "Confirmed", variant: "success" },
    SHIPPED: { label: "Shipped", variant: "success" },
    DELIVERED: { label: "Delivered", variant: "success" },
    CANCELLED: { label: "Cancelled", variant: "destructive" },
    REFUNDED: { label: "Refunded", variant: "destructive" },
  };

  const config = statusConfig[status] || { label: status, variant: "outline" };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
