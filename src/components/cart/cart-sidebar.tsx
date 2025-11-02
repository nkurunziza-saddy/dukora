"use client";

import {
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  TrashIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
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

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/50"
        onClick={toggleCart}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            toggleCart();
          }
        }}
        type="button"
      />

      {/* Sidebar */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center space-x-2">
              <ShoppingCartIcon className="h-5 w-5" />
              <h2 className="text-lg font-semibold">
                {t("shoppingCart")} ({state.totalItems})
              </h2>
            </div>
            <Button onClick={toggleCart} size="icon" variant="ghost">
              <XIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {state.items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <ShoppingCartIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {t("yourCartIsEmpty")}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t("addItemsToGetStarted")}
                </p>
                <Button asChild onClick={toggleCart}>
                  <Link href="/store/products">{t("continueShopping")}</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div
                    className="flex items-center space-x-3 rounded-lg border p-3"
                    key={item.id}
                  >
                    {/* Product Image */}
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                      {item.imageUrl ? (
                        <Image
                          alt={item.name}
                          className="h-full w-full object-cover"
                          height={64}
                          src={item.imageUrl}
                          width={64}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
                          {t("noImage")}
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        ${item.price.toFixed(2)}
                      </p>

                      {/* Quantity Controls */}
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
                          disabled={item.quantity >= item.maxQuantity}
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

                    {/* Remove Button */}
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

          {/* Footer */}
          {state.items.length > 0 && (
            <div className="border-t p-4 space-y-4">
              {/* Total */}
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>{t("total")}</span>
                <span>${state.totalPrice.toFixed(2)}</span>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button asChild className="w-full" onClick={toggleCart}>
                  <Link href="/store/checkout">{t("proceedToCheckout")}</Link>
                </Button>
                <div className="flex space-x-2">
                  <Button
                    asChild
                    className="flex-1"
                    onClick={toggleCart}
                    variant="outline"
                  >
                    <Link href="/store/products">{t("continueShopping")}</Link>
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
