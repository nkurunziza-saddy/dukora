import { Skeleton } from "@/components/ui/skeleton";
import { memo } from "react";

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

export { SessionCardSkeleton };
