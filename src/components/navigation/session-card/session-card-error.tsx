import { memo } from "react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const SessionCardError = memo(() => (
  <SidebarMenu>
    <SidebarMenuItem>
      <SidebarMenuButton
        size="lg"
        className="cursor-default hover:bg-transparent opacity-50"
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Unable to load</p>
          <p className="text-xs text-muted-foreground">Session error</p>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  </SidebarMenu>
));

SessionCardError.displayName = "SessionCardError";

export { SessionCardError };
