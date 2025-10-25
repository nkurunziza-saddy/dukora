import { Skeleton } from "@/components/ui/skeleton";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { memo } from "react";

const SessionCardSkeleton = memo(() => (
  <SidebarMenu>
    <SidebarMenuItem>
      <SidebarMenuButton
        size="lg"
        className="cursor-default hover:bg-transparent"
      >
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="ml-auto size-4" />
      </SidebarMenuButton>
    </SidebarMenuItem>
  </SidebarMenu>
));

SessionCardSkeleton.displayName = "SessionCardSkeleton";

export { SessionCardSkeleton };
