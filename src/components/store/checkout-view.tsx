"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import { CheckoutForm } from "../forms/checkout-form";
import { Button } from "../ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "../ui/empty";
import { OrderSummary } from "./order-summary";

export function CheckoutView() {
  const { state } = useCart();
  const params = useParams();
  const businessId = params.businessId as string;

  if (state.items.length === 0) {
    return (
      <div className="mb-8 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Your cart is empty</EmptyTitle>
              <EmptyDescription>Add some products to checkout</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                render={<Link href={`/store/${businessId}/products`} />}
                size="sm"
              >
                Go to Store
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      </div>
    );
  }
  return (
    <div className="mb-8 space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        <div>
          <CheckoutForm cartProducts={state.items} />
        </div>
        <div>
          <OrderSummary cartProducts={state.items} />
        </div>
      </div>
    </div>
  );
}
