"use client";

import { useCart } from "@/contexts/cart-context";
import { CheckoutForm } from "./checkout-form";
import { OrderSummary } from "./order-summary";

export function CheckoutView() {
  const { state } = useCart();

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
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
