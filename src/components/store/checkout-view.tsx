"use client";

import { useCart } from "@/contexts/cart-context";
import { CheckoutForm } from "../forms/checkout-form";
import { OrderSummary } from "./order-summary";

export function CheckoutView() {
  const { state } = useCart();

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
