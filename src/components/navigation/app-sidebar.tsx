"use client";

import {
  ArrowRightLeft,
  BarChart3,
  Bot,
  Calendar,
  CreditCard,
  Layers,
  Package,
  ShoppingCart,
  Store,
  Truck,
  Users,
  Calculator,
  Warehouse,
} from "lucide-react";
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
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import SessionCard from "./session-card";

export const data = {
  navMain: [
    {
      title: "Dashboard",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: Layers,
        },
        {
          title: "Inventory Overview",
          url: "/inventory",
          icon: Warehouse,
        },
        {
          title: "Product Catalog",
          url: "/products",
          icon: Package,
        },
        {
          title: "Supplier Management",
          url: "/suppliers",
          icon: Truck,
        },
        {
          title: "Business transactions",
          url: "/transactions",
          icon: ArrowRightLeft,
        },
      ],
    },
    {
      title: "Operations",
      items: [
        {
          title: "Sales Tracking",
          url: "/sales",
          icon: ShoppingCart,
        },
        {
          title: "Analytics",
          url: "/analytics",
          icon: BarChart3,
        },
        {
          title: "Payments & Invoices",
          url: "/payments",
          icon: CreditCard,
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
          icon: Users,
        },

        {
          title: "Scheduler",
          url: "/scheduler",
          icon: Calendar,
        },
        {
          title: "E-commerce Sync",
          url: "/commerce",
          icon: Store,
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
          icon: Bot,
        },
        {
          title: "Financial calculator",
          url: "/financial-calculator",
          icon: Calculator,
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
                        <Link href={item.url}>
                          <SidebarMenuButton
                            asChild
                            variant={isActive ? "active" : undefined}
                          >
                            {/* <item.icon className="h-4 w-4" /> */}
                            <span>{t(url)}</span>
                          </SidebarMenuButton>
                        </Link>
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
