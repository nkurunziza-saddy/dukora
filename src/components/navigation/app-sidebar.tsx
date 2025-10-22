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
      title: "Dashboard",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayersIcon,
        },
        {
          title: "Inventory Overview",
          url: "/inventory",
          icon: WarehouseIcon,
        },
        {
          title: "Product Catalog",
          url: "/products",
          icon: PackageIcon,
        },
        {
          title: "Supplier Management",
          url: "/suppliers",
          icon: TruckIcon,
        },
        {
          title: "Business transactions",
          url: "/transactions",
          icon: ArrowRightLeftIcon,
        },
      ],
    },
    {
      title: "Operations",
      items: [
        {
          title: "Sales Tracking",
          url: "/sales",
          icon: ShoppingCartIcon,
        },
        {
          title: "Analytics",
          url: "/analytics",
          icon: BarChart3Icon,
        },
        {
          title: "Payments & Invoices",
          url: "/payments",
          icon: CreditCardIcon,
          disabled: true,
        },
      ],
    },
    {
      title: "Management",
      items: [
        {
          title: "Users & Permissions",
          url: "/users",
          icon: UsersIcon,
        },

        {
          title: "Scheduler",
          url: "/scheduler",
          icon: CalendarIcon,
        },
        {
          title: "E-commerce Sync",
          url: "/commerce",
          icon: StoreIcon,
          disabled: true,
        },
      ],
    },
    {
      title: "Tools",
      items: [
        {
          title: "AI Chat",
          url: "/ai-chat",
          icon: BotIcon,
        },
        {
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
                  const url = item.url.slice(1);
                  const isActive = pathname === `/${locale}${item.url}`;
                  return (
                    <SidebarMenuItem key={item.title}>
                      {item.disabled ? (
                        <SidebarMenuButton disabled>
                          {/* <item.icon className="h-4 w-4" /> */}
                          <span className="opacity-50">{t(url)}</span>
                        </SidebarMenuButton>
                      ) : (
                        <SidebarMenuButton
                          render={<Link href={item.url} />}
                          variant={isActive ? "active" : undefined}
                        >
                          {/* <item.icon className="h-4 w-4" /> */}
                          <span>{t(url)}</span>
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
