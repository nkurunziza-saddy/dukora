import { Skeleton } from "../ui/skeleton";

export function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div className="flex items-center space-x-4" key={`list-item-${i}`}>
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[160px]" />
          </div>
        </div>
      ))}
    </div>
  );
}
