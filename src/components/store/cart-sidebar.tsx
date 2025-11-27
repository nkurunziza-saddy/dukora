"use client";

import { MinusIcon, PlusIcon, TrashIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { useCart, useCartActions } from "@/contexts/cart-context";
import {
  Sheet,
  SheetDescription,
  SheetHeader,
  SheetPopup,
  SheetTitle,
} from "../ui/sheet";

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
    <Sheet open={state.isOpen} onOpenChange={toggleCart}>
      <SheetPopup>
        <SheetHeader>
          <SheetTitle>
            {t("shoppingCart")} ({state.totalItems})
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          {state.items.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>{t("yourCartIsEmpty")}</EmptyTitle>
                <EmptyDescription>{t("addItemsToGetStarted")}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={toggleCart} size={"sm"}>
                  {t("continueShopping")}
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="space-y-4">
              {state.items.map((item) => (
                <div
                  className="flex items-start space-x-3 rounded-lg border p-3"
                  key={item.id}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      ${item.price}
                    </p>

                    <div className="mt-3 flex items-center space-x-2">
                      <Button
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity - 1)
                        }
                        size="icon-sm"
                        variant="outline"
                      >
                        <MinusIcon />
                      </Button>
                      <span className="w-8 text-center text-sm">
                        {item.quantity}
                      </span>
                      <Button
                        disabled={item.quantity >= item.availableStock}
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity + 1)
                        }
                        size="icon-sm"
                        variant="outline"
                      >
                        <PlusIcon />
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={() => removeItem(item.id)}
                    size="icon-xs"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground/85"
                  >
                    <XIcon />
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
                render={<Link href={`/store/checkout`} />}
              >
                {t("proceedToCheckout")}
              </Button>
              <div className="flex space-x-2">
                <Button
                  className="flex-1"
                  onClick={toggleCart}
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
      </SheetPopup>
    </Sheet>
  );
}
