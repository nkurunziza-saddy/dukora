"use client";

import {
  ChevronsUpDownIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { memo, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Menu,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { authClient, useSession } from "@/lib/auth-client";
import { useUserData } from "@/lib/hooks/use-queries";
import { SessionCardError } from "./session-card-error";
import { SessionCardSkeleton } from "./session-card-skeleton";

const SessionCard = memo(() => {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const {
    data: sessionData,
    isPending: sessionPending,
    error: sessionError,
  } = useSession();
  const t = useTranslations("common");
  const shouldFetch = Boolean(sessionData?.user?.id);

  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
  } = useUserData(sessionData?.user?.id || null);

  const computedData = useMemo(() => {
    const user = userData || sessionData?.user;
    const business = userData?.business;

    if (!user) return null;

    return {
      businessName: business?.name || "Personal Account",
      userName: user.name || user.email || "User",
      userImage: user.image || "",
      userId: user.id || "",
      userRole: user.role || "",
      userInitials: (user.name || user.email || "U")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    };
  }, [userData, sessionData]);

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth/sign-in");
        },
      },
    });
  };

  if (sessionPending || (shouldFetch && userLoading && !userData)) {
    return <SessionCardSkeleton />;
  }

  if (sessionError || userError || !computedData) {
    return <SessionCardError />;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Menu>
          <MenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar className="size-8 rounded-lg">
              <AvatarImage
                src={computedData.userImage || "/placeholder.svg"}
                alt={`${computedData.userName} avatar`}
                loading="lazy"
              />
              <AvatarFallback className="rounded-lg text-xs font-medium">
                {computedData.userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">
                {computedData.userName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {computedData.businessName}
              </p>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4" />
          </MenuTrigger>
          <MenuPopup
            className="min-w-64 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={8}
          >
            <MenuGroup>
              <MenuGroupLabel className="p-3">
                <div className="flex items-start gap-3">
                  <Avatar className="rounded-lg h-10 w-10">
                    <AvatarImage
                      src={computedData.userImage || "/placeholder.svg"}
                      alt={`${computedData.userName} avatar`}
                      loading="lazy"
                    />
                    <AvatarFallback className="rounded-lg text-xs font-medium">
                      {computedData.userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {computedData.userName}
                    </p>
                    <p className="text-xs text-muted-foreground leading-none">
                      {computedData.businessName}
                    </p>
                    <p className="text-xs text-muted-foreground leading-none">
                      {computedData.userRole.charAt(0).toUpperCase() +
                        computedData.userRole.slice(1).toLowerCase()}
                    </p>
                  </div>
                </div>
              </MenuGroupLabel>

              <MenuSeparator />

              <div className="p-1">
                <MenuItem
                  render={
                    <Link
                      href={`/users/${computedData.userId}`}
                      className="cursor-pointer"
                    />
                  }
                >
                  <UserIcon className="size-3.5" />
                  <span>{t("profile")}</span>
                </MenuItem>

                <MenuItem
                  render={<Link href="/settings" className="cursor-pointer" />}
                >
                  <SettingsIcon className="size-3.5" />
                  <span>{t("settings")}</span>
                </MenuItem>
              </div>

              <MenuSeparator />

              <div className="p-1">
                <MenuItem onClick={handleLogout} variant="destructive">
                  <LogOutIcon className="size-3.5" />
                  <span>{t("signOut")}</span>
                </MenuItem>
              </div>
            </MenuGroup>
          </MenuPopup>
        </Menu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
});

SessionCard.displayName = "SessionCard";

export default SessionCard;
