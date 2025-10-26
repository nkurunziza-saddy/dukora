import { Skeleton } from "../ui/skeleton";

export function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}
