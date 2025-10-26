import { Skeleton } from "../ui/skeleton";

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-8 p-4">
      <div className="flex items-center justify-between">
        <div className="">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div className="space-y-2" key={`analytics-card-${i}`}>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}
