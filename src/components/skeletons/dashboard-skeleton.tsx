import { Skeleton } from "../ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
        <Skeleton className="aspect-video" />
        <Skeleton className="aspect-video" />
        <Skeleton className="aspect-video" />
        <Skeleton className="aspect-video" />
      </div>
      <Skeleton className="min-h-[40] flex-1 md:min-h-min" />
      <Skeleton className="min-h-[40] mt-2 flex-1 md:min-h-min" />
    </div>
  );
}
