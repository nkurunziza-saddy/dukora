"use client";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
export type ActionsProps = ComponentProps<"div">;
export const Actions = ({ className, children, ...props }: ActionsProps) => (
  <div className={cn("flex items-center gap-1", className)} {...props}>
    {children}
  </div>
);
export type ActionProps = ComponentProps<typeof Button> & {
  tooltip?: string;
  label?: string;
};
export const Action = ({
  tooltip,
  children,
  label,
  className,
  variant = "ghost",
  size = "icon-sm",
  ...props
}: ActionProps) => {
  const content = (
    <>
      {children}
      <span className="sr-only">{label || tooltip}</span>
    </>
  );
  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                className={cn(
                  "text-muted-foreground hover:text-foreground transition-colors",
                  "hover:bg-muted/50 focus:bg-muted/50",
                  className
                )}
                size={size}
                type="button"
                variant={variant}
                {...props}
              />
            }
          >
            {content}
          </TooltipTrigger>
          <TooltipPopup>
            <p>{tooltip}</p>
          </TooltipPopup>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return (
    <Button
      className={cn(
        "text-muted-foreground hover:text-foreground transition-colors",
        "hover:bg-muted/50 focus:bg-muted/50",
        className
      )}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {content}
    </Button>
  );
};
