"use client";

import {
  Briefcase,
  ChevronsUpDown,
  Frame,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { memo, useMemo } from "react";
import useSWR from "swr";
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
import { Skeleton } from "@/components/ui/skeleton";
import { authClient, useSession } from "@/lib/auth-client";
import type { SelectBusiness, SelectUser } from "@/lib/schema/schema-types";
import { fetcher } from "@/lib/utils";

type UserPayload = SelectUser & {
  business: SelectBusiness;
};

const SessionCardSkeleton = memo(() => (
  <div className="flex h-16 items-center justify-between">
    <div className="flex items-center gap-2 p-2">
      <Skeleton className="h-5 w-5 rounded" />
      <div className="flex flex-col">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-2 w-20" />
      </div>
    </div>
    <Skeleton className="size-6 rounded-lg" />
  </div>
));

SessionCardSkeleton.displayName = "SessionCardSkeleton";

const SessionCardError = memo(() => (
  <div className="flex h-16 items-center justify-between opacity-50">
    <div className="flex items-center gap-2 p-2">
      <div className="p-1 rounded bg-muted">
        <Frame className="size-3" />
      </div>
      <span className="text-sm text-muted-foreground">Unable to load</span>
    </div>
    <Avatar className="rounded-lg">
      <AvatarFallback>
        <User className="size-3" />
      </AvatarFallback>
    </Avatar>
  </div>
));

SessionCardError.displayName = "SessionCardError";

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
  const userApiKey = shouldFetch ? `/api/users/${sessionData?.user?.id}` : null;

  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
  } = useSWR<UserPayload>(userApiKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 0,
    dedupingInterval: 300000,
    revalidateIfStale: true,
    keepPreviousData: true,
    errorRetryCount: 2,
    errorRetryInterval: 1000,
  });

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
            <div className="bg-muted text-xs font-medium text-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <Briefcase className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">
                {computedData.userName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {computedData.businessName}
              </p>
            </div>
            <ChevronsUpDown className="ml-auto" />
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
                <MenuItem>
                  <Link
                    href={`/users/${computedData.userId}`}
                    className="flex items-center cursor-pointer"
                  >
                    <User className="mr-3 h-4 w-4" />
                    <span>{t("profile")}</span>
                  </Link>
                </MenuItem>

                <MenuItem>
                  <Link
                    href="/settings"
                    className="flex items-center cursor-pointer"
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    <span>{t("settings")}</span>
                  </Link>
                </MenuItem>
              </div>

              <MenuSeparator />

              <div className="p-1">
                <MenuItem onClick={handleLogout} variant="destructive">
                  <LogOut className="mr-3 h-4 w-4" />
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
