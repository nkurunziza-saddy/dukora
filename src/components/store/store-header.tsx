"use client";

import { SearchIcon, ShoppingCartIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { CartSidebar } from "@/components/store/cart/cart-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart, useCartActions } from "@/contexts/cart-context";

const StoreHeader = () => {
  const t = useTranslations("store");
  const { state } = useCart();
  const { toggleCart } = useCartActions();

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="pgtx ">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {t("brand")}
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-4">
            <Link
              className="text-xs text-text-secondary hover:text-foreground transition"
              href="/store"
            >
              {t("home")}
            </Link>
            <Link
              className="text-xs text-text-secondary hover:text-foreground transition"
              href="/store/products"
            >
              {t("products")}
            </Link>
            <Link
              className="text-xs text-text-secondary hover:text-foreground transition"
              href="/store/categories"
            >
              {t("categories")}
            </Link>
            <Link
              className="text-xs text-text-secondary hover:text-foreground transition"
              href="/store/orders/track"
            >
              {t("trackOrder")}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex-1 max-w-xs mx-4">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-7" placeholder={t("searchProducts")} />
              </div>
            </div>
            <Button
              className="relative"
              onClick={toggleCart}
              size="icon-sm"
              variant="ghost"
            >
              <ShoppingCartIcon className="size-3.5" />
              {state.totalItems > 0 && (
                <Badge
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs"
                  variant="error"
                >
                  {state.totalItems}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
      {state.isOpen && <CartSidebar />}
    </nav>
  );
};

export default StoreHeader;
