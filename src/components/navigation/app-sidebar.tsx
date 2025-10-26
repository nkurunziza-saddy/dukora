"use client";

import {
  ArrowRightLeftIcon,
  BarChart3Icon,
  BotIcon,
  CalculatorIcon,
  CalendarIcon,
  CreditCardIcon,
  LayersIcon,
  PackageIcon,
  ShoppingCartIcon,
  StoreIcon,
  TruckIcon,
  UsersIcon,
  WarehouseIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import SessionCard from "./session-card";

export const data = {
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
          disabled: true,
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
          disabled: true,
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

export function AppSidebar() {
  const t = useTranslations("navigation");
  const pathname = usePathname();
  const locale = useLocale();
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <SessionCard />
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{t(group.title)}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === `/${locale}${item.url}`;
                  return (
                    <SidebarMenuItem key={item.id}>
                      {item.disabled ? (
                        <SidebarMenuButton disabled>
                          {/* <item.icon className="h-4 w-4" /> */}
                          <span className="opacity-50">{t(item.id)}</span>
                        </SidebarMenuButton>
                      ) : (
                        <SidebarMenuButton
                          render={<Link href={item.url} />}
                          variant={isActive ? "active" : undefined}
                        >
                          {/* <item.icon className="h-4 w-4" /> */}
                          <span>{t(item.id)}</span>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 text-xs text-muted-foreground">© 2025 dukora</div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
