"use client";

import { ShoppingCartIcon } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { CartSidebar } from "@/components/store/cart-sidebar";
import { GlobalStoreSearch } from "@/components/store/global-store-search";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart, useCartActions } from "@/contexts/cart-context";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const StoreHeader = () => {
  const t = useTranslations("store");
  const { state } = useCart();
  const { toggleCart } = useCartActions();
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale as string;
  const businessId = params.businessId as string;

  const isBusinessPage = pathname?.includes(`/store/${businessId}`);
  const session = authClient.useSession();
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl">
      <div className="border-b border-border/50">
        <div className="pgtx">
          <div className="flex h-12 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link
                className="text-sm font-semibold text-foreground"
                href={`/${locale}/store`}
              >
                {t("brand")} Store
              </Link>
            </div>
            <nav className="hidden md:flex items-center gap-4">
              <Link
                className={cn(
                  "text-xs hover:text-foreground transition",
                  pathname === `/${locale}/store`
                    ? "text-foreground font-medium"
                    : "text-text-secondary",
                )}
                href={`/${locale}/store`}
              >
                Stores
              </Link>
              <Link
                className={cn(
                  "text-xs hover:text-foreground transition",
                  pathname?.startsWith(`/${locale}/store/orders`)
                    ? "text-foreground font-medium"
                    : "text-text-secondary",
                )}
                href={`/${locale}/store/orders/track`}
              >
                {t("trackOrder")}
              </Link>
              {session.data?.user.businessId ? (
                <Link
                  className={cn(
                    "text-xs hover:text-foreground transition",
                    "text-text-secondary",
                  )}
                  href={`/${locale}/commerce`}
                >
                  Manage
                </Link>
              ) : null}
            </nav>

            <div className="flex items-center gap-3">
              <div className="flex-1 max-w-xs mx-4">
                <GlobalStoreSearch />
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
      </div>

      {isBusinessPage && businessId && (
        <div className="border-b border-border/50">
          <div className="pgtx">
            <div className="flex h-12 items-center">
              <nav className="flex items-center gap-4">
                <div className="flex items-center gap-4">
                  <Link
                    className={cn(
                      "text-xs hover:text-foreground transition",
                      pathname === `/${locale}/store/${businessId}`
                        ? "text-foreground font-medium"
                        : "text-text-secondary",
                    )}
                    href={`/${locale}/store/${businessId}`}
                  >
                    {t("home")}
                  </Link>
                  <Link
                    className={cn(
                      "text-xs hover:text-foreground transition",
                      pathname?.startsWith(
                        `/${locale}/store/${businessId}/products`,
                      )
                        ? "text-foreground font-medium"
                        : "text-text-secondary",
                    )}
                    href={`/${locale}/store/${businessId}/products`}
                  >
                    {t("products")}
                  </Link>
                  <Link
                    className={cn(
                      "text-xs hover:text-foreground transition",
                      pathname?.startsWith(
                        `/${locale}/store/${businessId}/categories`,
                      )
                        ? "text-foreground font-medium"
                        : "text-text-secondary",
                    )}
                    href={`/${locale}/store/${businessId}/categories`}
                  >
                    {t("categories")}
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}

      {state.isOpen && <CartSidebar />}
    </nav>
  );
};

export default StoreHeader;
