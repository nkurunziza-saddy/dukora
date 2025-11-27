"use client";
import { MinusIcon, PlusIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { useCart, useCartActions } from "@/contexts/cart-context";

const CartPage = () => {
  const t = useTranslations("store.checkout");
  const router = useRouter();
  const { state } = useCart();
  const { updateQuantity, removeItem, clearCart } = useCartActions();
  const params = useParams();
  const businessId = params.businessId as string;
  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="pt-10 pb-24 md:pb-32 md:pt-16 lg:pb-40 min-h-[calc(100vh-3rem)] ">
        <div className="pgtx ">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Your cart is empty</EmptyTitle>
              <EmptyDescription>
                Add some products to get started
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                render={<Link href={`store/${businessId}/products`} />}
                size="sm"
              >
                Continue Shopping
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      </div>
    );
  }
  return (
    <div className="pt-10 pb-24 md:pb-32 md:pt-16 lg:pb-40 min-h-[calc(100vh-3rem)] ">
      <div className="pgtx ">
        <div className="mb-8">
          <h1 className="text-xl font-medium text-foreground mb-2 text-balance">
            Shopping Cart
          </h1>
          <p className="text-sm text-text-secondary text-pretty">
            {state.totalItems} {state.totalItems === 1 ? "item" : "items"}
          </p>
        </div>
        <div className="mb-8 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 mb-4">
            <div className="flex justify-between items-center">
              <h2 className="font-medium">Items</h2>
              <Button onClick={clearCart} size="sm" variant="ghost">
                Clear All
              </Button>
            </div>
            <div></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div>
              <div className="space-y-0 border">
                {state.items.map((item) => (
                  <div
                    className="bg-background p-6 not-last:border-b"
                    key={item.id}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium mb-1">{item.name}</h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              SKU: {item.sku}
                            </p>
                          </div>
                          <Button
                            className="text-muted-foreground hover:text-foreground/80"
                            onClick={() => removeItem(item.id)}
                            size={"icon-sm"}
                            variant={"ghost"}
                          >
                            <XIcon />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                              size="icon-sm"
                              variant="outline"
                            >
                              <MinusIcon />
                            </Button>
                            <span className="w-10 text-center text-sm font-medium">
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
                              <PlusIcon className="h-4 w-4" />
                            </Button>
                            <span className="text-sm text-muted-foreground ml-2">
                              {item.availableStock} available
                            </span>
                          </div>

                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              ${parseFloat(item.price).toFixed(2)} each
                            </p>
                            <p className="font-medium">
                              $
                              {(parseFloat(item.price) * item.quantity).toFixed(
                                2
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="sticky top-18 px-4 border-t border-r border-b py-4">
                <div className="mb-6">
                  <div className="text-base font-medium">
                    {t("orderSummary")}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Subtotal ({state.totalItems} items)
                      </span>
                      <span className="font-medium">
                        ${state.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Separator className={"border-t border-dashed my-4"} />

                  <div className=" space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t("subtotal")}</span>
                      <span>${state.totalPrice.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>Discount</span>
                      <span>Checked at checkout</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>{t("tax")}</span>
                      <span className="">Calculated at checkout</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>{t("shipping")}</span>
                      <span className="">Calculated at checkout</span>
                    </div>

                    <Separator className={"border-t border-dashed my-4"} />

                    <div className=" flex justify-between text-sm font-medium">
                      <span>{t("total")}</span>
                      <span>${state.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      render={<Link href={`/store/checkout`} />}
                    >
                      Proceed to Checkout
                    </Button>
                    <Button
                      className="w-full"
                      onClick={() => router.back()}
                      variant="outline"
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
