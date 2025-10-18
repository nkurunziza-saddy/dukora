import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Frame, User } from "lucide-react";
import { memo } from "react";

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
export { SessionCardError };
