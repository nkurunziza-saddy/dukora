import type React from "react";
import { AppSidebar } from "@/components/navigation/app-sidebar";
import QuickActions from "@/components/quick-actions";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { CurrentPage } from "../navigation/current-page";
import { RefreshButton } from "../refresh-button";

const SidebarContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex justify-between items-center w-full px-4">
            <div className="flex items-center gap-2 ">
              <SidebarTrigger className="my-0" />
              <Separator
                orientation="vertical"
                className="mr-2 my-auto data-[orientation=vertical]:h-4"
              />
              <CurrentPage />
            </div>
            <div className="flex gap-2">
              <QuickActions />
              <RefreshButton />
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SidebarContainer;
