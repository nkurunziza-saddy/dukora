"use client";

import {
  BarChart3,
  Bot,
  Calendar,
  CreditCard,
  Frame,
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
import Link from "next/link";

const data = {
  navMain: [
    {
      title: "Dashboard",
      items: [
        {
          title: "Inventory Overview",
          url: "/",
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
          title: "Analytics & AI",
          url: "/analytics",
          icon: BarChart3,
        },
        {
          title: "Payments & Invoices",
          url: "/payments",
          icon: CreditCard,
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
          url: "/ecommerce",
          icon: Store,
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
        },
      ],
    },
  ],
};

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <div className="p-1 round bg-primary text-primary-foreground">
            <Frame className="size-3" />
          </div>
          <span className="font-semibold text-base">Quantra</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 text-xs text-muted-foreground">
          © 2025 Inventory Pro
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
