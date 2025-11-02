"use client";

import { SearchIcon, ShoppingCartIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { CartSidebar } from "@/components/cart/cart-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart, useCartActions } from "@/contexts/cart-context";

export function StoreHeader() {
  const t = useTranslations("store");
  const { state } = useCart();
  const { toggleCart } = useCartActions();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link className="flex items-center space-x-2" href="/store">
          <div className="h-8 w-8 rounded bg-primary" />
          <span className="text-xl font-bold">Dukora Store</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-10" placeholder={t("searchProducts")} />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-4">
          <Link href="/store">
            <Button variant="ghost">{t("home")}</Button>
          </Link>
          <Link href="/store/products">
            <Button variant="ghost">{t("products")}</Button>
          </Link>
          <Link href="/store/categories">
            <Button variant="ghost">{t("categories")}</Button>
          </Link>
          <Link href="/store/orders/track">
            <Button variant="ghost">{t("trackOrder")}</Button>
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button size="icon" variant="ghost">
            <UserIcon className="h-4 w-4" />
          </Button>
          <Button
            className="relative"
            onClick={toggleCart}
            size="icon"
            variant="ghost"
          >
            <ShoppingCartIcon className="h-4 w-4" />
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
      {state.isOpen && <CartSidebar />}
    </header>
  );
}
