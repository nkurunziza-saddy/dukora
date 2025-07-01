"use client";

import {
  ArrowRightLeft,
  BarChart3,
  Bot,
  Calendar,
  CreditCard,
  Frame,
  Layers,
  Package,
  ShoppingCart,
  Store,
  Truck,
  Users,
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
import { useTranslations } from "next-intl";

const data = {
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
          disabled: true,
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
      title: "Assistant",
      items: [
        {
          title: "AI Chat",
          url: "/chat",
          icon: Bot,
          disabled: true,
        },
      ],
    },
    {
      title: "Helpers",
      items: [
        {
          title: "Financial calculator",
          url: "/financial-calculator",
          icon: Bot,
          disabled: true,
        },
      ],
    },
  ],
};

export function AppSidebar() {
  const t = useTranslations("navigation");
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <div className="p-1 round bg-primary text-primary-foreground">
            <Frame className="size-3" />
          </div>
          <span className="font-semibold text-base">quantura</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const url = item.url.slice(1);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild disabled={item.disabled}>
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{t(url)}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 text-xs text-muted-foreground">© 2025 quantura</div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
