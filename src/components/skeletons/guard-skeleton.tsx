import { Skeleton } from "../ui/skeleton";

export function GuardSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="space-y-4">
        <Skeleton className="h-8 w-32 mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
    </div>
  );
}
