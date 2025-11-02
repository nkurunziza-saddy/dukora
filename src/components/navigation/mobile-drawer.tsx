"use client";

import {
  ArrowRightLeftIcon,
  BarChart3Icon,
  BotIcon,
  CalculatorIcon,
  CalendarIcon,
  CreditCardIcon,
  LayersIcon,
  MenuIcon,
  PackageIcon,
  ShoppingCartIcon,
  StoreIcon,
  TruckIcon,
  UsersIcon,
  WarehouseIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerOverlay,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import SessionCard from "./session-card";

const mobileNavData = {
  navMain: [
    {
      title: "main",
      items: [
        {
          id: "dashboard",
          title: "Dashboard",
          url: "/dashboard",
          icon: LayersIcon,
        },
        {
          id: "inventory",
          title: "Inventory Overview",
          url: "/inventory",
          icon: WarehouseIcon,
        },
        {
          id: "products",
          title: "Product Catalog",
          url: "/products",
          icon: PackageIcon,
        },
        {
          id: "suppliers",
          title: "Supplier Management",
          url: "/suppliers",
          icon: TruckIcon,
        },
        {
          id: "transactions",
          title: "Business transactions",
          url: "/transactions",
          icon: ArrowRightLeftIcon,
        },
      ],
    },
    {
      title: "operations",
      items: [
        {
          id: "sales",
          title: "Sales Tracking",
          url: "/sales",
          icon: ShoppingCartIcon,
        },
        {
          id: "analytics",
          title: "Analytics",
          url: "/analytics",
          icon: BarChart3Icon,
        },
        {
          id: "payments",
          title: "Payments & Invoices",
          url: "/payments",
          icon: CreditCardIcon,
        },
      ],
    },
    {
      title: "management",
      items: [
        {
          id: "users",
          title: "Users & Permissions",
          url: "/users",
          icon: UsersIcon,
        },
        {
          id: "scheduler",
          title: "Scheduler",
          url: "/scheduler",
          icon: CalendarIcon,
        },
        {
          id: "commerce",
          title: "E-commerce Sync",
          url: "/commerce",
          icon: StoreIcon,
        },
      ],
    },
    {
      title: "tools",
      items: [
        {
          id: "aiChat",
          title: "AI Chat",
          url: "/ai-chat",
          icon: BotIcon,
        },
        {
          id: "financialCalculator",
          title: "Financial calculator",
          url: "/financial-calculator",
          icon: CalculatorIcon,
        },
      ],
    },
  ],
};

export function MobileDrawer() {
  const t = useTranslations("navigation");
  const pathname = usePathname();
  const locale = useLocale();

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="md:hidden" size="icon" variant="ghost">
          <MenuIcon className="h-5 w-5" />
          <span className="sr-only">Open navigation menu</span>
        </Button>
      </DrawerTrigger>
      <DrawerOverlay />
      <DrawerContent className="h-full w-full max-w-sm">
        <DrawerHeader className="flex flex-row items-center justify-between">
          <div>
            <DrawerTitle>Dukora</DrawerTitle>
            <DrawerDescription>Navigation Menu</DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button size="icon" variant="ghost">
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Close navigation</span>
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-6">
            <SessionCard />
          </div>

          <nav className="space-y-6">
            {mobileNavData.navMain.map((group) => (
              <div key={group.title}>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  {t(group.title)}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === `/${locale}${item.url}`;
                    const isDisabled = "disabled" in item && item.disabled;

                    return (
                      <Link
                        aria-current={isActive ? "page" : undefined}
                        aria-disabled={isDisabled ? true : undefined}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : isDisabled
                              ? "text-muted-foreground cursor-not-allowed"
                              : "hover:bg-accent hover:text-accent-foreground"
                        }`}
                        href={isDisabled ? "#" : item.url}
                        key={item.id}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{t(item.id)}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="border-t p-4">
          <p className="text-xs text-muted-foreground">© 2025 dukora</p>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
