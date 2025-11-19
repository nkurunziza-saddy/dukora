"use client";

import {
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  TrashIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useCart, useCartActions } from "@/contexts/cart-context";

export function CartSidebar() {
  const t = useTranslations("store.cart");
  const { state } = useCart();
  const { removeItem, updateQuantity, clearCart, toggleCart } =
    useCartActions();

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };
  console.log("Cart State:", state);
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute right-0 top-15 h-full w-full max-w-md bg-background shadow-xl data-starting-style:animate-in data-ending-style:animate-out transition ease-in-out data-ending-style:duration-300 data-starting-style:duration-500">
        <div className="flex min-h-[calc(100vh-4rem)] bg-popover h-full flex-col">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-2">
              <h2 className="font-medium font-heading">
                {t("shoppingCart")} ({state.totalItems})
              </h2>
            </div>
            <Button onClick={toggleCart} size="icon" variant="ghost">
              <XIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {state.items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <ShoppingCartIcon className="size-8 text-muted-foreground mb-4" />
                <h3 className="font-medium mb-1">{t("yourCartIsEmpty")}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {t("addItemsToGetStarted")}
                </p>
                <Button
                  onClick={toggleCart}
                  render={<Link href="/store/products" />}
                >
                  {t("continueShopping")}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div
                    className="flex items-center space-x-3 rounded-lg border p-3"
                    key={item.id}
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        ${item.price}
                      </p>

                      <div className="mt-2 flex items-center space-x-2">
                        <Button
                          className="h-6 w-6"
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          size="icon"
                          variant="outline"
                        >
                          <MinusIcon className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          className="h-6 w-6"
                          disabled={item.quantity >= item.availableStock}
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          size="icon"
                          variant="outline"
                        >
                          <PlusIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <Button
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(item.id)}
                      size="icon"
                      variant="ghost"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {state.items.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="flex items-center justify-between font-medium">
                <span>{t("total")}</span>
                <span className="font-semibold">
                  ${state.totalPrice.toFixed(2)}
                </span>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={toggleCart}
                  render={<Link href="/store/checkout" />}
                >
                  {t("proceedToCheckout")}
                </Button>
                <div className="flex space-x-2">
                  <Button
                    className="flex-1"
                    onClick={toggleCart}
                    render={<Link href="/store/products" />}
                    variant="outline"
                  >
                    {t("continueShopping")}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={clearCart}
                    variant="outline"
                  >
                    {t("clearCart")}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
