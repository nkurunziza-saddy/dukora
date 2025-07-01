"use client";

import { memo, useMemo } from "react";
import { Frame, User } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import type { SelectBusiness, SelectUser } from "@/lib/schema/schema-types";

type UserPayload = SelectUser & {
  business: SelectBusiness;
};

const SessionCardSkeleton = memo(() => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 p-2">
      <Skeleton className="h-5 w-5 rounded" />
      <Skeleton className="h-4 w-24" />
    </div>
    <Skeleton className="h-8 w-8 rounded-lg" />
  </div>
));

SessionCardSkeleton.displayName = "SessionCardSkeleton";

const SessionCardError = memo(() => (
  <div className="flex items-center justify-between opacity-50">
    <div className="flex items-center gap-2 p-2">
      <div className="p-1 rounded bg-muted">
        <Frame className="size-3" />
      </div>
      <span className="text-sm text-muted-foreground">Unable to load</span>
    </div>
    <Avatar className="rounded-lg">
      <AvatarFallback>
        <User className="size-4" />
      </AvatarFallback>
    </Avatar>
  </div>
));

SessionCardError.displayName = "SessionCardError";

const SessionCard = memo(() => {
  const {
    data: sessionData,
    isPending: sessionPending,
    error: sessionError,
  } = useSession();

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
      userImage: user.image || user.image,
      userInitials: (user.name || user.email || "U")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    };
  }, [userData, sessionData]);

  if (sessionPending || (shouldFetch && userLoading && !userData)) {
    return <SessionCardSkeleton />;
  }

  if (sessionError || userError || !computedData) {
    return <SessionCardError />;
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 p-2">
        <div className="p-1 rounded bg-primary text-primary-foreground">
          <Frame className="size-3" />
        </div>
        <span className="font-semibold text-base truncate max-w-32">
          {computedData.businessName}
        </span>
      </div>

      <Avatar className="rounded-lg">
        <AvatarImage
          src={computedData.userImage || "/placeholder.svg"}
          alt={`${computedData.userName} avatar`}
          loading="lazy"
        />
        <AvatarFallback className="text-xs">
          {computedData.userInitials}
        </AvatarFallback>
      </Avatar>
    </div>
  );
});

SessionCard.displayName = "SessionCard";

export default SessionCard;
