"use client";

import { format } from "date-fns";
import {
  Calendar,
  CheckCircle,
  Clock,
  Package,
  Truck,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrencyWithCode } from "@/lib/utils/currency-utils";

type BadgeVariant =
  | "default"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "outline";

interface StoreOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  fulfillmentStatus: string;
  totalAmount: string | number;
  createdAt: string | Date;
  items?: unknown[];
}

interface StoreOrdersTableProps {
  orders: StoreOrder[];
}

const statusIcons = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  PROCESSING: Package,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
  REFUNDED: XCircle,
  PARTIALLY_REFUNDED: XCircle,
};

const statusVariants: Record<string, BadgeVariant> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  PROCESSING: "default",
  SHIPPED: "default",
  DELIVERED: "success",
  CANCELLED: "error",
  REFUNDED: "error",
  PARTIALLY_REFUNDED: "secondary",
};

const fulfillmentVariants: Record<string, BadgeVariant> = {
  PENDING: "secondary",
  RESERVED: "default",
  PICKED: "default",
  PACKED: "default",
  SHIPPED: "default",
  DELIVERED: "success",
};

export function StoreOrdersTable({ orders }: StoreOrdersTableProps) {
  if (orders.length === 0) {
    return (
      <Card>
        <CardPanel>
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No Orders Yet</EmptyTitle>
              <EmptyDescription>
                {" "}
                Orders from your online store will appear here
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardPanel>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Store Orders</CardTitle>
        <CardDescription>
          Manage and track orders from your online store
        </CardDescription>
      </CardHeader>
      <CardPanel>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Fulfillment</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const StatusIcon =
                statusIcons[order.status as keyof typeof statusIcons] || Clock;

              return (
                <TableRow className="hover:bg-transparent" key={order.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{order.orderNumber}</span>
                      <span className="text-sm text-muted-foreground">
                        {order.items?.length || 0} items
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{order.customerName}</span>
                      <span className="text-sm text-muted-foreground">
                        {order.customerEmail}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className="gap-1"
                      variant={statusVariants[order.status]}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        fulfillmentVariants[order.fulfillmentStatus] ||
                        "secondary"
                      }
                    >
                      {order.fulfillmentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {formatCurrencyWithCode(Number(order.totalAmount))}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(order.createdAt), "MMM d, yyyy")}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardPanel>
    </Card>
  );
}
