import type { UIMessage } from "ai";
import type { ComponentProps, HTMLAttributes } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: UIMessage["role"];
};
export const Message = ({ className, from, ...props }: MessageProps) => (
  <div
    className={cn(
      "group flex w-full items-end justify-end gap-3 py-2",
      from === "user" ? "is-user" : "is-assistant flex-row-reverse justify-end",
      "[&>div]:max-w-[80%]",
      className
    )}
    {...props}
  />
);
export type MessageContentProps = HTMLAttributes<HTMLDivElement>;
export const MessageContent = ({
  children,
  className,
  ...props
}: MessageContentProps) => (
  <div
    className={cn(
      "flex flex-col gap-2 overflow-hidden border px-3 py-2 text-foreground text-sm rounded-lg",
      "group-[.is-user]:bg-muted/40  group-[.is-user]:text-primary-foreground group-[.is-user]:border-muted/60 group-[.is-user]:shadow-sm",
      "group-[.is-assistant]:bg-secondary group-[.is-assistant]:text-foreground group-[.is-assistant]:border-border group-[.is-assistant]:shadow-sm",
      "transition-all duration-200 hover:shadow-md",
      className
    )}
    {...props}
  >
    <div className="is-user:dark">{children}</div>
  </div>
);
export type MessageAvatarProps = ComponentProps<typeof Avatar> & {
  src: string;
  name?: string;
};
export const MessageAvatar = ({
  src,
  name,
  className,
  ...props
}: MessageAvatarProps) => (
  <Avatar
    className={cn("size-7 border border-border shadow-sm", className)}
    {...props}
  >
    <AvatarImage alt="" className="mt-0 mb-0" src={src || "/placeholder.svg"} />
    <AvatarFallback className="bg-muted text-muted-foreground font-medium">
      {name?.slice(0, 2) || "ME"}
    </AvatarFallback>
  </Avatar>
);
