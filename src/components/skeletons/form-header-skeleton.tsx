import { Skeleton } from "@/components/ui/skeleton";

export function FormHeaderSkeleton() {
  return (
    <div>
      <Skeleton className="h-8 w-1/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
