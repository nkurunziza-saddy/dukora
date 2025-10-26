import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export function AcceptInvitationSkeleton() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-7 w-48" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4 mt-1" />
        </CardDescription>
      </CardHeader>
      <CardPanel className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardPanel>
    </Card>
  );
}
